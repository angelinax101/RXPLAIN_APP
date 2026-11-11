# 002: Show clear next steps

**Status:** Done  
**Owner:** Angelina and Liberty  
**Size:** M  
**Spec link:** SPEC.md — Must-have behavior

## User story

As a person whose prescription pickup is delayed,
I want a short explanation, the first contact to try, and useful questions,
so that I can make a more informed call to the pharmacy, prescriber, or insurer.

## Acceptance criteria

```gherkin
Feature: Prescription access guidance

  Scenario: Show a structured guide
    Given I selected one of the five supported issues
    When I request an explanation
    Then I see a plain-language explanation
    And I see who to contact first and why
    And I see exactly three next steps and one to three questions

  Scenario: Keep first-contact guidance consistent
    Given the issue is an unexpected copay
    When an AI explanation is generated
    Then the first contact remains the pharmacy

  Scenario: Use a safe guide when AI is unavailable
    Given Gemini is unavailable or returns unusable content
    When I request an explanation
    Then Rxplain shows the prewritten guide for the selected issue

  Scenario: Make the guide easier to use
    When I view a guide
    Then I can copy it, print it, or choose larger text
```

## Notes

- The reviewed contact order and fallback content are in `server/data/prescription-issues.json`.
- AI response shape and server-controlled contact guidance are in `server/prescription.js`.
- Automated coverage is in `tests/prescription.test.js`.
