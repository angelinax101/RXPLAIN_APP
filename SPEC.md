# Rxplain MVP Specification

## Product statement

Rxplain helps insured people understand common prescription access issues by providing plain-language explanations and practical next steps.

## Problem and user

People may be unable to pick up a prescription and may not understand why. Long waits and unclear explanations make it harder to find the right next step.

The example user is Jennifer, an insured patient who cannot pick up a prescription today. She is trying to understand the issue and is using a phone or laptop at home.

## Core journey

1. The user sees the safety disclaimer and selects one of five common issues.
2. Rxplain presents an explanation, who to contact first and why, three next steps, and one to three questions.
3. The user copies or prints the summary, or starts again with another issue.
4. Optionally, the user opens Ask Rxplain and submits a brief description of an access issue.
5. Ask Rxplain classifies the message and returns fixed contact guidance, an uncertainty message, or an out-of-scope response.

## Must-have behavior

- Support exactly five issue IDs: refill too soon, prior authorization, non-formulary drug, unexpected copay, and insurance rejection.
- Use plain language at about a sixth-grade reading level.
- Return structured data: `explanation`, `contact.team`, `contact.reason`, three `nextSteps`, and one to three `questions`.
- Ask Rxplain accepts 1–500 characters and returns a message of no more than 500 characters.
- Ask Rxplain uses Gemini only to classify a clear match among the five supported issues, an unclear issue, or an out-of-scope message.
- A matched Ask Rxplain response must be high confidence; all contact recommendations come from reviewed server-side guidance.
- The Ask Rxplain reply is fixed server-generated routing text, not a free-form AI answer.
- Always display that AI can be wrong, plans differ, and the answer is general information.
- Provide a prewritten fallback for every issue if Gemini is unavailable or returns invalid output.
- If Ask Rxplain classification is unavailable, invalid, or low-confidence, return a fixed uncertainty message instead of guessing.
- Keep the Gemini API key server-side.
- For the full guide, send Gemini only the selected issue and its server-side reference notes.
- For Ask Rxplain, redact common contact and identifier patterns before sending the current message to Gemini for classification.
- Do not log or persist user messages, answers, issue selections, or conversation history. Keep the visible chat only in browser memory and clear it when the widget closes or the page reloads.
- Provide copy, print, and larger-text controls.

## Privacy and safety rules

- No accounts, login, patient profile, or database use.
- Ask Rxplain accepts only one short text field of at most 500 characters; reject extra fields and over-limit input.
- Explain that the Ask message is sent to Gemini for classification, that limited patterns are redacted, and that this redaction may miss sensitive information.
- Never ask for names, medication names, prescription numbers, or insurance details.
- Do not provide medication, treatment, or dosing advice.
- Do not answer medical or unrelated messages; abstain when a prescription-access issue is ambiguous.
- Do not promise coverage, savings, exceptions, or timelines.
- Direct users to a pharmacist, prescriber, or insurer for specifics.
- If someone may run out, direct them to ask a pharmacist what options exist; rules vary by plan and state.

## Out of scope

- More than five issues
- Live insurance eligibility checks
- Medication price comparison
- Accounts or patient information
- Prior-authorization submission
- Open-ended AI chat, medical advice, or unrelated answers
- Translation into other languages, which is not defined in the core journey

## Technology

- React, HTML, CSS, and JavaScript
- Node.js and Express
- Gemini API, called only from the server
- JSON issue guides and fallbacks; no database
- Replit for hosting

## Done means

The user can choose any supported issue, receive a well-formed explanation or safe fallback, identify who to contact, see next steps and questions, and copy or print the result without the app storing their activity.
