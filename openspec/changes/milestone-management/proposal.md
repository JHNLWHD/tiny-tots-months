# Milestone Management System

## Problem
Parents want to record and remember the special "firsts" and developmental achievements of their baby's early months. The app needs a simple yet meaningful way to:

- Capture text-based milestones (first smile, first steps, first word, etc.)
- Organize milestones by baby's age (month-by-month)
- Provide milestone suggestions to remind parents what to look for
- Display milestones in an easy-to-browse timeline
- Preserve these memories for years to come

**Key Challenges:**
- Babies develop at different rates (one size doesn't fit all)
- Parents forget to record milestones in the moment
- Need to make recording quick and easy (mobile-first)
- Balance structured suggestions vs. free-form input
- Month calculations relative to birth date

## Solution
A milestone tracking system organized by month with intelligent suggestions and flexible input:

**Core Capabilities:**
- **Create Milestones** - Add text milestones to any month
- **View Timeline** - Browse milestones month-by-month
- **Delete Milestones** - Remove entries
- **Milestone Suggestions** - Age-appropriate suggestions to inspire entries
- **Month Navigation** - Easy browsing through baby's timeline

**Key Features:**
- Text-only milestones (simple, no images)
- Month-based organization (Month 1-36+)
- Curated milestone suggestions per age
- No edit functionality (delete + recreate pattern)
- Newest milestones first
- No limits on milestone count (free feature)

## Scope

### ✅ In Scope
- Create text-based milestones
- Delete milestones
- View milestones per month
- Milestone suggestions (curated library)
- Month calculation from birth date
- Timeline navigation (month cards)
- Progress tracking (months with content)
- Milestone count per baby
- Export to "Wrapped" year-in-review

### ❌ Out of Scope
- Editing milestones (delete + recreate instead)
- Photo attachments to milestones
- Video milestones
- Milestone templates with fields
- Milestone categories/tags
- Sharing milestones
- Printing/PDF export
- Reminders to add milestones
- Developmental milestone checklists

### 🔮 Future Enhancements
- Edit milestone functionality
- Rich text formatting
- Milestone categories (motor, cognitive, social, etc.)
- Photo attachment per milestone
- Milestone search
- Developmental checklists (CDC/WHO)
- Milestone reminders/notifications
- Compare with typical development
- Export milestones to PDF/book

## Success Metrics

### User Experience
- Users add at least 1 milestone per month (first 6 months)
- Milestone creation takes <15 seconds
- Suggestions used in 40%+ of milestone entries
- Zero friction in adding milestones

### Engagement
- Average milestones per baby: 15-25 (first year)
- Milestone-to-photo ratio: ~1:3
- Monthly active milestone additions
- Wrapped engagement (milestone recap)

### Technical
- Milestone creation <200ms
- Timeline loads <1 second
- Suggestions render instantly

## Assumptions
1. Text-only milestones are sufficient (photos separate)
2. Parents will record 1-3 milestones per month on average
3. Milestone suggestions inspire but don't limit entries
4. Month-based organization is intuitive
5. No editing needed (delete+recreate acceptable)
6. Free feature (no premium gating)
7. No developmental tracking/comparison needed

## Constraints
- **No premium gating** - Milestones are free for all users
- **Text length** - Reasonable limit (1000 chars)
- **Month range** - 1-36 months typical, technically unlimited
- **No editing** - By design (simplicity)
- **No attachments** - Text only
- **Month calculation** - Relative to baby's birth date

## Dependencies

### Internal Systems
- **Baby Management** - Associate milestones with babies
- **Auth System** - User identity for ownership
- **Month System** - Month calculation logic

### Database
- **milestone table** - Stores milestone text and metadata
- **Cascade delete** - Remove milestones when baby deleted

### UI Libraries
- React Hook Form - Form management
- React Query - Data fetching and caching

## Risks

### Low Priority
1. **Data Loss** - Accidental deletion with no undo
   - Mitigation: Confirmation dialogs (not implemented yet)

2. **Suggestion Overload** - Too many suggestions overwhelm users
   - Mitigation: Curated list per month, hide after use

3. **Month Calculation Bugs** - Wrong month for milestones
   - Mitigation: Simple formula, tested

4. **No Edit Causes Frustration** - Users want to fix typos
   - Mitigation: Delete+recreate pattern (acceptable for MVP)

## Alternative Approaches Considered

### 1. Milestone Templates with Fields
**Rejected** - Too structured, limits flexibility. Parents want free-form text.

### 2. Rich Text Formatting
**Rejected** - Adds complexity. Plain text is cleaner and faster.

### 3. Photo Attachments to Milestones
**Rejected** - Photos are separate feature. Keeps milestone system simple.

### 4. Editing Milestones
**Rejected** - Simpler to delete+recreate. Editing adds complexity for rare use case.

### 5. Developmental Checklists (CDC guidelines)
**Rejected** - Medical/clinical feel. Parents want personal memories, not clinical tracking.

### 6. Premium-Gated Milestones
**Rejected** - Core feature should be free. Monetize elsewhere (photos, videos).

## Implementation Notes

### Database Schema
```sql
CREATE TABLE milestone (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID NOT NULL REFERENCES baby(id) ON DELETE CASCADE,
  milestone_text TEXT NOT NULL,
  month_number INTEGER NOT NULL CHECK (month_number >= 1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_milestone_baby_month ON milestone(baby_id, month_number);
```

### Month Calculation
```typescript
// Month number is always relative to birth
// Month 1 = birth month (age 0-1 month)
// Month 2 = birth month + 1 (age 1-2 months)
// Month 12 = birth month + 11 (age 11-12 months)

const getMonthNameFromMonthNumber = (birthDate: Date, monthNumber: number) => {
  const birthMonth = birthDate.getMonth(); // 0-11
  const monthIndex = (birthMonth + monthNumber - 1) % 12;
  return monthNames[monthIndex];
};

// Example:
// Baby born: March 15, 2024
// Month 1: March (age 0-1 month)
// Month 2: April (age 1-2 months)
// Month 12: February (age 11-12 months)
```

### Milestone Suggestions
```typescript
// Curated suggestions per month
const suggestions = {
  1: [
    "First smile",
    "Can lift head briefly",
    "Responds to sounds",
    // ...
  ],
  2: [
    "Holds head steady",
    "Coos and babbles",
    "Follows objects with eyes",
    // ...
  ],
  // ... up to month 36+
};
```

### Key Code Locations
- **Hook:** `src/hooks/useMilestones.tsx`
- **Form Component:** `src/components/MilestoneForm.tsx`
- **Display Component:** `src/components/month/MilestoneSection.tsx`
- **Suggestions:** `src/lib/milestoneSuggestions.ts`
- **Month Utils:** `src/utils/monthUtils.ts`

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
