# delete-baby Specification

## Purpose

Define how users remove a baby they own: confirmation, soft removal from the active list, optional restore, selection updates, and clear success or failure feedback.

## Requirements
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

- **WHEN** the user removes their last active baby
- **THEN** the active baby SHALL be cleared and the empty state SHALL apply

### Requirement: Recently removed and restore

The system SHALL list recently removed babies in a dedicated Home area and SHALL allow the owner to restore a removed baby back to the active list.

#### Scenario: Recently removed is visible

- **WHEN** at least one of the user’s babies is in the removed (non-active) state
- **THEN** the Home experience SHALL expose a “recently removed” (or equivalent) section listing those profiles

#### Scenario: User restores a baby

- **WHEN** the user chooses restore for a recently removed baby
- **THEN** that baby SHALL return to the active list, SHALL be eligible for selection, and the UI SHALL refresh accordingly

