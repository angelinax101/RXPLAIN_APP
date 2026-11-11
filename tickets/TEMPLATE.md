# [Ticket number]: [Short title]

Replace each bracketed prompt with project-specific details before sharing the ticket.

**Status:** Draft | Ready | In Progress | Review | Done | Deferred
**Owner:** [Person or team responsible]
**Size:** [S, M, or L; split large work into smaller tickets]
**Spec link:** [SPEC.md section or heading]

## User story

As [a specific user],
I want [a clear capability],
so that [the user benefit].

## Acceptance criteria

```gherkin
Feature: [Feature name]

  Scenario: [Expected result]
    Given [starting conditions]
    When [user action]
    Then [observable result]

  Scenario: [Validation or failure case]
    Given [starting conditions]
    When [invalid or unavailable condition]
    Then [safe, understandable result]

  Scenario: Safety and privacy
    Given [relevant user or app state]
    When [the feature is used]
    Then [privacy and safety requirements are met]
```

## Notes

- Files likely to change: [List only after reviewing the code]
- Tests: [Relevant automated and manual checks]
- Database changes: [None unless the specification requires them]
- Out of scope: [Related work this ticket does not include]

## Definition of Done

- [ ] Every scenario passes when a teammate walks through it
- [ ] `npm test` passes
- [ ] No keys or personal information are added to code or commits
- [ ] A teammate reviews the change
- [ ] The app runs after the change is merged
