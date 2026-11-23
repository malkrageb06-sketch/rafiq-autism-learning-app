import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(
    JSON.stringify({
      version: '1.1.0',
      publishedAt: '2026-11-21',
      lessonsCount: 4,
      quizzesCount: 48,
      announcement:
        'جميع دروس الألوان والأشكال والأرقام والمشاعر والاختبارات المتدرجة محدثة ومتاحة بدون إنترنت.',
    })
  );
}
