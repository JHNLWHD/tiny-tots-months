# photo-lightbox-slideshow Specification

## Purpose

The full-screen photo lightbox SHALL support optional slideshow playback with safe defaults and predictable behavior for single-slide and video cases.

## Requirements

### Requirement: Slideshow controls in lightbox

The lightbox SHALL expose slideshow playback controls (play and pause) when more than one slide is available. Autoplay SHALL NOT start without a deliberate user action unless product explicitly chooses autoplay on open—default is off per design.

#### Scenario: Start slideshow

- **WHEN** the lightbox is open with at least two slides and the user starts slideshow
- **THEN** the viewer advances automatically after the configured delay until paused or closed

#### Scenario: Single slide

- **WHEN** only one slide exists
- **THEN** slideshow controls are hidden or disabled and no autoplay runs

### Requirement: Slideshow delay is bounded

The slideshow delay SHALL be a fixed configurable interval (e.g. 4 seconds) documented in design; it SHALL not be zero.

#### Scenario: Advance timing

- **WHEN** slideshow is playing
- **THEN** slides advance after the configured delay while the lightbox remains open

### Requirement: Video slides do not break the viewer

For video slides, the system SHALL either integrate with the lightbox’s video support or pause slideshow advancement until the user advances manually—behavior MUST be consistent and SHALL NOT leave the user stuck with a blank slide.

#### Scenario: Video in album

- **WHEN** a slide is a video and slideshow is playing
- **THEN** the UI remains usable (playback or skip behavior per implementation choice documented in design)
