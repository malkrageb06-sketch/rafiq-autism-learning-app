import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

type RecommendedModule = 'none' | 'colors' | 'shapes' | 'numbers' | 'emotions';

interface RafiqApiPayload {
  answer: string;
  recommendedModule: RecommendedModule;
  visualCards: { emoji: string; label: string; bg: string }[];
}

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

const VALID_MODULES: RecommendedModule[] = ['none', 'colors', 'shapes', 'numbers', 'emotions'];
const askRafiqCache = new Map<string, RafiqApiPayload>();
const MAX_ASK_CACHE = 150;

const SYSTEM_INSTRUCTION = `أنت "رفيق"، مساعد ذكي لطيف للأطفال (٤–١٠ سنوات).
قواعد صارمة:
1. أجب باللغة العربية الفصحى البسيطة فقط (يُمنع أي كلمة أو حرف إنجليزي).
2. أجب إجابة مباشرة ومختصرة جداً بحد أقصى ٤٠ إلى ٥٠ كلمة.
3. أجب على سؤال الطفل الفعلي أولاً (مثل: عاصمة مصر هي القاهرة، عدد أيام الأسبوع ٧ أيام)، ثم أضف جملة تشجيعية قصيرة اختيارية.
4. اجعل recommendedModule يساوي "none" في أسئلة المعرفة العامة، واختر ("colors" أو "shapes" أو "numbers" أو "emotions") فقط إذا طلب الطفل درساً منها.
5. اجعل visualCards مصفوفة فارغة [] إلا عند الحاجة الضرورية (حد أقصى بطاقتان).`;

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readBody(req: VercelRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return await new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

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

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);
  const rawQuestion = typeof body.question === 'string' ? body.question.trim() : '';

  if (!rawQuestion) {
    sendJson(res, 400, { error: 'يرجى كتابة سؤالك أولاً يا بطل.' });
    return;
  }

  if (rawQuestion.length > 500) {
    sendJson(res, 400, { error: 'السؤال طويل جداً، حاول كتابته بشكل أقصر.' });
    return;
  }

  const cacheKey = normalizeCacheKey(rawQuestion);
  const cachedReply = askRafiqCache.get(cacheKey);
  if (cachedReply) {
    sendJson(res, 200, { ...cachedReply, cached: true });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    sendJson(res, 503, {
      error: 'لم يتم العثور على مفتاح Gemini API في إعدادات الخادم.',
    });
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 15000 },
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: rawQuestion }] }],
      config: {
        abortSignal: AbortSignal.timeout(12000),
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        maxOutputTokens: 160,
        responseMimeType: 'application/json',
        responseSchema: {
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
        },
      },
    });

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
      sendJson(res, 502, { error: 'لم يتمكن رفيق من صياغة إجابة الآن، حاول مرة أخرى.' });
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

    const payload: RafiqApiPayload = { answer, recommendedModule, visualCards };
    if (askRafiqCache.size >= MAX_ASK_CACHE) {
      const firstKey = askRafiqCache.keys().next().value;
      if (firstKey) askRafiqCache.delete(firstKey);
    }
    askRafiqCache.set(cacheKey, payload);
    sendJson(res, 200, payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      sendJson(res, 429, {
        error: 'تم تجاوز حد الطلبات المؤقت. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
      });
      return;
    }
    sendJson(res, 500, {
      error: 'حدث خطأ مؤقت أثناء التواصل مع رفيق الذكي. يرجى المحاولة مرة أخرى.',
    });
  }
}
