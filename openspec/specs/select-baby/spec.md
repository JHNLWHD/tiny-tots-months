# select-baby Specification

## Purpose
TBD - created by archiving change deprecate-view-wrapped. Update Purpose after archive.
## Requirements
### Requirement: Home navigation excludes Wrapped

The system SHALL NOT offer a primary navigation control on the home experience whose purpose is to open the deprecated year-in-review "Wrapped" experience for the selected baby.

#### Scenario: User sees baby actions on home

- **WHEN** the user views the home page with a baby selected
- **THEN** no action labeled as Wrapped (or equivalent year-in-review entry) is shown among the primary navigation actions for that baby

### Requirement: Legacy Wrapped URLs remain safe

The system SHALL handle HTTP-style in-app navigation to the legacy path `/app/baby/:babyId/wrapped` without rendering a broken or empty feature shell.

#### Scenario: User follows old Wrapped bookmark

- **WHEN** the user navigates to `/app/baby/:babyId/wrapped` for a valid baby id
- **THEN** the application redirects them to a defined in-app destination (e.g. home) and the rest of the application remains usable

