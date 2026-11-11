# 004: Defer translated guides

**Status:** Deferred — target languages are not defined  
**Owner:** Angelina and Liberty  
**Size:** M  
**Spec link:** SPEC.md — Out of scope

## User story

As an Rxplain user who prefers another language,
I want accurate guidance in a language I understand,
so that I can use the same safe next steps.

## Acceptance criteria for future work

```gherkin
Feature: Translated prescription guidance

  Scenario: Choose an approved language
    Given the team has selected and reviewed supported languages
    When I open Rxplain
    Then I can choose one of those languages

  Scenario: Keep translated guidance safe
    Given I requested a guide in a supported language
    When Rxplain shows the guide
    Then the contact, next steps, and safety disclaimer are translated
    And the translation does not add medical or coverage promises

  Scenario: Preserve privacy
    When I change the display language
    Then Rxplain still does not ask for personal or prescription details
```

## Notes

- This work is not part of the current MVP.
- Do not implement until the team defines target languages and a review process.
- No database or patient profile is required for language selection.
