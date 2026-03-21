## ADDED Requirements

### Requirement: Single active baby on Home

At most one baby SHALL be the active context driving Home timeline and primary navigation at a time.

#### Scenario: User selects another baby

- **WHEN** the user selects a different baby from the Home baby picker
- **THEN** the active context SHALL switch to that baby and dependent views SHALL use its data

### Requirement: Restore selected baby after reload

Where the product persists a selected baby identifier, the system SHALL restore that selection after reload when the baby still exists for the user.

#### Scenario: Reload with valid stored id

- **WHEN** the page reloads and a stored baby id matches a profile in the user’s list
- **THEN** that baby SHALL become the active selection

### Requirement: Cross-tab selection alignment

Where storage events are used for the selected baby id, an update in another tab SHALL align Home’s active baby when that id matches a listed baby.

#### Scenario: Storage event updates selection

- **WHEN** the stored selected baby id changes in another browser context for the same user
- **THEN** Home SHALL update the active baby to match when the id refers to an existing profile

---

_Narrative design notes: see `legacy-capability-notes.md` in this folder._
