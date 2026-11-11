# 001: Select a prescription access issue

**Status:** Done  
**Owner:** Angelina and Liberty  
**Size:** S  
**Spec link:** SPEC.md — Core journey and must-have behavior

## User story

As an insured person who cannot pick up a prescription,
I want to choose the message that best matches what happened,
so that I can get relevant next steps without entering personal details.

## Acceptance criteria

```gherkin
Feature: Select an issue

  Scenario: Show the supported issues
    When I open Rxplain
    Then I can choose refill too soon, prior authorization, non-formulary drug,
      unexpected copay, or insurance rejection

  Scenario: Explain a supported issue
    Given I selected a supported issue
    When I request an explanation
    Then Rxplain returns guidance for that issue

  Scenario: Reject unknown input
    When I submit an unknown issue ID or extra request fields
    Then the API rejects the request
```

## Notes

- The issue list is served by `GET /api/issues`.
- The supported IDs and request validation are maintained in `server/prescription.js`.
- Automated coverage is in `tests/prescription.test.js`.
