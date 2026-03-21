# Capability: Baby gallery advanced (search, favorites, compare, large libraries)

## ADDED Requirements

### Requirement: Caption search filters visible photos

The system SHALL provide a text control on the baby gallery (and on the month photo section where this change is applied) that filters the currently considered photo list to items whose `description` contains the query string, case-insensitive. Empty query SHALL restore the unfiltered list for search purposes (other filters still apply).

#### Scenario: Match by caption

- **WHEN** the user enters text that appears in a photo’s description
- **THEN** only matching photos (and still passing month/type/favorites filters) are shown in the grid or timeline

#### Scenario: No matches

- **WHEN** the query matches no photo descriptions
- **THEN** the UI shows an empty state that suggests clearing search or filters

### Requirement: Favorites are persisted and filterable

The system SHALL persist a boolean favorite flag per photo row and SHALL allow the owner to toggle it from the photo card or grid without opening the lightbox. The baby gallery SHALL offer a filter to show only favorited photos. For responsive UX, the client MAY update **React Query caches** for month and baby-gallery photo lists optimistically when toggling, and SHALL revert those caches (or refetch) if the mutation fails so the heart and lists do not lie.

#### Scenario: Toggle favorite

- **WHEN** the user activates the favorite control on a photo
- **THEN** the photo’s favorite state flips and remains after refresh

#### Scenario: Favorites-only filter

- **WHEN** the user selects a “Favorites only” (or equivalent) filter
- **THEN** only photos with favorite set true are shown

### Requirement: Month photo grid wires delete and favorite via handlers

In the month photo section grid (`PhotoGrid`), the system SHALL obtain explicit user confirmation before deleting from the month flow (e.g. alert dialog). The system SHALL pass an `onDelete` card callback (`(photo: Photo) => void`) into each card only when the parent wired a grid-level delete handler that runs **after** confirmation with the photo **id**. The card SHALL show the favorite control when `onToggleFavorite` is provided (no separate `showDeleteButton` / `showFavoriteButton` flags).

#### Scenario: Delete and favorite visible on month grid

- **WHEN** the user views the month photos grid with both handlers wired
- **THEN** each card shows favorite and delete controls

#### Scenario: Gallery without delete on card

- **WHEN** a surface renders cards with `onToggleFavorite` but does not pass `onDelete` (card handler)
- **THEN** only the favorite control appears on the card

### Requirement: Compare two photos side by side

The system SHALL provide a compare mode on the baby gallery where the user selects exactly two photos and opens a side-by-side view (stacked vertically on narrow viewports). The user SHALL be able to close the compare view and return to the gallery with prior filters preserved.

#### Scenario: Successful compare

- **WHEN** compare mode is on and the user selects two distinct photos then confirms or opens compare
- **THEN** both images render at readable size with basic metadata (e.g. month or date) if available

#### Scenario: Exit compare

- **WHEN** the user closes compare or turns off compare mode
- **THEN** the gallery returns to normal interaction (e.g. opening lightbox on card click)

### Requirement: Large libraries load additional pages from the server

When the baby’s photo count exceeds the threshold defined in design (default 500), the system SHALL fetch photos in pages from the server and SHALL expose a clear way to load more (e.g. button). Until the user loads more pages, only fetched photos participate in client-side filters and search.

#### Scenario: Load more

- **WHEN** more photos exist on the server than the current page holds
- **THEN** the user can request the next page and newly fetched photos appear in the gallery

#### Scenario: Small library unchanged

- **WHEN** the baby is under the threshold
- **THEN** behavior remains equivalent to loading the full set in one or few requests as implemented
