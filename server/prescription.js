import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { aiMode } from './config.js';
import { getModel } from './ai/model.js';

const ISSUE_DATA_PATH = fileURLToPath(new URL('./data/prescription-issues.json', import.meta.url));
const ISSUE_GUIDES = JSON.parse(await readFile(ISSUE_DATA_PATH, 'utf8'));
const byId = new Map(ISSUE_GUIDES.map((issue) => [issue.id, issue]));

export const ISSUE_IDS = ISSUE_GUIDES.map((issue) => issue.id);

export const ExplanationSchema = z.object({
  explanation: z.string().trim().min(20).max(600),
  nextSteps: z.array(z.string().trim().min(5).max(200)).length(3),
  questions: z.array(z.string().trim().min(5).max(200)).min(1).max(3),
}).strict();

export const ExplainRequest = z.object({
  issueId: z.enum(ISSUE_IDS),
}).strict();

export const DISCLAIMER =
  'AI can be wrong. Plans differ. Rxplain shares general information, not medical or insurance advice. Confirm details with your pharmacy, prescriber, or insurer. If you may run out, ask your pharmacist what options exist; rules vary by plan and state. Do not enter personal, prescription, or insurance details.';

export const FALLBACK_NOTICE =
  'We couldn’t generate a reliable answer. Please contact your pharmacy, prescriber, or insurance company.';

export function listPublicIssues() {
  return ISSUE_GUIDES.map(({ id, title, description }) => ({ id, title, description }));
}

export async function explainIssue(issueId) {
  const issue = byId.get(issueId);
  if (!issue) throw new Error('Unknown prescription issue.');

  if (aiMode() !== 'live') return fallbackAnswer(issue);

  try {
    const answer = await generateWithGemini(issue);
    return {
      issueId: issue.id,
      title: issue.title,
      ...answer,
      mode: 'ai',
      disclaimer: DISCLAIMER,
    };
  } catch {
    return fallbackAnswer(issue);
  }
}

export function fallbackAnswer(issue) {
  return {
    issueId: issue.id,
    title: issue.title,
    ...issue.fallback,
    mode: 'fallback',
    fallbackNotice: FALLBACK_NOTICE,
    disclaimer: DISCLAIMER,
  };
}

export function applyContactGuidance(issueId, answer) {
  const issue = byId.get(issueId);
  if (!issue) throw new Error('Unknown prescription issue.');
  return { ...answer, contact: issue.fallback.contact };
}

async function generateWithGemini(issue) {
  const model = await getModel();
  const response = await model.invoke([
    new SystemMessage([
      'You explain common prescription access issues for Rxplain.',
      'Use plain language at about a sixth-grade reading level.',
      'Give general information only. Never give medical, treatment, or medication guidance.',
      'Never suggest changing, skipping, stopping, or substituting medication.',
      'Do not ask for or invent personal, prescription, insurance, phone, price, or coverage details.',
      'Do not promise coverage, exceptions, savings, or timelines.',
      'Plans differ. If someone may run out, tell them to ask their pharmacist what options exist; rules vary by plan and state.',
      'Never recommend a specific medicine, coupon, discount card, or pharmacy as cheaper or allowed.',
      `The first contact is ${issue.fallback.contact.team}. Make the first next step align with that contact; do not name a different first contact.`,
      'Use only the supplied issue and reference notes. If they do not support a detail, leave it out.',
      'Return only a JSON object with explanation, nextSteps (exactly 3 strings), and questions (1 to 3 strings). Do not include a contact field.',
    ].join(' ')),
    new HumanMessage(JSON.stringify({
      issue: issue.title,
      referenceNotes: issue.referenceNotes,
      firstContact: issue.fallback.contact,
    })),
  ]);

  const parsed = ExplanationSchema.safeParse(JSON.parse(textOf(response)));
  if (!parsed.success) throw new Error('The AI response did not match the required format.');
  return applyContactGuidance(issue.id, parsed.data);
}

function textOf(response) {
  if (typeof response.content === 'string') return stripCodeFence(response.content);
  if (Array.isArray(response.content)) {
    return stripCodeFence(response.content.map((part) => part.text ?? '').join(''));
  }
  return stripCodeFence(String(response.text ?? ''));
}

function stripCodeFence(text) {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}
