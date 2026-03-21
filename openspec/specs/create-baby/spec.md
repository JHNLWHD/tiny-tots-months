# create-baby Specification

## Purpose

Define how users add a baby profile: validated fields, plan and credit gating before the create flow opens, and successful persistence reflected in the UI.

## Requirements
### Requirement: Create baby profile with validation

The system SHALL allow an authenticated user to create a baby profile with a name, date of birth, and gender, subject to subscription and credit rules enforced before the create dialog opens.

#### Scenario: Valid create succeeds

- **WHEN** the user is permitted to create a baby and submits a valid name, a birth date that is not in the future, and a gender value
- **THEN** the baby SHALL be stored for the user and the UI SHALL reflect the new profile (refreshed list, success feedback, and the new baby becomes the active selection where the product does so)

#### Scenario: Future birth date rejected

- **WHEN** the user submits a birth date in the future
- **THEN** the system SHALL NOT persist the profile and SHALL surface a validation error

### Requirement: Creation gated by plan

The system SHALL prevent opening the create-baby form when the user is not entitled to add another baby under the current plan, and SHALL surface upgrade or credit guidance instead.

#### Scenario: Not entitled to add

- **WHEN** the user attempts Add Baby but the plan or credit rules disallow another profile
- **THEN** the create dialog SHALL NOT open and the user SHALL see the defined upgrade or paywall prompt

