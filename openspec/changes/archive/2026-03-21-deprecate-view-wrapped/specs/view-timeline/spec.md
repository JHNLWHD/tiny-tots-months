## REMOVED Requirements

### Requirement: Wrapped Page milestone display context

**Reason:** The Wrapped page at `/app/baby/:babyId/wrapped` is removed from the product; milestones SHALL continue to be available in all other documented contexts.

**Migration:** View milestones on the month page (`/app/month/:babyId/:monthNumber`), home progress indicators, and month card navigation as defined for `view-timeline`.

## ADDED Requirements

### Requirement: Milestone display contexts without Wrapped

The system SHALL display milestone timeline data in the month page, home progress, and month-card navigation contexts without requiring or referencing a Wrapped page.

#### Scenario: User reviews milestones after Wrapped removal

- **WHEN** the user opens a month page or uses home month navigation
- **THEN** milestones for that baby and month (or aggregate progress on home) are shown as before, independent of Wrapped
