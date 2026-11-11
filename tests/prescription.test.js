import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.AI_MODE = 'mock';
const { ExplainRequest, applyContactGuidance, explainIssue, listPublicIssues } = await import('../server/prescription.js');

test('only the five fixed issue IDs are accepted, with no extra user text', () => {
  const issues = listPublicIssues();
  assert.equal(issues.length, 5);
  assert.equal(ExplainRequest.safeParse({ issueId: issues[0].id }).success, true);
  assert.equal(ExplainRequest.safeParse({ issueId: 'unknown' }).success, false);
  assert.equal(ExplainRequest.safeParse({ issueId: issues[0].id, message: 'personal details' }).success, false);
  assert.ok(issues.every((issue) => !('referenceNotes' in issue)));
});

test('each issue returns a structured, privacy-safe fallback without calling Gemini', async () => {
  for (const { id, title } of listPublicIssues()) {
    const answer = await explainIssue(id);
    assert.equal(answer.issueId, id);
    assert.equal(answer.title, title);
    assert.equal(answer.mode, 'fallback');
    assert.ok(answer.explanation.length > 20);
    assert.ok(['pharmacy', 'prescriber', 'insurance'].includes(answer.contact.team));
    assert.equal(answer.nextSteps.length, 3);
    assert.ok(answer.questions.length >= 1 && answer.questions.length <= 3);
    assert.match(answer.disclaimer, /AI can be wrong/i);
    assert.match(answer.disclaimer, /Plans differ/i);
    assert.match(answer.disclaimer, /If you may run out/i);
    assert.match(answer.disclaimer, /not medical or insurance advice/i);
  }
});

test('fallback refuses unsupported issue IDs', async () => {
  await assert.rejects(() => explainIssue('member-name-or-prescription-number'));
});

test('first-contact guidance stays fixed even if the AI suggests another contact', () => {
  const answer = applyContactGuidance('unexpected-copay', {
    explanation: 'The amount can depend on plan rules.',
    nextSteps: ['Ask the pharmacy to explain the claim.', 'Check plan details.', 'Ask a question.'],
    questions: ['What caused this amount?'],
    contact: { team: 'insurance', reason: 'AI-generated contact' },
  });
  assert.equal(answer.contact.team, 'pharmacy');
  assert.match(answer.contact.reason, /itemized breakdown/i);
});
