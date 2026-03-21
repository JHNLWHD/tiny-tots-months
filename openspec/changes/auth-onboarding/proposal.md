# Auth & Onboarding System

## Problem
The app needs a secure, simple authentication system that:
- Allows users to create accounts and sign in
- Protects user data (babies, photos, milestones) via Row-Level Security
- Provides smooth onboarding experience for new users
- Handles auth state persistence across sessions
- Prevents unauthorized access to protected pages

**Key Challenges:**
- Email verification requirement (Supabase default)
- First-time user onboarding (must create baby before accessing app)
- Auth state management across app
- Secure token handling
- Password reset/recovery
- Error handling and user feedback

## Solution
A streamlined authentication system built on Supabase Auth:

**Authentication Methods:**
- **Email/Password**: Primary authentication method
- Password requirements: Minimum 8 characters
- Email confirmation: Optional (configurable in Supabase)

**User Flow:**
1. **New User**: Sign up → Email confirmation (optional) → Onboarding → Create first baby → Access app
2. **Returning User**: Sign in → Access app (with existing babies)

**Security Features:**
- Row-Level Security (RLS) on all user data tables
- Supabase Auth JWT tokens for session management
- HTTP-only cookies for token storage
- Automatic session refresh
- Password strength validation

**Onboarding:**
- Single-step onboarding: Create first baby profile
- Redirect users without babies to `/onboarding`
- Redirect users with babies to `/app` home page

## Scope

### ✅ In Scope
- Email/password registration
- Email/password sign-in
- Sign out
- Auth state management (AuthContext)
- Protected routes (redirect if not authenticated)
- First-time user onboarding flow
- Baby creation during onboarding
- Form validation (Zod schemas)
- Error handling and toast notifications
- Session persistence (refresh tokens)
- Password strength requirements

### ❌ Out of Scope
- OAuth providers (Google, Facebook, Apple) - not implemented
- Magic link authentication - not implemented
- Password reset/forgot password - not implemented in UI
- Two-factor authentication (2FA)
- Email verification enforcement (optional)
- Account deletion
- Email change
- Password change UI (can be done via Supabase)

### 🔮 Future Enhancements
- Google OAuth sign-in
- Password reset flow
- Email verification enforcement
- Profile editing (full name, avatar)
- Account settings page
- Two-factor authentication
- Account deletion with data export

## User Journeys

### New User Sign-Up Flow

```
User visits /auth
  │
  ├─ Clicks "Register" tab
  │
  ├─ Enters:
  │   • Full name
  │   • Email
  │   • Password (8+ chars)
  │   • Confirm password
  │
  ├─ Submits form
  │   ↓
  │   Supabase creates user account
  │   ↓
  │   Auth state updated (user signed in)
  │   ↓
  │   Toast: "Account created. Check email to confirm."
  │
  ├─ Navigate to /app
  │   ↓
  │   App.tsx checks: User has babies?
  │   ↓
  │   No babies → Redirect to /onboarding
  │
  ├─ Onboarding page:
  │   • Enter baby name
  │   • Select birthdate
  │   • Select gender (optional)
  │   ↓
  │   Create baby profile
  │   ↓
  │   Toast: "Welcome! [Baby name]'s journal is ready."
  │
  └─ Navigate to /app
      ↓
      Home page with baby's month view
```

### Returning User Sign-In Flow

```
User visits /auth
  │
  ├─ Enters email + password
  │
  ├─ Submits form
  │   ↓
  │   Supabase verifies credentials
  │   ↓
  │   Auth state updated (user signed in)
  │   ↓
  │   Toast: "Signed in successfully"
  │
  └─ Navigate to /app
      ↓
      App.tsx checks: User has babies?
      ↓
      Yes → Show home page
```

### Sign-Out Flow

```
User clicks "Sign out" (Settings/Nav)
  │
  ├─ Call signOut()
  │   ↓
  │   Supabase clears session
  │   ↓
  │   Auth state cleared
  │   ↓
  │   Toast: "Signed out"
  │
  └─ Navigate to / (landing page)
```

## Data Model

### User Table (Supabase Auth)
Managed by Supabase Auth, not directly accessible via SQL.

```typescript
type User = {
  id: string;                    // UUID
  email: string;                 // User's email
  created_at: string;            // ISO timestamp
  user_metadata: {
    full_name?: string;          // Stored during sign-up
  };
};
```

**Access:**
- Via `supabase.auth.getUser()`
- Available in AuthContext as `user`

### Session Management
```typescript
type Session = {
  access_token: string;          // JWT for API calls
  refresh_token: string;         // For refreshing access token
  expires_at: number;            // Unix timestamp
  user: User;                    // User object
};
```

**Storage:**
- HTTP-only cookies (managed by Supabase client)
- Automatically refreshed when expired

### Row-Level Security
All user data tables enforce RLS:

```sql
-- Example: baby table RLS policy
CREATE POLICY "Users can only see own babies"
  ON baby FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only create own babies"
  ON baby FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Key Design Decisions

### 1. Email/Password Only (No OAuth)
**Decision:** Start with email/password authentication, defer OAuth to v2.

**Rationale:**
- **Simplicity**: Fewer dependencies, faster to implement
- **Control**: Full control over user data and flow
- **Philippines market**: Email/password is familiar, widely trusted
- **Cost**: No OAuth provider fees

**Alternatives Considered:**
- Google OAuth: More convenient but adds complexity
- Magic links: No password needed but email delivery issues

**Trade-offs:**
- ✅ Simple implementation
- ✅ No third-party dependencies
- ✅ Works everywhere (no blocked OAuth in some countries)
- ❌ Less convenient (users must remember password)
- ❌ Password reset needed (not implemented yet)

### 2. Single-Step Onboarding (Create Baby)
**Decision:** Onboarding requires only baby creation, no additional profile setup.

**Rationale:**
- **Minimal friction**: Get users to app value quickly
- **Core feature**: Baby profile is essential to use app
- **Defer optional setup**: Profile editing can come later
- **User expectation**: App is about babies, so asking for baby info makes sense

**Alternatives Considered:**
- Multi-step onboarding: Collect more info (timezone, preferences) upfront
- Skip onboarding: Allow app access without baby (show empty state)

**Trade-offs:**
- ✅ Fast time-to-value (user sees app immediately)
- ✅ Clear purpose (app needs baby to function)
- ❌ Can't skip onboarding (must create baby)
- ❌ No profile customization (avatar, bio)

### 3. AuthContext for Global State
**Decision:** Use React Context to manage auth state app-wide.

**Rationale:**
- **Single source of truth**: All components access same auth state
- **Real-time updates**: `onAuthStateChange` listener updates context
- **Convenient hooks**: `useAuth()` hook available everywhere
- **Protected routes**: Easy to check `isAuthenticated` in route guards

**Alternatives Considered:**
- Local state per component: Would require prop drilling
- Global store (Zustand/Redux): Overkill for auth-only state

**Trade-offs:**
- ✅ Simple, built-in React feature
- ✅ No additional dependencies
- ✅ Automatic re-renders when auth changes
- ❌ Context re-renders all consumers (acceptable for auth)

### 4. Automatic Onboarding Redirect
**Decision:** App automatically redirects users without babies to `/onboarding`.

**Rationale:**
- **Required step**: App is unusable without a baby profile
- **Clear path**: Users know what to do next
- **Prevent confusion**: Don't show empty home page

**Implementation:**
```typescript
// In App.tsx or protected route
if (isAuthenticated && babies.length === 0) {
  return <Navigate to="/onboarding" />;
}
```

**Trade-offs:**
- ✅ Guides users to complete setup
- ✅ Prevents "empty app" experience
- ❌ Can't explore app without baby (acceptable)

### 5. No Password Reset UI (Yet)
**Decision:** Password reset functionality exists in Supabase but no UI implemented.

**Rationale:**
- **Time constraint**: Password reset is edge case, defer to v2
- **Workaround**: Users can reset via Supabase email flow manually
- **Low priority**: Most users stay signed in, rarely forget password

**Future Implementation:**
- "Forgot password?" link on sign-in page
- Send reset email via `supabase.auth.resetPasswordForEmail()`
- Reset page to set new password

**Trade-offs:**
- ✅ Faster initial launch
- ❌ Poor UX for users who forget password (must contact support)

### 6. Optional Email Verification
**Decision:** Email verification is configurable in Supabase, not enforced by default.

**Rationale:**
- **Reduced friction**: Users can start using app immediately
- **Test environment**: Easier for development/testing
- **Philippines market**: Less concern about fake signups early on

**Future Path:** Enable email verification when abuse/fake accounts become issue.

**Trade-offs:**
- ✅ No verification delay
- ✅ Better conversion (users don't drop off waiting for email)
- ❌ Potential fake accounts
- ❌ Unverified emails can't receive password reset

### 7. Form Validation with Zod
**Decision:** Use Zod schemas for form validation with react-hook-form.

**Rationale:**
- **Type safety**: Zod schemas generate TypeScript types
- **Reusable**: Same schemas for frontend and backend validation
- **Clear errors**: Zod provides helpful error messages
- **Integration**: Works seamlessly with react-hook-form

**Example:**
```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

**Trade-offs:**
- ✅ Excellent developer experience
- ✅ Type-safe validation
- ✅ Clear user error messages
- ❌ Adds bundle size (~13KB for Zod)

## Auth State Flow

### Initial Page Load

```
Browser loads app
  │
  ├─ AuthProvider mounts
  │   ↓
  │   Set up onAuthStateChange listener
  │   ↓
  │   Call supabase.auth.getSession()
  │   ↓
  │   Session found? (from HTTP-only cookie)
  │   │
  │   ├─ Yes: setSession(session), setUser(user), setLoading(false)
  │   │
  │   └─ No: setSession(null), setUser(null), setLoading(false)
  │
  ├─ App checks isAuthenticated
  │   │
  │   ├─ True: Render protected routes (/app)
  │   │
  │   └─ False: Redirect to /auth or show public pages
  │
  └─ Components can use useAuth() hook
```

### Sign-In Action

```
User submits sign-in form
  │
  ├─ signIn(email, password) called
  │   ↓
  │   supabase.auth.signInWithPassword({ email, password })
  │   ↓
  │   Success? Error?
  │   │
  │   ├─ Success:
  │   │   ↓
  │   │   onAuthStateChange fires with SIGNED_IN event
  │   │   ↓
  │   │   AuthContext updates: setSession, setUser
  │   │   ↓
  │   │   Toast: "Signed in successfully"
  │   │   ↓
  │   │   navigate("/app")
  │   │
  │   └─ Error:
  │       ↓
  │       Toast: "Sign in failed: [error message]"
  │       ↓
  │       Track error in analytics
```

### Token Refresh (Automatic)

```
Access token expires (default: 1 hour)
  │
  ├─ Supabase client detects expiration
  │   ↓
  │   Uses refresh_token to get new access_token
  │   ↓
  │   onAuthStateChange fires with TOKEN_REFRESHED event
  │   ↓
  │   AuthContext updates session
  │   ↓
  │   User stays signed in (no interruption)
```

## Components

### AuthContext.tsx
Provides global auth state and methods.

**Exports:**
```typescript
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};
```

**Key Logic:**
- `onAuthStateChange` listener updates state
- `signUp` stores full_name in user_metadata
- All methods handle errors and show toasts

### Auth.tsx (Sign In/Sign Up Page)
Tab-based UI for login and registration.

**Features:**
- Two tabs: Login, Register
- Form validation with Zod + react-hook-form
- Password confirmation on registration
- Redirect if already authenticated
- Back to landing page link

**Validation Rules:**
```typescript
// Login
email: valid email format
password: min 8 characters

// Register
fullName: min 2 characters
email: valid email format
password: min 8 characters
confirmPassword: must match password
```

### Onboarding.tsx
First-time user setup page.

**Features:**
- Create first baby profile
- Required fields: name, birthdate
- Optional field: gender (defaults to "other")
- Redirects to /app on success
- Redirects to /app if user already has babies

**Logic:**
```typescript
// Redirect users with babies
if (babies.length > 0) {
  return <Navigate to="/app" replace />;
}

// Create baby and navigate
onSubmit: createBaby(data) → navigate("/app")
```

## Error Handling

### Sign-Up Errors
| Error | Cause | User Message |
|-------|-------|--------------|
| Email already registered | Duplicate email | "User already registered" |
| Weak password | Password <8 chars | Zod validation: "Password must be at least 8 characters" |
| Invalid email | Malformed email | Zod validation: "Please enter a valid email" |
| Network error | No internet | "An error occurred during sign up" |

### Sign-In Errors
| Error | Cause | User Message |
|-------|-------|--------------|
| Invalid credentials | Wrong email/password | "Invalid email or password" |
| Email not confirmed | Unverified email (if enabled) | "Email not confirmed" |
| Network error | No internet | "An error occurred during sign in" |

### Onboarding Errors
| Error | Cause | User Message |
|-------|-------|--------------|
| Baby creation failed | Database error | "Failed to create profile: [error]" |
| Empty name | Validation | "Name is required" |
| Empty birthdate | Validation | "Birthdate is required" |

## Security

### Row-Level Security (RLS)
All user data is protected by RLS policies:

```sql
-- Users can only access their own data
CREATE POLICY "Users own their data"
  ON baby FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their photos"
  ON photo FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their milestones"
  ON milestone FOR ALL
  USING (auth.uid() = (SELECT user_id FROM baby WHERE baby.id = milestone.baby_id));
```

### Token Storage
- **Access token**: HTTP-only cookie (not accessible via JavaScript)
- **Refresh token**: HTTP-only cookie
- **Session**: Managed by Supabase client library
- **No manual token handling**: All automatic

### Password Requirements
- Minimum 8 characters
- No maximum length (Supabase default: 72 chars)
- No complexity requirements (numbers, symbols) initially
- Can be strengthened in Supabase settings

### Session Expiration
- Access token: 1 hour (default)
- Refresh token: 30 days (default)
- Automatic refresh when access token expires
- User stays signed in until:
  - Manual sign out
  - Refresh token expires (30 days of inactivity)
  - Token revoked by admin

## UI Locations

### Auth Page (`/auth`)
- Tab 1: Login form (email, password)
- Tab 2: Register form (full name, email, password, confirm password)
- "Back to landing page" link

### Onboarding Page (`/onboarding`)
- Welcome header with baby icon
- Baby creation form:
  - Baby's name (required)
  - Birthdate (required)
  - Gender (optional: male, female, prefer not to say)
- "Get Started" button
- Footer note: "You can add more babies later"

### Navigation (When signed in)
- User menu dropdown (top-right)
  - "Settings" link
  - "Sign out" button

### Protected Routes
All routes under `/app/*` require authentication:
- Redirect to `/auth` if not signed in
- Redirect to `/onboarding` if signed in but no babies

## Implementation Notes

### AuthContext Setup
```typescript
// In main.tsx or App.tsx
import { AuthProvider } from '@/context/AuthContext';

<AuthProvider>
  <App />
</AuthProvider>
```

### Protected Route Example
```typescript
// In App.tsx or router
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  
  return children;
};

// Usage
<Route path="/app" element={<ProtectedRoute><Home /></ProtectedRoute>} />
```

### Using Auth in Components
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <div>
      <p>Welcome, {user?.user_metadata?.full_name}!</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
