import { Router } from 'express';
import { aiMode } from '../config.js';
import { AskRequest, ExplainRequest, askRxplain, explainIssue, listPublicIssues } from '../prescription.js';

export const api = Router();

const ASK_RATE_LIMIT = 20;
const ASK_RATE_WINDOW_MS = 60_000;
const MAX_TRACKED_ASK_CLIENTS = 10_000;

export function createAskRateLimiter({
  limit = ASK_RATE_LIMIT,
  windowMs = ASK_RATE_WINDOW_MS,
  maxClients = MAX_TRACKED_ASK_CLIENTS,
  now = Date.now,
} = {}) {
  const clients = new Map();
  const refillPerMs = limit / windowMs;
  let requestsSinceCleanup = 0;

  return (req) => {
    const timestamp = now();
    const clientId = req.ip || req.socket?.remoteAddress || 'unknown';
    let bucket = clients.get(clientId);

    if (!bucket) {
      if (clients.size >= maxClients) {
        clients.delete(clients.keys().next().value);
      }
      bucket = { tokens: limit, updatedAt: timestamp };
    } else {
      const elapsed = Math.max(0, timestamp - bucket.updatedAt);
      bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillPerMs);
      bucket.updatedAt = timestamp;
    }

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 256) {
      requestsSinceCleanup = 0;
      for (const [key, entry] of clients) {
        if (timestamp - entry.updatedAt >= windowMs) clients.delete(key);
      }
    }

    if (bucket.tokens < 1) {
      return Math.ceil((1 - bucket.tokens) / refillPerMs / 1000);
    }

    bucket.tokens -= 1;
    clients.delete(clientId);
    clients.set(clientId, bucket);
    return null;
  };
}

const limitAskRequests = createAskRateLimiter();

api.get('/health', (_req, res) => {
  res.json({ ok: true, ai: aiMode() === 'live' ? 'live' : 'fallback' });
});

api.get('/issues', (_req, res) => {
  res.json({ issues: listPublicIssues() });
});

api.post('/explain', async (req, res) => {
  const parsed = ExplainRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Choose one of the listed issues. Do not include personal or prescription information.' });
    return;
  }

  try {
    res.json(await explainIssue(parsed.data.issueId));
  } catch {
    res.status(500).json({ error: 'Rxplain could not load this guide. Please try again.' });
  }
});

api.post('/ask', async (req, res) => {
  const parsed = AskRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Enter a brief issue description of 500 characters or fewer. Do not include personal or medication details.' });
    return;
  }

  const retryAfterSeconds = limitAskRequests(req);
  if (retryAfterSeconds !== null) {
    res.set('Retry-After', String(retryAfterSeconds));
    res.status(429).json({
      error: 'Too many requests. Please wait before asking again.',
      retryAfterSeconds,
    });
    return;
  }

  try {
    res.json(await askRxplain(parsed.data.message));
  } catch {
    res.status(500).json({ error: 'Ask Rxplain is unavailable right now. Please use the issue guide above.' });
  }
});
