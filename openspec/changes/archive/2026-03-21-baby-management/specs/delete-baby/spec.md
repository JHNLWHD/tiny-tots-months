## ADDED Requirements

### Requirement: Remove baby profile with confirmation

The system SHALL require explicit confirmation before removing a baby profile the user owns, and SHALL communicate success or failure.

#### Scenario: User confirms removal

- **WHEN** the user confirms removal of their baby profile
- **THEN** the system SHALL apply the product’s removal semantics (e.g. soft delete or hard delete) and SHALL update lists and active selection so the Home experience stays consistent

#### Scenario: User cancels removal

- **WHEN** the user dismisses the confirmation without confirming
- **THEN** the baby profile SHALL remain unchanged

### Requirement: Selection after removing active baby

When the removed baby was the active selection, the system SHALL select another remaining baby or clear selection when none remain.

#### Scenario: Deleted baby was selected

- **WHEN** the user removes the currently selected baby and other babies exist
- **THEN** another baby SHALL become active

#### Scenario: Last baby removed

- **WHEN** the user removes their last baby
- **THEN** the active baby SHALL be cleared and the empty state SHALL apply

---

_Narrative design notes: see `legacy-capability-notes.md` in this folder._
