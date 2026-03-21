## ADDED Requirements

### Requirement: Upload operation is awaitable through the call chain

The system SHALL expose the authenticated month-page photo upload so that calling code can await the full client-side upload pipeline (validation, storage upload, database insert, and retrieval of display URL as implemented today) before treating the operation as finished.

#### Scenario: Promise settles only after upload attempt completes

- **WHEN** the month page triggers a photo upload through the standard `uploadPhoto` API
- **THEN** the returned promise SHALL NOT fulfill until the upload attempt has either succeeded or failed (no early fulfillment while storage or insert is still in progress)

#### Scenario: Success path runs after fulfillment

- **WHEN** the upload completes successfully
- **THEN** the UI MAY clear the selected file and refresh the photo list only after the upload promise has fulfilled successfully

### Requirement: Credit spend occurs only after successful upload

When an upload is gated by credits, the system SHALL deduct credits only after the upload pipeline has completed successfully.

#### Scenario: Storage failure does not spend credits

- **WHEN** a credit-gated upload fails during storage upload
- **THEN** the system MUST NOT deduct credits for that attempt

#### Scenario: Database failure after storage does not spend credits

- **WHEN** a credit-gated upload fails during database insert after storage succeeded
- **THEN** the system MUST NOT deduct credits for that attempt

### Requirement: Structured failure information for debugging

On upload failure, the system SHALL classify the failure with a stable **phase** (e.g. validation, auth, storage, database, credits) and capture provider diagnostic fields when available (e.g. Supabase error message and code).

#### Scenario: Storage error includes phase and provider details

- **WHEN** Supabase Storage returns an error for the upload
- **THEN** failure handling MUST record phase `storage` and MUST include the provider error message and code in structured logging or existing error-tracking calls where applicable

#### Scenario: Database error includes phase and provider details

- **WHEN** the `photo` insert fails
- **THEN** failure handling MUST record phase `database` and MUST include the provider error message and code in structured logging or existing error-tracking calls where applicable

#### Scenario: User-visible message stays understandable

- **WHEN** any upload failure is shown to the user
- **THEN** the user-visible message MUST be understandable without internal jargon AND MUST NOT include secrets (tokens, full signed URLs)

### Requirement: No duplicate contradictory success/error notifications

For a single upload attempt, the system MUST NOT show multiple conflicting toasts for the same outcome (e.g. success toast followed immediately by error toast for the same attempt).

#### Scenario: Single failure signal

- **WHEN** an upload fails
- **THEN** the user MUST receive at most one primary error notification for that attempt (secondary inline UI optional)
