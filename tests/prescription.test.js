import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.AI_MODE = 'mock';
const {
  AskClassificationSchema,
  AskReplySchema,
  AskRequest,
  ExplanationSchema,
  ExplainRequest,
  applyContactGuidance,
  applyReviewedQuestions,
  askRxplain,
  explainIssue,
  listPublicIssues,
  redactSensitiveDetails,
} = await import('../server/prescription.js');

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

test('patient-facing question prompts always come from the reviewed reference list', () => {
  const answer = applyReviewedQuestions('non-formulary', {
    questions: ['Are you taking the medication as prescribed?'],
  });
  assert.deepEqual(answer.questions, [
    'Is this prescription excluded, or just in a higher cost tier?',
    'Which covered medications are alternatives, and can my doctor consider them?',
    'Is there a formulary exception process, and what does it require?',
  ]);
  assert.ok(answer.questions.every((question) => question.endsWith('?')));
  assert.ok(answer.questions.every((question) => !/^(are you|do you|have you)\b/i.test(question)));
});

test('Gemini output cannot include or invent patient-facing questions', () => {
  const result = ExplanationSchema.safeParse({
    explanation: 'This plan may require a prescriber request before deciding coverage.',
    nextSteps: ['Ask the office if it was submitted.', 'Check with the insurer.', 'Confirm the pharmacy can fill it.'],
    questions: ['Are you taking the medication already?'],
  });
  assert.equal(result.success, false);
});

test('Ask Rxplain accepts only a short message and rejects extra fields', () => {
  assert.equal(AskRequest.safeParse({ message: 'The pharmacy says my refill is too soon.' }).success, true);
  assert.equal(AskRequest.safeParse({ message: 'x'.repeat(501) }).success, false);
  assert.equal(AskRequest.safeParse({ message: '   ' }).success, false);
  assert.equal(AskRequest.safeParse({ message: 'My copay changed.', issueId: 'unexpected-copay' }).success, false);
});

test('routing output schema only allows a confident known issue match', () => {
  assert.equal(AskClassificationSchema.safeParse({
    status: 'matched',
    issueId: 'refill-too-soon',
    confidence: 'high',
  }).success, true);
  assert.equal(AskClassificationSchema.safeParse({
    status: 'matched',
    issueId: 'unknown',
    confidence: 'high',
  }).success, false);
  assert.equal(AskClassificationSchema.safeParse({
    status: 'matched',
    issueId: 'refill-too-soon',
    confidence: 'low',
  }).success, false);
  assert.equal(AskClassificationSchema.safeParse({
    status: 'unclear',
    issueId: null,
    confidence: 'low',
  }).success, true);
  assert.equal(AskClassificationSchema.safeParse({
    status: 'matched',
    issueId: 'refill-too-soon',
    confidence: 'high',
    answer: 'Take a different dose.',
  }).success, false);
});

test('obvious contact details and identifiers are redacted before AI classification', () => {
  const input = 'Email me@example.com, DOB 01/02/1990, phone 206-555-0123, member ID ABC-1234, SSN 123-45-6789.';
  const redacted = redactSensitiveDetails(input);
  assert.doesNotMatch(redacted, /me@example\.com|01\/02\/1990|206-555-0123|ABC-1234|123-45-6789/i);
  assert.match(redacted, /\[email removed\]/);
  assert.match(redacted, /\[phone removed\]/);
  assert.match(redacted, /\[identifier removed\]/);
});

test('Ask Rxplain abstains safely when Gemini classification is unavailable', async () => {
  const answer = await askRxplain('The pharmacy says my refill is too soon and I may run out today.');
  assert.equal(answer.status, 'uncertain');
  assert.equal(answer.mode, 'fallback');
  assert.equal(answer.contact.team, 'pharmacy');
  assert.match(answer.message, /confidently match/i);
  assert.match(answer.message, /ask your pharmacist what options exist/i);
  assert.ok(answer.message.length <= 500);
  assert.equal(AskReplySchema.safeParse(answer).success, true);
  assert.equal(AskReplySchema.safeParse({ ...answer, message: 'x'.repeat(501) }).success, false);
});
