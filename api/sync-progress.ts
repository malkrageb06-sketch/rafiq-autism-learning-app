import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
}

const syncMemoryStore = new Map<
  string,
  { user: Record<string, unknown>; progress: Record<string, unknown>; syncedAt: string }
>();

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

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method === 'GET') {
    const reqUrl = new URL(req.url || '/', 'http://localhost');
    const syncId = (reqUrl.searchParams.get('syncId') || '').trim();
    if (!syncId) {
      sendJson(res, 400, { error: 'Missing syncId' });
      return;
    }
    const entry = syncMemoryStore.get(syncId);
    if (!entry) {
      sendJson(res, 200, { found: false });
      return;
    }
    sendJson(res, 200, { found: true, ...entry });
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const syncId = typeof body.syncId === 'string' ? body.syncId.trim() : '';
    if (!syncId || !body.progress || typeof body.progress !== 'object') {
      sendJson(res, 400, { error: 'بيانات المزامنة غير مكتملة.' });
      return;
    }
    const syncedAt = new Date().toISOString();
    syncMemoryStore.set(syncId, {
      user: body.user && typeof body.user === 'object' ? (body.user as Record<string, unknown>) : {},
      progress: body.progress as Record<string, unknown>,
      syncedAt,
    });
    sendJson(res, 200, { ok: true, syncedAt });
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
}
