# Auth & Onboarding - System Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTH & ONBOARDING SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │   Supabase   │───▶│  AuthContext  │───▶│   Protected  │ │
│  │     Auth     │    │   (Global)    │    │    Routes    │ │
│  └──────────────┘    └───────────────┘    └──────────────┘ │
│         │                     │                    │        │
│         │                     │                    │        │
│         ▼                     ▼                    ▼        │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │  Auth Pages  │    │  Onboarding   │    │  App Pages   │ │
│  │ (Login/Reg)  │    │   (Setup)     │    │ (Protected)  │ │
│  └──────────────┘    └───────────────┘    └──────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Relationships

1. **Supabase Auth** → Handles user authentication, token management, session storage
2. **AuthContext** → React Context providing auth state and methods to entire app
3. **Auth Pages** → Sign-in and sign-up UI
4. **Onboarding** → First-time user setup (create baby)
5. **Protected Routes** → Redirect unauthenticated users to /auth
6. **App Pages** → All authenticated user pages

## Data Model

### Supabase Auth Users Table
Managed by Supabase, not directly accessible via SQL queries.

```sql
-- Conceptual schema (managed by Supabase)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_user_meta_data JSONB  -- Stores { full_name: "..." }
);
```

**Access Pattern:**
- Not accessed directly via SQL
- Retrieved via Supabase JS client: `supabase.auth.getUser()`
- Available in React via `useAuth()` hook

### User Metadata Structure
```typescript
type UserMetadata = {
  full_name?: string;      // Stored during sign-up
  avatar_url?: string;     // Not implemented yet
  timezone?: string;       // Not implemented yet
};
```

**Storage:**
- Stored in `auth.users.raw_user_meta_data` JSON column
- Accessed via `user.user_metadata.full_name`
- Updated via `supabase.auth.updateUser({ data: { full_name: "New Name" } })`

### Session Structure
```typescript
type Session = {
  access_token: string;          // JWT token for API authentication
  refresh_token: string;         // Token for refreshing access token
  expires_in: number;            // Seconds until access token expires (3600 = 1 hour)
  expires_at: number;            // Unix timestamp of expiration
  token_type: "bearer";          // Always "bearer"
  user: User;                    // Full user object
};
```

**Token Contents (JWT):**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1678901234,
  "exp": 1678904834
}
```

### Auth State in Context
```typescript
type AuthState = {
  session: Session | null;       // Current session (null if logged out)
  user: User | null;             // Current user (null if logged out)
  loading: boolean;              // True during initial session check
  isAuthenticated: boolean;      // Derived: !!session
};
```

## Key Design Decisions

### 1. Supabase Auth (Not Custom Auth)
**Decision:** Use Supabase Auth instead of building custom authentication.

**Rationale:**
- **Security**: Supabase handles password hashing, token generation, session management
- **Features**: Email verification, password reset, OAuth (future) built-in
- **Scalability**: Designed to handle millions of users
- **Maintenance**: No need to update security libraries or patches
- **Cost**: Free for up to 50,000 active users

**Alternatives Considered:**
- Custom JWT auth: More control but high security risk and maintenance
- Firebase Auth: Similar features but Supabase integrates better with PostgreSQL

**Trade-offs:**
- ✅ Battle-tested security
- ✅ Zero maintenance overhead
- ✅ Built-in features (email verification, password reset)
- ❌ Vendor lock-in (migration would require rebuilding auth)
- ❌ Less customization (but extensible via hooks)

### 2. Email/Password Only (No OAuth Initially)
**Decision:** Launch with email/password only, add OAuth in v2.

**Rationale:**
- **Simplicity**: Single authentication flow to test and debug
- **Time to market**: OAuth integration adds 1-2 weeks of development
- **Market fit**: Philippines users comfortable with email/password
- **User data**: Full control over user accounts and data
- **Cost**: No OAuth provider setup or fees

**Future Path:**
- Google OAuth: Most requested provider
- Facebook OAuth: Popular in Philippines
- Apple Sign-In: Required for iOS app store

**Implementation:**
```typescript
// Future OAuth implementation
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/app`,
  },
});
```

**Trade-offs:**
- ✅ Faster launch
- ✅ Simpler codebase
- ✅ Full control
- ❌ Less convenient (no one-click sign-in)
- ❌ Password management burden on users

### 3. AuthContext for Global State (Not Per-Route)
**Decision:** Use React Context to provide auth state globally, not per-route checks.

**Rationale:**
- **Single source of truth**: All components access same auth state
- **Real-time sync**: Auth changes propagate immediately
- **Convenient API**: `useAuth()` hook available everywhere
- **Performance**: Context updates only when auth changes (rare)

**Implementation:**
```typescript
<AuthProvider>
  <App />
</AuthProvider>

// Any component can access
const { user, signOut } = useAuth();
```

**Alternatives Considered:**
- Per-route auth checks: Would duplicate logic, miss real-time updates
- Global store (Zustand/Redux): Overkill for auth-only state

**Trade-offs:**
- ✅ Clean API
- ✅ Real-time updates
- ✅ No prop drilling
- ❌ All context consumers re-render (acceptable for auth)

### 4. Automatic Onboarding Redirect
**Decision:** Automatically redirect authenticated users without babies to `/onboarding`.

**Rationale:**
- **Required step**: App is unusable without a baby profile
- **Clear next action**: Users know what to do
- **Prevent empty state**: Don't show home page with no data

**Implementation:**
```typescript
// In App.tsx or route guard
const { isAuthenticated } = useAuth();
const { babies, loading } = useBabyProfiles();

if (loading) return <LoadingSpinner />;

if (isAuthenticated && babies.length === 0) {
  return <Navigate to="/onboarding" replace />;
}
```

**Trade-offs:**
- ✅ Guided user experience
- ✅ No "empty app" confusion
- ✅ Clear value proposition (create baby to start)
- ❌ Can't explore app without baby (acceptable)

### 5. Single-Step Onboarding (Baby Creation Only)
**Decision:** Onboarding is just baby creation, no multi-step profile setup.

**Rationale:**
- **Minimal friction**: Get users to app value in <30 seconds
- **Core feature**: Baby profile is the essential data
- **Defer customization**: Profile editing can come later
- **Clear purpose**: User understands why they're providing this info

**Alternatives Considered:**
- Multi-step: Collect timezone, preferences, notifications settings upfront
- Skip onboarding: Allow app access without baby (show empty state)

**Trade-offs:**
- ✅ Fast time-to-value
- ✅ Low drop-off rate
- ✅ Focused on core feature
- ❌ No profile customization initially
- ❌ Can't skip onboarding

### 6. Form Validation: Zod + React Hook Form
**Decision:** Use Zod schemas for validation with react-hook-form integration.

**Rationale:**
- **Type safety**: Zod schemas generate TypeScript types automatically
- **Reusable**: Same schemas can be used for frontend and backend
- **Error messages**: Clear, customizable validation messages
- **Integration**: `@hookform/resolvers/zod` provides seamless hookup

**Example:**
```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
```

**Trade-offs:**
- ✅ Excellent DX (developer experience)
- ✅ Type-safe end-to-end
- ✅ Prevents invalid data submission
- ❌ Adds ~13KB to bundle (Zod library)

### 7. No Password Reset UI (Yet)
**Decision:** Defer password reset UI to v2, despite Supabase supporting it.

**Rationale:**
- **Low priority**: Most users stay signed in, rarely forget password
- **Time constraint**: Password reset is 2-3 components (request, confirm, set new)
- **Workaround exists**: Users can contact support for manual reset

**Future Implementation:**
```typescript
// Request password reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

// Update password (on reset-password page)
await supabase.auth.updateUser({
  password: newPassword,
});
```

**Trade-offs:**
- ✅ Faster initial launch
- ✅ Less code to maintain
- ❌ Poor UX for users who forget password
- ❌ Requires support intervention

### 8. Optional Email Verification
**Decision:** Email verification is configurable in Supabase, not enforced by default.

**Rationale:**
- **Reduced friction**: Users can start immediately without checking email
- **Better conversion**: No drop-off waiting for verification email
- **Test environment**: Easier for development and staging
- **Early stage**: Less concern about fake accounts with small user base

**Supabase Configuration:**
```
Settings → Auth → Email Auth → Confirm email: disabled
```

**Future Path:** Enable email verification when abuse/spam becomes an issue.

**Trade-offs:**
- ✅ Zero friction sign-up
- ✅ Better conversion rates
- ✅ Easier testing
- ❌ Potential fake accounts
- ❌ Unverified emails can't receive password reset (if enabled)

### 9. Session Persistence via HTTP-Only Cookies
**Decision:** Let Supabase client handle session storage via HTTP-only cookies.

**Rationale:**
- **Security**: HTTP-only cookies not accessible via JavaScript (XSS protection)
- **Automatic**: Supabase client handles storage, refresh, and expiration
- **No manual token management**: Zero security risks from improper token handling
- **Cross-tab sync**: Session changes sync across browser tabs

**Implementation:**
```typescript
// Supabase client auto-detects storage
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: window.localStorage,  // Fallback if cookies unavailable
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,       // For OAuth redirects
  },
});
```

**Trade-offs:**
- ✅ Secure by default
- ✅ Zero maintenance
- ✅ Cross-tab sync
- ❌ Can't access tokens manually (not needed)

### 10. Auth Error Tracking
**Decision:** Track all auth errors in PostHog for monitoring and debugging.

**Rationale:**
- **Visibility**: Know when/why users fail to sign in
- **Debugging**: Trace error patterns and edge cases
- **UX improvement**: Identify confusing error messages
- **Alerting**: Get notified of auth system issues

**Implementation:**
```typescript
const signIn = async (email: string, password: string) => {
  try {
    await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    trackAuthError(error, "login");  // PostHog event
    toast.error(error.message);
  }
};
```

**Tracked Events:**
- `auth_error` (type: signup, login, logout)
- `email_verification_sent`
- `password_reset_requested`

**Trade-offs:**
- ✅ Proactive issue detection
- ✅ Better error messages based on data
- ❌ Adds analytics dependency

## Data Flow Diagrams

### Sign-Up Flow

```
User visits /auth → Register tab
  │
  ├─ Enters form data:
  │   • Full name
  │   • Email
  │   • Password
  │   • Confirm password
  │
  ├─ Client-side validation (Zod)
  │   ↓
  │   Checks: email format, password length, passwords match
  │   ↓
  │   Valid? Invalid → Show errors
  │
  ├─ Submit to Supabase
  │   ↓
  │   supabase.auth.signUp({ email, password, options: { data: { full_name } } })
  │   ↓
  │   Supabase creates user:
  │   1. Hash password with bcrypt
  │   2. Store user in auth.users table
  │   3. Store { full_name } in raw_user_meta_data
  │   4. Generate access_token + refresh_token (JWT)
  │   5. Set HTTP-only cookies
  │   6. [Optional] Send confirmation email
  │   ↓
  │   Return: { user, session }
  │
  ├─ onAuthStateChange fires (SIGNED_IN event)
  │   ↓
  │   AuthContext updates:
  │   - setSession(session)
  │   - setUser(user)
  │   - isAuthenticated = true
  │   ↓
  │   Toast: "Account created. Check email to confirm."
  │
  ├─ Navigate to /app
  │   ↓
  │   App checks: babies.length === 0?
  │   ↓
  │   Yes → Redirect to /onboarding
  │
  └─ User creates first baby → Home page
```

### Sign-In Flow

```
User visits /auth → Login tab
  │
  ├─ Enters credentials:
  │   • Email
  │   • Password
  │
  ├─ Client-side validation (Zod)
  │   ↓
  │   Checks: email format, password length
  │   ↓
  │   Valid? Invalid → Show errors
  │
  ├─ Submit to Supabase
  │   ↓
  │   supabase.auth.signInWithPassword({ email, password })
  │   ↓
  │   Supabase verifies:
  │   1. User exists with this email?
  │   2. Password hash matches?
  │   3. [Optional] Email confirmed?
  │   ↓
  │   Success? Error?
  │   │
  │   ├─ Success:
  │   │   ↓
  │   │   Generate tokens, set cookies, return { user, session }
  │   │
  │   └─ Error:
  │       ↓
  │       Return error: "Invalid login credentials"
  │
  ├─ onAuthStateChange fires (SIGNED_IN event)
  │   ↓
  │   AuthContext updates
  │   ↓
  │   Toast: "Signed in successfully"
  │
  └─ Navigate to /app → Home page
```

### Session Refresh (Automatic)

```
User has active session
  │
  ├─ 1 hour passes (access_token expires)
  │   ↓
  │   Supabase client detects expiration
  │   ↓
  │   Automatically calls Supabase refresh endpoint
  │   ↓
  │   POST /auth/v1/token?grant_type=refresh_token
  │   Body: { refresh_token: "..." }
  │   ↓
  │   Supabase validates refresh_token:
  │   - Token valid? (not expired, not revoked)
  │   - User still exists?
  │   ↓
  │   Generate new access_token (new 1-hour expiry)
  │   ↓
  │   Update HTTP-only cookies
  │   ↓
  │   Return: { access_token, refresh_token, user, session }
  │
  ├─ onAuthStateChange fires (TOKEN_REFRESHED event)
  │   ↓
  │   AuthContext updates session
  │   ↓
  │   User stays signed in (no UI change)
  │
  └─ Continue using app seamlessly
```

### Onboarding Flow

```
New user signs up
  │
  ├─ Navigate to /app
  │   ↓
  │   App checks: babies.length === 0?
  │   ↓
  │   Yes → Navigate to /onboarding
  │
  ├─ Onboarding page renders
  │   ↓
  │   Show baby creation form:
  │   - Baby's name (required)
  │   - Birthdate (required)
  │   - Gender (optional, defaults to "other")
  │
  ├─ User fills form and submits
  │   ↓
  │   Client-side validation (react-hook-form)
  │   ↓
  │   Call createBaby({ name, dateOfBirth, gender })
  │   ↓
  │   INSERT INTO baby (user_id, name, date_of_birth, gender)
  │   VALUES (auth.uid(), ...)
  │   ↓
  │   Success? Error?
  │   │
  │   ├─ Success:
  │   │   ↓
  │   │   Toast: "Welcome! [Baby name]'s journal is ready."
  │   │   ↓
  │   │   Navigate to /app
  │   │   ↓
  │   │   Home page renders with baby's month view
  │   │
  │   └─ Error:
  │       ↓
  │       Toast: "Failed to create profile: [error]"
  │       ↓
  │       User can retry
```

## Security Considerations

### Password Security
- **Hashing**: bcrypt with automatic salt (Supabase default)
- **Minimum length**: 8 characters (enforced client and server)
- **No maximum**: Supabase supports up to 72 characters
- **No complexity rules**: Initially no requirement for numbers/symbols
- **Strengthening**: Can enable complexity rules in Supabase settings

### Token Security
- **Storage**: HTTP-only cookies (immune to XSS)
- **Transmission**: HTTPS only (no plain HTTP)
- **Expiration**: Access token (1 hour), refresh token (30 days)
- **Rotation**: Refresh tokens can be rotated on use (Supabase setting)
- **Revocation**: Tokens can be revoked by admin or on sign-out

### Row-Level Security (RLS)
All user data tables protected by RLS:

```sql
-- Baby table
CREATE POLICY "Users can only access own babies"
  ON baby FOR ALL
  USING (auth.uid() = user_id);

-- Photo table
CREATE POLICY "Users can only access own photos"
  ON photo FOR ALL
  USING (auth.uid() = user_id);

-- Milestone table
CREATE POLICY "Users can only access milestones for own babies"
  ON milestone FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM baby
      WHERE baby.id = milestone.baby_id
      AND baby.user_id = auth.uid()
    )
  );
```

### CSRF Protection
- **HTTP-only cookies**: Can't be read by JavaScript
- **SameSite attribute**: Cookies sent only to same site
- **Supabase handles**: CSRF tokens managed internally

### XSS Protection
- **React**: Automatic escaping of user input
- **Content Security Policy**: Can be added in Supabase hosting
- **No dangerouslySetInnerHTML**: Avoided throughout app

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
