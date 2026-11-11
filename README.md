# Rxplain

Rxplain helps insured people understand common prescription access issues. It explains what a message may mean in plain language, suggests who to contact first, and prepares practical next steps and questions.

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

## Privacy and safety

- No account, patient profile, or conversation history.
- No free-text field: the only information sent to Gemini is the selected issue and the related reference notes in `server/data/prescription-issues.json`.
- Requests and answers are not saved to a database or logged by the application.
- The API accepts only one of the five known issue IDs and rejects additional request fields.
- The first contact for each issue comes from the reviewed guide, not a free-form AI choice.
- The AI must not give medication or treatment advice, ask for personal details, or promise coverage, prices, exceptions, or timelines.
- If someone may run out, the guide directs them to ask their pharmacist what options exist; rules vary by plan and state.
- If Gemini is unavailable or returns an unusable answer, Rxplain shows a prewritten fallback for the selected issue.

The Replit PostgreSQL database that may exist in this workspace is not used by Rxplain. The application does not need a database.

## Run on Replit

1. Add `GEMINI_API_KEY` in **Tools → Secrets**. The key stays on the server and is never sent to the browser.
2. Click **Run**. The configured workflow installs dependencies and starts the app.
3. If no Gemini key is configured, the app still works with prewritten fallback guides.

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

## Project files

```text
src/                         React interface and API client
server/index.js              Express and Vite server
server/routes/api.js         Health, issue list, and explanation routes
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

### Not included

- More than five issues
- Live insurance eligibility checks
- Medication price comparisons
- Accounts, personal records, or patient information
- Submitting prior-authorization requests
- Free-text questions, so the AI receives only the selected issue and its reference notes
- Translation into other languages; it is mentioned as a possibility in the brief but is not part of the five-issue core journey

The issue notes and fallback guides live in `server/data/prescription-issues.json`. Keep them general and verify them with the team before expanding them. Do not add private patient, prescription, or insurance information.
