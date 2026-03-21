# Select Baby Profile

## Description
Switch the active baby context in the application to view and manage a different baby's milestones, photos, and timeline. This is a client-side state change that determines which baby's data is displayed throughout the UI.

## Capability ID
`select-baby`

---

## Inputs

| Field  | Type   | Required | Validation                 | Notes                           |
|--------|--------|----------|----------------------------|---------------------------------|
| baby   | object | Yes      | Valid Baby object from list | Complete baby profile           |

### Input Structure
```typescript
type Baby = {
  id: string;
  name: string;
  date_of_birth: string;  // ISO date
  gender: string | null;
  user_id: string | undefined;
  created_at: string;
};
```

### Input Constraints
- Baby must exist in user's baby list
- Baby must belong to authenticated user
- No validation beyond TypeScript type checking

---

## Process Flow

```
User                    UI Layer                State
  │                        │                      │
  │  1. Click baby card    │                      │
  │  or dropdown item      │                      │
  ├─────────────────────>  │                      │
  │                        │  2. onSelectBaby()   │
  │                        ├─────────────────────>│
  │                        │                      │
  │                        │  3. setSelectedBaby  │
  │                        │     (React state)    │
  │                        │<─────────────────────│
  │                        │                      │
  │                        │  4. UI re-renders:   │
  │                        │     • Highlight card │
  │                        │     • Update context │
  │                        │     • Load timeline  │
  │                        │     • Load photos    │
  │                        │     • Update breadcr │
  │  5. See updated UI     │                      │
  │  showing selected baby │                      │
  │<───────────────────────│                      │
```

### Step-by-Step Details

1. **User initiates selection**
   - **Option A:** Click baby card in NavigationHub
   - **Option B:** Select from dropdown in BabySelector
   - **Option C:** Auto-selected on create/delete

2. **Selection handler called**
   - `onSelectBaby(baby)` passed down from parent component
   - Usually defined in `Home.tsx` as `setSelectedBaby`

3. **State updated**
   - React state setter: `setSelectedBaby(baby)`
   - In-memory only (no persistence)
   - Triggers component re-renders

4. **UI updates cascade**
   - **Baby card:** Highlighted with purple border or background
   - **Context card:** Shows selected baby's large display
   - **Month timeline:** Loads months for selected baby
   - **Breadcrumbs:** Updates to show selected baby name
   - **Gallery:** Filters photos for selected baby
   - **Wrapped:** Shows stats for selected baby

5. **User sees immediate feedback**
   - Visual highlight on selected card
   - Content switches to new baby instantly

---

## Outputs

### Success Case
- **State:** `selectedBaby` set to new baby object
- **UI:**
  - Selected baby card visually highlighted
  - Context card displays selected baby info
  - Timeline shows selected baby's months
  - All baby-specific data reloads
- **No network call** (pure client-side state)

### No Error Cases
- This is a pure client-side operation
- Cannot fail (assuming valid baby object passed)

---

## Business Rules

### Selection Rules
1. **Single selection** - Only one baby can be active at a time
2. **No persistence** - Selection resets on page reload
3. **Auto-selection** - First baby auto-selected on initial load
4. **Default fallback** - If selected baby deleted, auto-select next

### Auto-Selection Scenarios
1. **On page load:**
   - If baby list loads and `selectedBaby` is `null`
   - Select first baby (newest created, per `order by created_at DESC`)

2. **On baby created:**
   - Automatically select newly created baby
   - Makes new baby immediately active

3. **On baby deleted:**
   - If deleted baby was selected, select next baby
   - If no babies remain, set `selectedBaby = null`

### State Management
```typescript
// Auto-select first baby on load
useEffect(() => {
  if (babies.length > 0 && !selectedBaby) {
    setSelectedBaby(babies[0]);
  }
}, [babies, selectedBaby]);
```

---

## Edge Cases

### 1. No Babies Available
**Scenario:** User has 0 babies (empty list)  
**Handling:**
- `selectedBaby = null`
- Empty state component shown
- No selection possible
- "Add Your First Baby" CTA displayed

### 2. Selected Baby Deleted in Another Tab
**Scenario:** Baby is deleted in Tab A, still selected in Tab B  
**Handling:**
- Tab B still shows selected baby (stale state)
- When Tab B refetches baby list, selected baby no longer exists
- Next auto-selection logic runs
- If selected baby ID not in list, auto-select first

### 3. Page Reload
**Scenario:** User refreshes page  
**Handling:**
- Selection lost (in-memory only)
- On reload, baby list fetched
- Auto-selection runs, first baby selected
- User may need to manually reselect their intended baby

### 4. Switching Babies While Data Loading
**Scenario:** User rapidly switches between babies  
**Handling:**
- Each selection triggers data refetch
- React Query manages concurrent requests
- Latest selection "wins" (stale queries discarded)
- No race conditions (React Query handles this)

### 5. URL Navigation
**Scenario:** User navigates to `/app/month/:babyId/:monthNumber`  
**Handling:**
- Baby ID from URL takes precedence
- Selected baby updated to match URL
- If URL baby ID invalid, redirect to `/app`

---

## UI Locations

### Entry Points
1. **NavigationHub** (`/app`)
   - Click any baby card
   - Visual: Card background changes to purple gradient when selected

2. **BabySelector Dropdown** (multiple pages)
   - Select from dropdown list
   - Shows checkmark next to selected baby

3. **BabyList Card View** (alternative UI)
   - Click card to select
   - Selected card has ring/border highlight

### Visual Feedback
```tsx
// Selected card styling
className={`${
  selectedBaby?.id === baby.id
    ? "bg-baby-purple text-white shadow-lg transform scale-105"
    : "bg-gray-50 hover:bg-baby-purple/10"
}`}
```

### Components
- **NavigationHub:** Primary selection UI
- **BabySelector:** Dropdown selection
- **BabyList:** Card grid selection
- **ProgressIndicator:** Shows selected baby progress
- **MonthCardGrid:** Filtered by selected baby

---

## Dependencies

### Internal
- **Baby List State:** `useBabyProfiles()` - Provides list of available babies
- **React State:** Local state in parent component (usually `Home.tsx`)
- **Routing:** React Router for URL-based selection

### External
- None (pure client-side state management)

### State Structure
```typescript
// In Home.tsx or similar parent
const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);

// Passed down to children
<NavigationHub
  selectedBaby={selectedBaby}
  onSelectBaby={setSelectedBaby}
  // ...
/>
```

---

## Related Capabilities
- `create-baby` - Auto-selects newly created baby
- `delete-baby` - Updates selection if deleted baby was selected
- `list-babies` - Provides available babies to select from

---

## Known Issues & Future Improvements

### Known Issues
1. **No persistence:** Selection lost on page reload
2. **No URL sync:** Selected baby not reflected in URL (except on Month page)
3. **Multi-tab inconsistency:** Selection doesn't sync across tabs

### Future Improvements
1. **localStorage persistence:** Remember selected baby across sessions
   ```typescript
   localStorage.setItem('selectedBabyId', baby.id);
   ```

2. **URL parameter:** Add `?baby=:id` to URLs to persist selection
   ```typescript
   const [searchParams, setSearchParams] = useSearchParams();
   const selectedBabyId = searchParams.get('baby');
   ```

3. **Cross-tab sync:** Use `BroadcastChannel` or `storage` events to sync selection

4. **Smart defaults:** Remember user's "favorite" baby based on interaction history

5. **Keyboard shortcuts:** Allow keyboard navigation between babies (←/→ arrows)

---

## Testing Checklist

### Functional Tests
- [ ] Clicking baby card selects that baby
- [ ] Selected card visually highlighted
- [ ] Context card updates to show selected baby
- [ ] Timeline loads for selected baby
- [ ] Photos filter to selected baby
- [ ] First baby auto-selected on load
- [ ] New baby auto-selected on creation

### Edge Case Tests
- [ ] No babies: no selection, empty state shown
- [ ] Deleting selected baby auto-selects next
- [ ] Deleting non-selected baby keeps selection
- [ ] Page reload resets to first baby
- [ ] Rapid switching doesn't break UI
- [ ] URL navigation updates selection

### UI Tests
- [ ] Selected card has correct styling
- [ ] Hover states work on non-selected cards
- [ ] Selection visible on both card and dropdown
- [ ] Mobile: dropdown selection works correctly

---

## Implementation Notes

### Code Locations
- **State:** `src/pages/Home.tsx` (line 27)
- **Selection Handler:** `src/pages/Home.tsx` (line 112 - passed as prop)
- **Auto-Selection:** `src/pages/Home.tsx` (lines 93-98)
- **Deletion Logic:** `src/pages/Home.tsx` (lines 52-62)
- **UI Components:**
  - `src/components/home/NavigationHub.tsx`
  - `src/components/home/BabySelector.tsx`
  - `src/components/home/BabyList.tsx`

### Key Code
```typescript
// State declaration
const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);

// Auto-select first baby
useEffect(() => {
  if (babies.length > 0 && !selectedBaby) {
    setSelectedBaby(babies[0]);
  }
}, [babies, selectedBaby]);

// Selection handler (passed to children)
<NavigationHub
  selectedBaby={selectedBaby}
  onSelectBaby={setSelectedBaby}
  babies={babies}
/>

// Visual selection indicator
<div
  onClick={() => onSelectBaby(baby)}
  className={`${
    selectedBaby?.id === baby.id
      ? "bg-baby-purple text-white"
      : "bg-gray-50"
  }`}
>
  {baby.name}
</div>
```

### Alternative Implementation (with persistence)
```typescript
// localStorage-backed selection
const [selectedBaby, setSelectedBaby] = useState<Baby | null>(() => {
  const savedId = localStorage.getItem('selectedBabyId');
  return babies.find(b => b.id === savedId) || null;
});

const handleSelectBaby = (baby: Baby) => {
  setSelectedBaby(baby);
  localStorage.setItem('selectedBabyId', baby.id);
};
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
