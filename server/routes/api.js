import { Router } from 'express';
import { aiMode } from '../config.js';
import { ExplainRequest, explainIssue, listPublicIssues } from '../prescription.js';

export const api = Router();

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
