import 'dotenv/config';
import dns from 'dns';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

type RecommendedModule = 'none' | 'colors' | 'shapes' | 'numbers' | 'emotions';

interface HistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface RafiqApiPayload {
  answer: string;
  recommendedModule: RecommendedModule;
  visualCards: { emoji: string; label: string; bg: string }[];
}

const VALID_MODULES: RecommendedModule[] = ['none', 'colors', 'shapes', 'numbers', 'emotions'];

// In-memory cache for repeated Arabic TTS phrases and AI assistant answers
const ttsCache = new Map<string, string>();
const MAX_TTS_CACHE = 250;

const askRafiqCache = new Map<string, RafiqApiPayload>();
const MAX_ASK_CACHE = 150;

function normalizeCacheKey(text: string): string {
  return text
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[؟?!.,،؛:]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function enforceMaxWords(text: string, maxWords = 50): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(' ')}...`;
}

const SYSTEM_INSTRUCTION = `أنت "رفيق"، مساعد ذكي لطيف للأطفال (٤–١٠ سنوات).
قواعد صارمة:
1. أجب باللغة العربية الفصحى البسيطة فقط (يُمنع أي كلمة أو حرف إنجليزي).
2. أجب إجابة مباشرة ومختصرة جداً بحد أقصى ٤٠ إلى ٥٠ كلمة.
3. أجب على سؤال الطفل الفعلي أولاً (مثل: عاصمة مصر هي القاهرة، عدد أيام الأسبوع ٧ أيام)، ثم أضف جملة تشجيعية قصيرة اختيارية.
4. اجعل recommendedModule يساوي "none" في أسئلة المعرفة العامة، واختر ("colors" أو "shapes" أو "numbers" أو "emotions") فقط إذا طلب الطفل درساً منها.
5. اجعل visualCards مصفوفة فارغة [] إلا عند الحاجة الضرورية (حد أقصى بطاقتان).`;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 15000,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sanitizeTextForArabicTts(input: string): string {
  // Remove emojis and decorative symbols so TTS reads Arabic cleanly and naturally
  return input
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, ' ')
    .replace(/[·|•✅🎉🌟⭐💙]/g, '، ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function generateRafiqAnswer(ai: GoogleGenAI, question: string) {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      answer: {
        type: Type.STRING,
        description:
          'Concise Arabic-only answer for children aged 4-10, strictly 50 words or fewer.',
      },
      recommendedModule: {
        type: Type.STRING,
        description:
          'One of "none", "colors", "shapes", "numbers", "emotions". Use "none" for general knowledge.',
      },
      visualCards: {
        type: Type.ARRAY,
        description: '0 to 2 brief Arabic cards if helpful, else [].',
        items: {
          type: Type.OBJECT,
          properties: {
            emoji: { type: Type.STRING },
            label: { type: Type.STRING },
            bg: { type: Type.STRING },
          },
          required: ['emoji', 'label', 'bg'],
        },
      },
    },
    required: ['answer', 'recommendedModule', 'visualCards'],
  };

  return await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: question }] }],
    config: {
      abortSignal: AbortSignal.timeout(12000),
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      maxOutputTokens: 160,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });
}

async function generateArabicTtsAudio(ai: GoogleGenAI, text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
            speechMetadata: {
              style: 'Warm, gentle, calm, clear Arabic teacher voice for children',
            },
          },
        ],
      },
    ],
    config: {
      abortSignal: AbortSignal.timeout(12000),
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return base64Audio;
  }
  throw new Error('Empty audio payload returned from TTS model');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/tts', async (req, res) => {
    const body = req.body as { text?: unknown } | undefined;
    const rawText = typeof body?.text === 'string' ? body.text : '';
    const cleaned = sanitizeTextForArabicTts(rawText);

    if (!cleaned) {
      res.status(400).json({ error: 'لا يوجد نص لقراءته.' });
      return;
    }

    const clipped = cleaned.slice(0, 600);
    const cached = ttsCache.get(clipped);
    if (cached) {
      res.json({ audioBase64: cached, mimeType: 'audio/wav' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'خدمة النطق الصوتي تتطلب إعداد مفتاح Gemini API.',
      });
      return;
    }

    try {
      const audioBase64 = await generateArabicTtsAudio(ai, clipped);
      if (ttsCache.size >= MAX_TTS_CACHE) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(clipped, audioBase64);
      res.json({ audioBase64, mimeType: 'audio/wav' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Gemini TTS error in /api/tts:', message);
      res.status(500).json({ error: 'تعذر توليد الصوت العربي الآن.' });
    }
  });

  app.post('/api/ask-rafiq', async (req, res) => {
    const body = req.body as { question?: unknown } | undefined;
    const rawQuestion = typeof body?.question === 'string' ? body.question.trim() : '';

    if (!rawQuestion) {
      res.status(400).json({ error: 'يرجى كتابة سؤالك أولاً يا بطل.' });
      return;
    }

    if (rawQuestion.length > 500) {
      res.status(400).json({ error: 'السؤال طويل جداً، حاول كتابته بشكل أقصر.' });
      return;
    }

    const cacheKey = normalizeCacheKey(rawQuestion);
    const cachedReply = askRafiqCache.get(cacheKey);
    if (cachedReply) {
      res.json({ ...cachedReply, cached: true });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'لم يتم العثور على مفتاح Gemini API. يرجى التحقق من إعداده في لوحة Settings > Secrets.',
      });
      return;
    }

    try {
      const response = await generateRafiqAnswer(ai, rawQuestion);
      const rawText = (response.text ?? '').trim();

      let parsed: Partial<RafiqApiPayload> = {};
      try {
        parsed = JSON.parse(rawText) as Partial<RafiqApiPayload>;
      } catch {
        if (rawText) {
          parsed = { answer: rawText, recommendedModule: 'none', visualCards: [] };
        }
      }

      const rawAnswer = typeof parsed.answer === 'string' ? parsed.answer.trim() : '';
      const answer = enforceMaxWords(rawAnswer, 50);
      if (!answer) {
        res.status(502).json({ error: 'لم يتمكن رفيق من صياغة إجابة الآن، حاول مرة أخرى.' });
        return;
      }

      const recommendedModule: RecommendedModule = VALID_MODULES.includes(
        parsed.recommendedModule as RecommendedModule
      )
        ? (parsed.recommendedModule as RecommendedModule)
        : 'none';

      const visualCards = Array.isArray(parsed.visualCards)
        ? parsed.visualCards
            .filter(
              (card): card is { emoji: string; label: string; bg: string } =>
                Boolean(card) &&
                typeof card.emoji === 'string' &&
                typeof card.label === 'string' &&
                card.label.trim().length > 0
            )
            .slice(0, 2)
            .map((card) => ({
              emoji: card.emoji,
              label: card.label.trim(),
              bg:
                typeof card.bg === 'string' && /^#[0-9A-Fa-f]{6}$/.test(card.bg)
                  ? card.bg
                  : '#EFF6FF',
            }))
        : [];

      const payload: RafiqApiPayload = {
        answer,
        recommendedModule,
        visualCards,
      };

      if (askRafiqCache.size >= MAX_ASK_CACHE) {
        const firstKey = askRafiqCache.keys().next().value;
        if (firstKey) askRafiqCache.delete(firstKey);
      }
      askRafiqCache.set(cacheKey, payload);

      res.json(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Gemini API error in /api/ask-rafiq:', message);

      if (
        message.includes('API_KEY_INVALID') ||
        message.includes('PERMISSION_DENIED') ||
        message.includes('403')
      ) {
        res.status(403).json({
          error: 'تعذر التحقق من مفتاح Gemini API. يرجى التأكد من صحته في Settings > Secrets.',
        });
        return;
      }

      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
        res.status(429).json({
          error: 'تم تجاوز حد الطلبات المؤقت. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
        });
        return;
      }

      if (message.includes('503') || message.includes('UNAVAILABLE')) {
        res.status(503).json({
          error: 'الخدمة مزدحمة مؤقتاً الآن، اضغط على إعادة المحاولة بعد لحظات.',
        });
        return;
      }

      res.status(500).json({
        error: 'حدث خطأ مؤقت أثناء التواصل مع رفيق الذكي. يرجى المحاولة مرة أخرى.',
      });
    }
  });

  const SYNC_STORE_PATH = path.resolve(__dirname, '.rafiq-cloud-sync.json');
  const cloudSyncStore = new Map<
    string,
    { user: Record<string, unknown>; progress: Record<string, unknown>; syncedAt: string }
  >();

  try {
    if (fs.existsSync(SYNC_STORE_PATH)) {
      const rawStore = fs.readFileSync(SYNC_STORE_PATH, 'utf8');
      const parsedStore = JSON.parse(rawStore) as Record<
        string,
        { user: Record<string, unknown>; progress: Record<string, unknown>; syncedAt: string }
      >;
      Object.entries(parsedStore).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          cloudSyncStore.set(k, v);
        }
      });
    }
  } catch {
    // Ignore initial sync store read issues
  }

  const persistCloudSyncStore = () => {
    try {
      const obj = Object.fromEntries(cloudSyncStore.entries());
      fs.writeFileSync(SYNC_STORE_PATH, JSON.stringify(obj, null, 2), 'utf8');
    } catch {
      // Ignore write errors in read-only environments
    }
  };

  app.get('/api/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, mode: 'online', timestamp: new Date().toISOString() });
  });

  app.get('/api/sync-progress', (req, res) => {
    const syncId = typeof req.query.syncId === 'string' ? req.query.syncId.trim() : '';
    if (!syncId) {
      res.status(400).json({ error: 'Missing syncId' });
      return;
    }
    const entry = cloudSyncStore.get(syncId);
    if (!entry) {
      res.json({ found: false });
      return;
    }
    res.json({ found: true, ...entry });
  });

  app.post('/api/sync-progress', (req, res) => {
    const body = req.body as
      | {
          syncId?: unknown;
          user?: Record<string, unknown>;
          progress?: Record<string, unknown>;
        }
      | undefined;
    const syncId = typeof body?.syncId === 'string' ? body.syncId.trim() : '';
    if (!syncId || !body?.progress || typeof body.progress !== 'object') {
      res.status(400).json({ error: 'بيانات المزامنة غير مكتملة.' });
      return;
    }

    const syncedAt = new Date().toISOString();
    const record = {
      user: body.user && typeof body.user === 'object' ? body.user : {},
      progress: body.progress,
      syncedAt,
    };
    cloudSyncStore.set(syncId, record);
    persistCloudSyncStore();

    res.json({ ok: true, syncedAt });
  });

  app.get('/api/content-manifest', (_req, res) => {
    res.json({
      version: '1.1.0',
      publishedAt: '2026-11-21',
      lessonsCount: 4,
      quizzesCount: 48,
      announcement: 'جميع دروس الألوان والأشكال والأرقام والمشاعر والاختبارات المتدرجة محدثة ومتاحة بدون إنترنت.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rafiq server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
