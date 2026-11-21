import {
  COLORS_DATA,
  EMOTIONS_DATA,
  NUMBERS_DATA,
  SHAPES_DATA,
} from '../data/learningData';
import { ChatVisualCard, ModuleKey } from '../types/rafiq';

export const OFFLINE_GEMINI_REQUIRED_MESSAGE =
  'المساعد الذكي يحتاج إلى اتصال بالإنترنت.';

const AI_RESPONSE_CACHE_KEY = 'rafiq_ai_response_cache_v1';
const MAX_LOCAL_CACHE_ENTRIES = 60;
const DEBOUNCE_WINDOW_MS = 700;

export interface RafiqAssistantReply {
  text: string;
  visualCards?: ChatVisualCard[];
  recommendedModule?: ModuleKey;
  isOfflineNotice?: boolean;
  fromCache?: boolean;
  usedGemini?: boolean;
}

interface AskRafiqServerResponse {
  answer?: string;
  visualCards?: ChatVisualCard[];
  recommendedModule?: ModuleKey | 'none';
  error?: string;
}

interface CachedAiEntry {
  text: string;
  visualCards?: ChatVisualCard[];
  recommendedModule?: ModuleKey;
  hits: number;
  updatedAt: number;
}

const inFlightQuestionRequests = new Map<string, Promise<RafiqAssistantReply>>();
let lastRequestTimestamp = 0;

function normalizeArabicText(text: string): string {
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

function readLocalAiCache(): Record<string, CachedAiEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(AI_RESPONSE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CachedAiEntry>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalAiCache(cache: Record<string, CachedAiEntry>): void {
  if (typeof window === 'undefined') return;
  try {
    const entries = Object.entries(cache);
    if (entries.length > MAX_LOCAL_CACHE_ENTRIES) {
      // Keep the most frequently used / recent entries
      entries.sort((a, b) => b[1].hits * 1000000 + b[1].updatedAt - (a[1].hits * 1000000 + a[1].updatedAt));
      const trimmed = Object.fromEntries(entries.slice(0, MAX_LOCAL_CACHE_ENTRIES));
      localStorage.setItem(AI_RESPONSE_CACHE_KEY, JSON.stringify(trimmed));
      return;
    }
    localStorage.setItem(AI_RESPONSE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore localStorage quota errors
  }
}

function getCachedAiReply(normalizedKey: string): RafiqAssistantReply | null {
  const cache = readLocalAiCache();
  const entry = cache[normalizedKey];
  if (!entry || !entry.text) return null;

  entry.hits = (entry.hits || 1) + 1;
  entry.updatedAt = Date.now();
  cache[normalizedKey] = entry;
  writeLocalAiCache(cache);

  return {
    text: enforceMaxWords(entry.text, 50),
    visualCards: entry.visualCards,
    recommendedModule: entry.recommendedModule,
    fromCache: true,
  };
}

function saveCachedAiReply(normalizedKey: string, reply: RafiqAssistantReply): void {
  if (reply.isOfflineNotice || !reply.text.trim()) return;
  const cache = readLocalAiCache();
  const existing = cache[normalizedKey];
  cache[normalizedKey] = {
    text: enforceMaxWords(reply.text, 50),
    visualCards: reply.visualCards,
    recommendedModule: reply.recommendedModule,
    hits: (existing?.hits || 0) + 1,
    updatedAt: Date.now(),
  };
  writeLocalAiCache(cache);
}

function answerLocalEducationalQuestion(
  question: string,
  reason: 'offline' | 'quota' = 'offline'
): RafiqAssistantReply {
  const norm = normalizeArabicText(question);

  // Exclude general-knowledge counting questions like "كم عدد أيام الأسبوع؟"
  const isGeneralKnowledge =
    /(ايام الاسبوع|عاصم|مصر|السعوديه|كوكب|كواكب|سنه|شهر|شهور|ساعه|دول|عالم|حيوان|قط|قطه|شمس|قمر|طقس|بحر|نهر|جبل)/.test(
      norm
    );

  // 1. Colors (الألوان)
  if (!isGeneralKnowledge || /(قوس قزح|لون|الوان)/.test(norm)) {
    const specificColor = COLORS_DATA.find((c) => {
      const nameNorm = normalizeArabicText(c.name);
      return (
        norm.includes(nameNorm) ||
        (c.id === 'red' && /(تفاح|فراول)/.test(norm)) ||
        (c.id === 'green' && /(شجر|ورق)/.test(norm)) ||
        (c.id === 'blue' && /(سماء|حوت)/.test(norm)) ||
        (c.id === 'yellow' && /(موز|شمس)/.test(norm))
      );
    });

    if (specificColor) {
      return {
        text: enforceMaxWords(
          `اللون ال${specificColor.name}: ${specificColor.description} ومن أمثلته: ${specificColor.exampleLabel.replace('·', 'و')}. 🌟`,
          50
        ),
        visualCards: [
          {
            emoji:
              specificColor.id === 'red'
                ? '🍎'
                : specificColor.id === 'green'
                ? '🌿'
                : specificColor.id === 'blue'
                ? '🐳'
                : '☀️',
            label: `اللون ال${specificColor.name}`,
            bg: specificColor.softBg,
          },
        ],
        recommendedModule: 'colors',
      };
    }

    if (/(لون|الوان|قوس قزح)/.test(norm)) {
      const colorNames = COLORS_DATA.map((c) => c.name).join('، ');
      return {
        text: enforceMaxWords(
          `الألوان الأساسية هي: ${colorNames}. مثل التفاحة الحمراء، الورقة الخضراء، السماء الزرقاء، والشمس الصفراء! 🌈`,
          50
        ),
        visualCards: [
          { emoji: '🍎', label: 'أحمر وأصفر', bg: '#FEF2F2' },
          { emoji: '🌿', label: 'أخضر وأزرق', bg: '#EFF6FF' },
        ],
        recommendedModule: 'colors',
      };
    }
  }

  // 2. Shapes (الأشكال)
  const specificShape = SHAPES_DATA.find((s) => norm.includes(normalizeArabicText(s.name)));
  if (specificShape) {
    return {
      text: enforceMaxWords(
        `الشكل ${specificShape.name} (${specificShape.symbol}): ${specificShape.description} مثل: ${specificShape.exampleLabel.replace('·', 'و')}. 🌟`,
        50
      ),
      visualCards: [{ emoji: specificShape.symbol, label: specificShape.name, bg: specificShape.softBg }],
      recommendedModule: 'shapes',
    };
  }
  if (/(شكل|اشكال|هندسي|اضلاع|زوايا)/.test(norm)) {
    const shapeNames = SHAPES_DATA.map((s) => `${s.name} (${s.symbol})`).join('، ');
    return {
      text: enforceMaxWords(
        `الأشكال الهندسية الجميلة هي: ${shapeNames}. يمكنك مراجعتها في درس الأشكال! 🌟`,
        50
      ),
      visualCards: [
        { emoji: '○', label: 'دائرة ومربع □', bg: '#EFF6FF' },
        { emoji: '△', label: 'مثلث ومستطيل ▭', bg: '#FFFBEB' },
      ],
      recommendedModule: 'shapes',
    };
  }

  // 3. Numbers (الأرقام من ١ إلى ٥)
  if (!isGeneralKnowledge) {
    const specificNumber = NUMBERS_DATA.find(
      (n) =>
        norm.includes(normalizeArabicText(n.name)) ||
        norm.includes(n.arabicDigit) ||
        norm.includes(String(n.value))
    );
    if (specificNumber && /(رقم|ارقام|عد|كم|واحد|اثنان|اثنين|ثلاث|اربع|خمس|[١٢٣٤٥12345])/.test(norm)) {
      return {
        text: enforceMaxWords(
          `الرقم ${specificNumber.arabicDigit} (${specificNumber.name}): مثل ${specificNumber.objectPlural}. هيا نعد معاً! 🌟`,
          50
        ),
        visualCards: [
          {
            emoji: specificNumber.arabicDigit,
            label: specificNumber.objectPlural,
            bg: specificNumber.softBg,
          },
        ],
        recommendedModule: 'numbers',
      };
    }
    if (/(رقم|ارقام|العد|تعلم عد|احسب|اعد)/.test(norm)) {
      const numsList = NUMBERS_DATA.map((n) => `${n.arabicDigit} (${n.name})`).join('، ');
      return {
        text: enforceMaxWords(
          `نتعلم معاً الأرقام من ١ إلى ٥: ${numsList}. افتح درس الأرقام للعد بالصور! 🌟`,
          50
        ),
        visualCards: [
          { emoji: '🍎', label: '١ · ٢ · ٣', bg: '#FEF2F2' },
          { emoji: '🧱', label: '٤ · ٥', bg: '#F0FDF4' },
        ],
        recommendedModule: 'numbers',
      };
    }
  }

  // 4. Emotions (المشاعر)
  const specificEmotion = EMOTIONS_DATA.find((e) => {
    const eNorm = normalizeArabicText(e.name);
    return (
      norm.includes(eNorm) ||
      (e.id === 'happy' && /(فرح|سعاد|ابتسام)/.test(norm)) ||
      (e.id === 'sad' && /(زعل|بكاء|حزن)/.test(norm)) ||
      (e.id === 'worried' && /(خوف|خائف|قلق|توتر)/.test(norm)) ||
      (e.id === 'tired' && /(تعب|نعس|نوم|ارهاق)/.test(norm))
    );
  });
  if (specificEmotion) {
    return {
      text: enforceMaxWords(
        `شعور "${specificEmotion.name}" ${specificEmotion.emoji}: ${specificEmotion.description} نصيحة رفيق: ${specificEmotion.tip}.`,
        50
      ),
      visualCards: [
        { emoji: specificEmotion.emoji, label: specificEmotion.name, bg: specificEmotion.softBg },
      ],
      recommendedModule: 'emotions',
    };
  }
  if (/(شعور|مشاعر|احاسيس|عاطف)/.test(norm)) {
    const emotionsList = EMOTIONS_DATA.map((e) => `${e.name} ${e.emoji}`).join('، ');
    return {
      text: enforceMaxWords(
        `المشاعر التي نتعرف عليها هي: ${emotionsList}. من الجميل أن نعبر عن مشاعرنا بهدوء. 💙`,
        50
      ),
      visualCards: [
        { emoji: '😊', label: 'سعيد ومرتاح', bg: '#F0FDF4' },
        { emoji: '😟', label: 'قلق أو حزين 😢', bg: '#EFF6FF' },
      ],
      recommendedModule: 'emotions',
    };
  }

  // 5. Offline or Quota Exceeded notice without retrying
  if (reason === 'quota') {
    return {
      text: 'وصل المساعد الذكي للحد المؤقت الآن. يمكنك الاستمرار في تعلم الألوان والأشكال والأرقام والمشاعر من الدروس والاختبارات المحلية!',
      isOfflineNotice: true,
    };
  }

  return {
    text: OFFLINE_GEMINI_REQUIRED_MESSAGE,
    isOfflineNotice: true,
  };
}

/**
 * Optimized AI Assistant service (used ONLY inside اسأل رفيق):
 * - Checks localStorage cache first (0 API calls for repeated questions)
 * - Debounces & deduplicates concurrent clicks
 * - Sends ONLY the current question (no conversation history)
 * - Falls back immediately to local educational responses when offline or quota exceeded (no retries)
 */
export async function askRafiqAssistant(
  question: string,
  isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
): Promise<RafiqAssistantReply> {
  const cleanQuestion = question.trim();
  const cacheKey = normalizeArabicText(cleanQuestion);

  // 1. If offline, Gemini AI requires internet connection
  if (!isOnline) {
    return {
      text: OFFLINE_GEMINI_REQUIRED_MESSAGE,
      isOfflineNotice: true,
    };
  }

  // 2. Check localStorage cache first when online (saves tokens for repeated questions)
  const cached = getCachedAiReply(cacheKey);
  if (cached) {
    return cached;
  }

  // 3. Deduplicate in-flight requests for the same question
  const existingFlight = inFlightQuestionRequests.get(cacheKey);
  if (existingFlight) {
    return existingFlight;
  }

  // 4. Debounce rapid repeated clicks within 700ms
  const now = Date.now();
  if (now - lastRequestTimestamp < DEBOUNCE_WINDOW_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, DEBOUNCE_WINDOW_MS - (now - lastRequestTimestamp))
    );
  }
  lastRequestTimestamp = Date.now();

  const requestPromise = (async (): Promise<RafiqAssistantReply> => {
    try {
      // Send ONLY the current question (no conversation history)
      const response = await fetch('/api/ask-rafiq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: cleanQuestion }),
      });

      let data: AskRafiqServerResponse = {};
      try {
        data = (await response.json()) as AskRafiqServerResponse;
      } catch {
        return answerLocalEducationalQuestion(cleanQuestion, 'quota');
      }

      // When quota exceeded (429) or unavailable (503), return local educational fallback without retrying
      if (response.status === 429 || response.status === 503) {
        return answerLocalEducationalQuestion(cleanQuestion, 'quota');
      }

      if (!response.ok) {
        throw new Error(
          data.error || 'تعذر الاتصال برفيق الذكي حالياً، يرجى المحاولة مرة أخرى.'
        );
      }

      if (!data.answer || !data.answer.trim()) {
        throw new Error('لم يرسل رفيق إجابة واضحة، حاول طرح السؤال مجدداً.');
      }

      const recommendedModule =
        data.recommendedModule && data.recommendedModule !== 'none'
          ? data.recommendedModule
          : undefined;

      const reply: RafiqAssistantReply = {
        text: enforceMaxWords(data.answer.trim(), 50),
        visualCards: data.visualCards && data.visualCards.length > 0 ? data.visualCards : undefined,
        recommendedModule,
        usedGemini: true,
      };

      // Persist in localStorage for instant zero-token reuse
      saveCachedAiReply(cacheKey, reply);
      return reply;
    } catch (err: unknown) {
      if (
        !navigator.onLine ||
        (err instanceof TypeError && /fetch|network|failed/i.test(err.message))
      ) {
        return answerLocalEducationalQuestion(cleanQuestion, 'offline');
      }
      throw err;
    } finally {
      inFlightQuestionRequests.delete(cacheKey);
    }
  })();

  inFlightQuestionRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
