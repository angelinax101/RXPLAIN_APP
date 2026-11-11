# Rxplain MVP Specification

## Product statement

Rxplain helps insured people understand common prescription access issues by providing plain-language explanations and practical next steps.

## Problem and user

People may be unable to pick up a prescription and may not understand why. Long waits and unclear explanations make it harder to find the right next step.

The example user is Jennifer, an insured patient who cannot pick up a prescription today. She is trying to understand the issue and is using a phone or laptop at home.

## Core journey

1. The user sees the safety disclaimer and selects one of five common issues.
2. The user requests an explanation.
3. Rxplain presents an explanation, who to contact first and why, three next steps, and one to three questions.
4. The user copies or prints the summary, or starts again with another issue.

## Must-have behavior

- Support exactly five issue IDs: refill too soon, prior authorization, non-formulary drug, unexpected copay, and insurance rejection.
- Use plain language at about a sixth-grade reading level.
- Return structured data: `explanation`, `contact.team`, `contact.reason`, three `nextSteps`, and one to three `questions`.
- Always display that AI can be wrong, plans differ, and the answer is general information.
- Provide a prewritten fallback for every issue if Gemini is unavailable or returns invalid output.
- Keep the Gemini API key server-side.
- Send Gemini only the selected issue and its server-side reference notes.
- Store no user data, issue selections, requests, answers, or conversation history.
- Provide copy, print, and larger-text controls.

## Privacy and safety rules

- No accounts, login, patient profile, or database use.
- No free-text prompt or file upload. The endpoint rejects request fields beyond the selected issue ID.
- Never ask for names, prescription numbers, or insurance details.
- Do not provide medication, treatment, or dosing advice.
- Do not promise coverage, savings, exceptions, or timelines.
- Direct users to a pharmacist, prescriber, or insurer for specifics.
- If someone may run out, direct them to ask a pharmacist what options exist; rules vary by plan and state.

## Out of scope

- More than five issues
- Live insurance eligibility checks
- Medication price comparison
- Accounts or patient information
- Prior-authorization submission
- Free-text user input
- Translation into other languages, which is not defined in the core journey

## Technology

- React, HTML, CSS, and JavaScript
- Node.js and Express
- Gemini API, called only from the server
- JSON issue guides and fallbacks; no database
- Replit for hosting

## Done means

The user can choose any supported issue, receive a well-formed explanation or safe fallback, identify who to contact, see next steps and questions, and copy or print the result without the app storing their activity.
