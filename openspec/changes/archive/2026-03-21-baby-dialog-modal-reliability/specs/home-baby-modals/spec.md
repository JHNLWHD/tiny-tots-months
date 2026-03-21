## ADDED Requirements

### Requirement: Mutually exclusive baby modals on Home

The Home screen SHALL represent the active baby-related modal with at most one of: none, add-baby, or edit-baby for a specific baby profile. The system SHALL NOT treat Add Baby and Edit Baby as independent boolean flags that can both be “open” at once.

#### Scenario: User opens Add Baby

- **WHEN** the user chooses Add Baby from Home while no other baby modal is active  
- **THEN** the Add Baby dialog SHALL be open and the Edit Baby dialog SHALL NOT be open  

#### Scenario: User opens Edit Baby

- **WHEN** the user chooses Edit on a baby profile from Home while no other baby modal is active  
- **THEN** the Edit Baby dialog SHALL be open for that baby and the Add Baby dialog SHALL NOT be open  

---

### Requirement: Add Baby remains usable after Edit Baby

After the user has opened and closed the Edit Baby dialog (by any normal dismiss path: cancel, overlay, close control, or successful save), the Add Baby entry point on Home SHALL remain clickable and SHALL open the Add Baby dialog when the user is permitted to add a baby.

#### Scenario: Edit then Add

- **WHEN** the user opens Edit Baby, then closes it completely  
- **THEN** the user SHALL be able to open Add Baby on the next interaction (subject to existing permission gating)  

#### Scenario: No dead clicks on Add Baby

- **WHEN** the user closes Edit Baby  
- **THEN** the page SHALL NOT leave a full-screen or invisible layer that blocks pointer input on Add Baby or other primary Home actions  

#### Scenario: Stacking matches Radix modal / pointer-events guidance

- **WHEN** the baby dialogs are implemented on Home  
- **THEN** the implementation SHALL account for Radix modal dialog behavior described in [radix-ui/primitives#2122](https://github.com/radix-ui/primitives/issues/2122) (modal `DialogContent` and outside pointer disabling vs nested portaled widgets) by using an approved pattern such as **non-modal `Dialog` (`modal={false}`) with an explicit backdrop and documented scroll/pointer mitigations**, so closing Edit Baby does not depend on undocumented body style hacks  

---

### Requirement: Edit Baby opens reliably in development

The Edit Baby dialog SHALL open when requested from Home while the application runs with React 18 Strict Mode enabled (development), without requiring a second user click solely because of an extra mount/unmount cycle.

#### Scenario: Strict Mode double mount does not clear modal state

- **WHEN** the user opens Edit Baby and the framework performs a development-only remount of the dialog subtree  
- **THEN** the parent modal state SHALL NOT be cleared by a spurious dialog `onOpenChange(false)` that only occurs due to that remount  
- **THEN** the Edit Baby dialog SHALL still appear or remain open as appropriate for the user’s action  

---

### Requirement: Nested Select inside baby dialogs

Gender selection inside Add Baby and Edit Baby dialogs SHALL NOT break dialog teardown: when the dialog closes, any open Select dropdown SHALL be closed, and the implementation SHALL use patterns compatible with Radix Dialog + Select and [radix-ui/primitives#2122](https://github.com/radix-ui/primitives/issues/2122) (e.g. Home baby **`Dialog` with `modal={false}`**, **`staticBackdrop`** / non–`RemoveScroll` dim layer, controlled Select open cleared on close, Select content portaled inside the dialog via **`container`** when supported).

#### Scenario: Dialog closes with Select closed

- **WHEN** the user closes Add Baby or Edit Baby while the gender Select was open or had been opened during that session  
- **THEN** the Select SHALL not leave the application in a state where subsequent clicks on the page are ignored  
