## ADDED Requirements

### Requirement: Edit baby profile fields

The system SHALL allow the owner to update a baby’s name, date of birth, gender, and optional profile photo where the product supports it.

#### Scenario: Save updates

- **WHEN** the user changes allowed fields and saves
- **THEN** the system SHALL persist changes for that baby and SHALL refresh displayed data

#### Scenario: Future birth date rejected

- **WHEN** the user submits a birth date in the future
- **THEN** the system SHALL reject the update with a clear validation message

---

_Narrative design notes (including historical “not implemented” context): see `legacy-capability-notes.md` in this folder._
