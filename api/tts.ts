import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

const ttsCache = new Map<string, string>();
const MAX_TTS_CACHE = 250;

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

function sanitizeTextForArabicTts(input: string): string {
  return input
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, ' ')
    .replace(/[·|•✅🎉🌟⭐💙]/g, '، ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);
  const rawText = typeof body.text === 'string' ? body.text : '';
  const cleaned = sanitizeTextForArabicTts(rawText);

  if (!cleaned) {
    sendJson(res, 400, { error: 'لا يوجد نص لقراءته.' });
    return;
  }

  const clipped = cleaned.slice(0, 600);
  const cached = ttsCache.get(clipped);
  if (cached) {
    sendJson(res, 200, { audioBase64: cached, mimeType: 'audio/wav' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    sendJson(res, 503, { error: 'خدمة النطق الصوتي تتطلب إعداد مفتاح Gemini API.' });
    return;
  }

  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 15000 } });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: clipped,
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
    if (!base64Audio) {
      sendJson(res, 502, { error: 'تعذر توليد الصوت العربي الآن.' });
      return;
    }

    if (ttsCache.size >= MAX_TTS_CACHE) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(clipped, base64Audio);
    sendJson(res, 200, { audioBase64: base64Audio, mimeType: 'audio/wav' });
  } catch {
    sendJson(res, 500, { error: 'تعذر توليد الصوت العربي الآن.' });
  }
}
