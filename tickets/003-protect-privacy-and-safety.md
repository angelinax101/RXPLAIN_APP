# 003: Protect privacy and safety

**Status:** Done  
**Owner:** Angelina and Liberty  
**Size:** M  
**Spec link:** SPEC.md — Privacy and safety rules

## User story

As someone trying to understand a prescription access issue,
I want general information without sharing personal or prescription details,
so that I can get oriented while keeping sensitive information private.

## Acceptance criteria

```gherkin
Feature: Privacy and safe guidance

  Scenario: Do not request personal details
    When I use Rxplain
    Then I only choose from the five supported issue types
    And the app does not ask for names, medication details, or insurance information

  Scenario: Do not save a guide request
    When I request an explanation
    Then Rxplain does not save the request or answer to a database

  Scenario: Show safety information
    When I view a guide
    Then I see that AI can be wrong and plans differ
    And I am told to confirm details with a pharmacy, prescriber, or insurer

  Scenario: Address possible run-out safely
    Given I may run out of a medication
    When I read the guidance
    Then Rxplain tells me to ask my pharmacist what options exist
    And it does not give medical or medication advice
```

## Notes

- The request schema accepts only a known issue ID.
- The AI receives the selected issue and its reference notes, not user-entered text.
- The app does not use the provisioned PostgreSQL database.
