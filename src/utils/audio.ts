// Gentle, autism-friendly Web Audio chimes & On-Demand Cached Arabic Text-to-Speech
// - Generates TTS audio ONLY when a speaker button is clicked
// - Debounces rapid repeated clicks and deduplicates in-flight TTS requests
// - Caches generated audio locally in memory + IndexedDB for future offline/zero-API replay

import { getCachedTtsAudio, setCachedTtsAudio } from './offlineStorage';

let audioCtx: AudioContext | null = null;
let currentTtsSource: AudioBufferSourceNode | null = null;
let activeSpeechRequestId = 0;
let lastSpeakClickTime = 0;
let lastSpeakText = '';

const TTS_DEBOUNCE_MS = 350;

// Client-side memory cache of decoded AudioBuffers for instant replay
const decodedAudioCache = new Map<string, AudioBuffer>();
const MAX_CLIENT_AUDIO_CACHE = 100;

// Deduplicate concurrent TTS fetches for the same phrase
const inFlightTtsFetches = new Map<string, Promise<string | null>>();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function stopSpeaking(): void {
  activeSpeechRequestId += 1;
  if (currentTtsSource) {
    try {
      currentTtsSource.stop();
      currentTtsSource.disconnect();
    } catch {
      // Ignore already-stopped source
    }
    currentTtsSource = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speechSynthesis cancel errors
    }
  }
}

export function playGentleTap(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore audio context errors on restricted browsers
  }
}

export function playSuccessChime(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Soft C-major triad chime (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playTryAgainNote(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Warm, calm, non-punitive soft tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(349.23, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(329.63, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    // Ignore audio errors
  }
}

function playDecodedBuffer(ctx: AudioContext, buffer: AudioBuffer, requestId: number): void {
  if (requestId !== activeSpeechRequestId) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = 0.92;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.onended = () => {
    if (currentTtsSource === source) {
      currentTtsSource = null;
    }
  };
  currentTtsSource = source;
  source.start(0);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function speakWithBrowserFallback(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.88;
      utterance.pitch = 1.04;
      utterance.volume = 0.92;

      const voices = synth.getVoices();
      const arabicVoice =
        voices.find((v) => v.lang.toLowerCase() === 'ar-sa') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
      synth.speak(utterance);
    };

    const voices = synth.getVoices();
    if (voices.length > 0) {
      speakNow();
    } else {
      let spoken = false;
      const handleVoices = () => {
        if (spoken) return;
        spoken = true;
        synth.removeEventListener('voiceschanged', handleVoices);
        speakNow();
      };
      synth.addEventListener('voiceschanged', handleVoices);
      window.setTimeout(() => {
        if (!spoken) {
          spoken = true;
          synth.removeEventListener('voiceschanged', handleVoices);
          speakNow();
        }
      }, 150);
    }
  } catch {
    // Ignore speech synthesis errors on unsupported devices
  }
}

async function decodeAndPlayBase64(
  base64Audio: string,
  cacheKey: string,
  ctx: AudioContext | null,
  requestId: number
): Promise<void> {
  if (requestId !== activeSpeechRequestId) return;

  if (ctx) {
    const arrayBuf = base64ToArrayBuffer(base64Audio);
    const audioBuffer = await ctx.decodeAudioData(arrayBuf);
    if (requestId !== activeSpeechRequestId) return;

    if (decodedAudioCache.size >= MAX_CLIENT_AUDIO_CACHE) {
      const oldestKey = decodedAudioCache.keys().next().value;
      if (oldestKey) decodedAudioCache.delete(oldestKey);
    }
    decodedAudioCache.set(cacheKey, audioBuffer);
    playDecodedBuffer(ctx, audioBuffer, requestId);
  } else {
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    await audio.play();
  }
}

async function fetchTtsWithDedup(trimmed: string): Promise<string | null> {
  const existing = inFlightTtsFetches.get(trimmed);
  if (existing) {
    return existing;
  }

  const fetchPromise = (async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { audioBase64?: string };
      if (!data.audioBase64) return null;

      void setCachedTtsAudio(trimmed, data.audioBase64);
      return data.audioBase64;
    } catch {
      return null;
    } finally {
      inFlightTtsFetches.delete(trimmed);
    }
  })();

  inFlightTtsFetches.set(trimmed, fetchPromise);
  return fetchPromise;
}

export function speakArabic(text: string, enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') {
    return;
  }
  const trimmed = text.trim();
  if (!trimmed) return;

  // Debounce rapid repeated clicks on the same speaker button
  const now = Date.now();
  if (trimmed === lastSpeakText && now - lastSpeakClickTime < TTS_DEBOUNCE_MS) {
    return;
  }
  lastSpeakClickTime = now;
  lastSpeakText = trimmed;

  // Synchronously unlock AudioContext inside user gesture before any async work
  const ctx = getAudioContext();
  stopSpeaking();
  const requestId = activeSpeechRequestId;

  const cachedBuffer = decodedAudioCache.get(trimmed);
  if (cachedBuffer && ctx) {
    playDecodedBuffer(ctx, cachedBuffer, requestId);
    return;
  }

  void (async () => {
    try {
      // 1. Check persistent IndexedDB cache (0 API calls)
      const persistedBase64 = await getCachedTtsAudio(trimmed);
      if (requestId !== activeSpeechRequestId) return;
      if (persistedBase64) {
        await decodeAndPlayBase64(persistedBase64, trimmed, ctx, requestId);
        return;
      }

      // 2. If offline, skip network request immediately and use device Arabic TTS
      if (!navigator.onLine) {
        speakWithBrowserFallback(trimmed);
        return;
      }

      // 3. Online: fetch deduplicated TTS once and cache locally in IndexedDB
      const base64Audio = await fetchTtsWithDedup(trimmed);
      if (requestId !== activeSpeechRequestId) return;
      if (!base64Audio) {
        speakWithBrowserFallback(trimmed);
        return;
      }

      await decodeAndPlayBase64(base64Audio, trimmed, ctx, requestId);
    } catch {
      if (requestId === activeSpeechRequestId) {
        speakWithBrowserFallback(trimmed);
      }
    }
  })();
}
