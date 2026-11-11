# Rxplain

Rxplain helps insured people understand common prescription access issues. Choose one of five issues for a full guide, or use the optional Ask Rxplain chat for a short, privacy-conscious route to the right contact.

> **Important:** Rxplain provides general information only. It is not medical, treatment, or insurance advice. A pharmacist, prescriber, or insurer can confirm what applies to a specific person. AI can be wrong.

## The team

Angelina and Liberty

## The user problem

Someone arrives at a pharmacy and cannot pick up a prescription. The message may be confusing, and waiting to speak with someone can be difficult. Rxplain gives them a short explanation and a useful first question to ask.

The example user in the project brief is Jennifer, an insured patient who cannot pick up a prescription today and wants to understand why.

## How it works

1. Choose one of five common access issues:
   - Refill too soon
   - Prior authorization
   - Non-formulary drug
   - Unexpected copay
   - Insurance rejection
2. Select **Explain this**.
3. Review a plain-language explanation, who to contact first, three next steps, and one to three questions.
4. Copy or print the summary, or choose another issue.

The app always shows its safety disclaimer. Larger text is available for readability.
Ask Rxplain accepts one short message at a time, up to 500 characters. It can classify a clear issue or abstain; it does not generate medical answers or answer unrelated questions.

## Privacy and safety

- No account, patient profile, or saved conversation history.
- The Ask Rxplain widget accepts up to 500 characters. The message is sent to Gemini for issue classification; obvious email, phone, birth-date, and labeled-ID patterns are redacted first. Redaction is limited and may miss sensitive details, so the widget warns users not to enter names, medication names, birth dates, or prescription or insurance details.
- Rxplain does not save or log messages, replies, or conversation history. The visible chat transcript exists only in browser memory and clears when the widget closes or the page reloads. Each turn is classified independently; previous messages are not sent as context.
- Gemini returns only a strict classification, not a written answer. Rxplain uses reviewed issue guidance to choose a contact and construct fixed routing text.
- `/api/explain` accepts only one of the five known issue IDs; `/api/ask` accepts one message of at most 500 characters. Both endpoints reject additional request fields.
- The first contact for each issue comes from the reviewed guide, not a free-form AI choice.
- The questions shown in a guide are reviewed prompts from the supplied reference notes; Gemini does not generate or rewrite them.
- The AI must not give medication or treatment advice, ask for personal details, or promise coverage, prices, exceptions, or timelines.
- Unclear messages receive a cautious pharmacy referral; medical and unrelated messages receive a scope-only response.
- If someone may run out, the guide directs them to ask their pharmacist what options exist; rules vary by plan and state.
- If Gemini is unavailable or returns an unusable answer, Rxplain shows a prewritten fallback for the selected issue.

The Replit PostgreSQL database that may exist in this workspace is not used by Rxplain. The application does not need a database.

## Run on Replit

1. Add `GEMINI_API_KEY` in **Tools → Secrets**. The key stays on the server and is never sent to the browser.
2. Click **Run**. The configured workflow installs dependencies and starts the app.
3. If no Gemini key is configured, the five guides still work with prewritten answers and Ask Rxplain uses a cautious uncertainty message.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env
# Add GEMINI_API_KEY to .env if you want live Gemini explanations.
npm run dev
```

The development server uses port 3000 unless `PORT` is set. To run the same port as the Replit preview:

```bash
PORT=5000 npm run dev
```

Run the automated tests with:

```bash
npm test
```

Create a production frontend build with:

```bash
npm run build
```

## API

All routes are served by the Express app under `/api`.

### `GET /api/health`

Returns whether the server is ready and whether Gemini is configured:

```json
{ "ok": true, "ai": "live" }
```

`ai` is `fallback` when there is no key or `AI_MODE=mock`.

### `GET /api/issues`

Returns the five public issue choices. Internal reference notes and fallback content stay on the server.

### `POST /api/explain`

Send only a known issue ID:

```json
{ "issueId": "prior-authorization" }
```

The response contains:

```json
{
  "issueId": "prior-authorization",
  "title": "Prior authorization",
  "explanation": "A plain-language explanation.",
  "contact": { "team": "prescriber", "reason": "Why to contact them first." },
  "nextSteps": ["Step one", "Step two", "Step three"],
  "questions": ["A question to ask"],
  "mode": "ai",
   "disclaimer": "AI can be wrong. Plans differ. Rxplain shares general information, not medical or insurance advice. Confirm details with your pharmacy, prescriber, or insurer. If you may run out, ask your pharmacist what options exist; rules vary by plan and state. Do not enter personal, prescription, or insurance details."
}
```

Possible `contact.team` values are `pharmacy`, `prescriber`, and `insurance`. `mode` is `fallback` when a prewritten guide is used. Request bodies with extra fields are rejected.

### `POST /api/ask`

Send one short message, with no added fields:

```json
{ "message": "The pharmacy says my refill is too soon." }
```

The message must be 1–500 characters. The response is limited to a fixed, brief routing message:

```json
{
  "status": "matched",
  "issueId": "refill-too-soon",
  "issueTitle": "Refill too soon",
  "contact": {
    "team": "pharmacy",
    "reason": "The pharmacy can explain the rejection message and when the plan may allow another claim."
  },
  "message": "This sounds like refill too soon. Contact your pharmacy first. The pharmacy can explain the rejection message and when the plan may allow another claim. Ask them to confirm the exact reason and your next step.",
  "mode": "ai"
}
```

`status` may be `matched`, `uncertain`, or `out_of_scope`. Only a high-confidence match can select one of the five reviewed contacts. The `message` is server-generated from approved guidance and is capped at 500 characters. Medical or unrelated questions are not answered.

## Project files

```text
src/                         React interface and API client
server/index.js              Express and Vite server
server/routes/api.js         Health, issue list, explanation, and Ask routes
server/prescription.js       Input validation, Gemini response checks, fallbacks
server/data/prescription-issues.json
                             Five issues, server-only notes, and fallback answers
shared/project.config.js     App name, tagline, and team
tests/                       Automated tests
tickets/                     Rxplain acceptance criteria and ticket template
```

## Scope

### In this MVP

- Five fixed issue choices
- Structured, plain-language explanations with contact guidance, next steps, and questions
- Always-visible safety language and safe fallback answers
- Copy and print summary actions
- Larger-text option
- Optional Ask Rxplain chat with a 500-character input limit and short, fixed routing replies

### Not included

- More than five issues
- Live insurance eligibility checks
- Medication price comparisons
- Accounts, personal records, or patient information
- Submitting prior-authorization requests
- Open-ended AI answers, medical advice, and unrelated conversation
- Saved chats or conversational context; each ask is independent and temporary
- Translation into other languages; it is mentioned as a possibility in the brief but is not part of the five-issue core journey

The issue notes and fallback guides live in `server/data/prescription-issues.json`. Keep them general and verify them with the team before expanding them. Do not add private patient, prescription, or insurance information.
