# Capability: Email Sign-Up & Sign-In

## Overview
Allow users to create accounts and sign in using email/password authentication powered by Supabase Auth. Provides secure, persistent sessions with automatic token refresh.

## Inputs

### Sign-Up (Registration)
```typescript
type SignUpInput = {
  fullName: string;      // Min 2 characters
  email: string;         // Valid email format
  password: string;      // Min 8 characters
  confirmPassword: string; // Must match password
};
```

### Sign-In (Login)
```typescript
type SignInInput = {
  email: string;         // Valid email format
  password: string;      // Min 8 characters
};
```

## Process Flow

### Sign-Up Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     SIGN-UP PROCESS                         │
└─────────────────────────────────────────────────────────────┘

User visits /auth
  │
  ├─ Clicks "Register" tab
  │
  ├─ Enters form data:
  │   Full name: "John Doe"
  │   Email: "john@example.com"
  │   Password: "securepass123"
  │   Confirm: "securepass123"
  │
  ├─ CLIENT-SIDE VALIDATION (Zod)
  │   ↓
  │   Checks:
  │   ✓ Full name ≥ 2 chars
  │   ✓ Email valid format
  │   ✓ Password ≥ 8 chars
  │   ✓ Passwords match
  │   ↓
  │   Valid? → Continue
  │   Invalid? → Show field errors, stop
  │
  ├─ SUBMIT TO SUPABASE
  │   ↓
  │   signUp(email, password, fullName)
  │   ↓
  │   supabase.auth.signUp({
  │     email: "john@example.com",
  │     password: "securepass123",
  │     options: {
  │       data: { full_name: "John Doe" }
  │     }
  │   })
  │   ↓
  │   SUPABASE PROCESSING:
  │   1. Check email not already registered
  │   2. Hash password with bcrypt
  │   3. Create user in auth.users table
  │   4. Store { full_name: "John Doe" } in user_metadata
  │   5. Generate JWT access_token (1-hour expiry)
  │   6. Generate refresh_token (30-day expiry)
  │   7. Set HTTP-only cookies
  │   8. [If enabled] Send confirmation email
  │   ↓
  │   Return: { user, session }
  │
  ├─ AUTH STATE CHANGE EVENT
  │   ↓
  │   onAuthStateChange fires with SIGNED_IN event
  │   ↓
  │   AuthContext updates:
  │   - session = { access_token, refresh_token, user, ... }
  │   - user = { id, email, user_metadata: { full_name }, ... }
  │   - isAuthenticated = true
  │   - loading = false
  │   ↓
  │   Toast: "Account created. Check email to confirm."
  │
  ├─ NAVIGATION
  │   ↓
  │   navigate("/app")
  │   ↓
  │   App.tsx checks: Does user have babies?
  │   ↓
  │   No → Redirect to /onboarding
  │
  └─ User completes onboarding → Home page
```

### Sign-In Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     SIGN-IN PROCESS                         │
└─────────────────────────────────────────────────────────────┘

User visits /auth
  │
  ├─ Enters credentials:
  │   Email: "john@example.com"
  │   Password: "securepass123"
  │
  ├─ CLIENT-SIDE VALIDATION (Zod)
  │   ↓
  │   Checks:
  │   ✓ Email valid format
  │   ✓ Password ≥ 8 chars
  │   ↓
  │   Valid? → Continue
  │   Invalid? → Show field errors, stop
  │
  ├─ SUBMIT TO SUPABASE
  │   ↓
  │   signIn(email, password)
  │   ↓
  │   supabase.auth.signInWithPassword({
  │     email: "john@example.com",
  │     password: "securepass123"
  │   })
  │   ↓
  │   SUPABASE VERIFICATION:
  │   1. Find user by email
  │   2. Verify password hash matches
  │   3. [If enabled] Check email confirmed
  │   4. Check account not disabled
  │   ↓
  │   Success? Error?
  │   │
  │   ├─ SUCCESS:
  │   │   ↓
  │   │   Generate tokens, set cookies
  │   │   Return: { user, session }
  │   │
  │   └─ ERROR:
  │       ↓
  │       Return: { error: "Invalid login credentials" }
  │
  ├─ AUTH STATE CHANGE EVENT
  │   ↓
  │   onAuthStateChange fires with SIGNED_IN event
  │   ↓
  │   AuthContext updates (same as sign-up)
  │   ↓
  │   Toast: "Signed in successfully"
  │
  └─ NAVIGATION
      ↓
      navigate("/app")
      ↓
      Home page renders
```

## Outputs

### Success Cases

**Sign-Up Success:**
```json
{
  "user": {
    "id": "abc-123-uuid",
    "email": "john@example.com",
    "user_metadata": {
      "full_name": "John Doe"
    },
    "created_at": "2026-03-08T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "xyz-refresh-token",
    "expires_in": 3600,
    "expires_at": 1678964400,
    "token_type": "bearer"
  }
}
```

**UI Response:**
- Toast notification: "Account created. Please check your email to confirm your account."
- Navigate to `/app` → Redirect to `/onboarding` (if no babies)

**Sign-In Success:**
- Same session structure as sign-up
- Toast notification: "Signed in successfully"
- Navigate to `/app` → Home page

### Error Cases

| Error Scenario | Cause | User Message | UI State |
|----------------|-------|--------------|----------|
| **Email already exists** | Duplicate email on sign-up | "User already registered" | Show error toast, stay on form |
| **Invalid credentials** | Wrong email or password | "Invalid email or password" | Show error toast, stay on form |
| **Weak password** | Password <8 chars | "Password must be at least 8 characters" | Show field error below input |
| **Invalid email** | Malformed email | "Please enter a valid email address" | Show field error below input |
| **Passwords don't match** | confirmPassword ≠ password | "Passwords don't match" | Show field error below confirm input |
| **Network error** | No internet connection | "An error occurred during sign up/in" | Show error toast, enable retry |
| **Email not confirmed** | Unverified email (if enforced) | "Email not confirmed" | Show error toast with link to resend |

## Business Rules

### Password Requirements
- **Minimum length**: 8 characters (enforced client and server)
- **No maximum**: Supabase supports up to 72 characters
- **No complexity**: No requirement for uppercase, numbers, or symbols (initially)
- **Strengthening**: Can add complexity rules in Supabase settings later

### Email Validation
- **Format check**: Must be valid email format (RFC 5322)
- **Normalization**: Emails are case-insensitive (john@example.com === JOHN@example.com)
- **Uniqueness**: One account per email address
- **Verification**: Optional email confirmation (configurable in Supabase)

### Session Management
- **Access token expiry**: 1 hour (automatically refreshed)
- **Refresh token expiry**: 30 days (requires re-login after)
- **Automatic refresh**: Supabase client refreshes token before expiry
- **Sign-out**: Invalidates both tokens immediately

### Rate Limiting
Supabase default rate limits:
- **Sign-up**: 10 requests per hour per IP
- **Sign-in**: 30 requests per hour per IP
- **Password reset**: 5 requests per hour per email

### User Metadata
- **Full name**: Stored in `user_metadata.full_name` during sign-up
- **Editable**: User can update via profile settings (not implemented yet)
- **Optional fields**: Avatar, timezone, preferences (future)

## Edge Cases

### Email Confirmation (If Enabled)
**Scenario:** User signs up but doesn't confirm email.

**Handling:**
- User receives confirmation email from Supabase
- User can still sign in (if `SUPABASE_AUTH_CONFIRM_EMAIL` is disabled)
- If enabled, sign-in fails with "Email not confirmed" error
- Confirmation link redirects to app with token in URL
- Supabase auto-confirms email via token

**Mitigation:**
- Add "Resend confirmation email" button on auth page
- Show clear message: "Please check your email to confirm your account"

### Expired Session
**Scenario:** User's refresh token expires (30 days of inactivity).

**Handling:**
- User opens app → Supabase tries to refresh → Refresh token invalid
- `onAuthStateChange` fires with SIGNED_OUT event
- AuthContext updates: session = null, isAuthenticated = false
- App redirects to `/auth`
- User must sign in again

**User Experience:**
- Toast: "Your session has expired. Please sign in again."

### Password Reset (Not Implemented Yet)
**Scenario:** User forgets password.

**Current Handling:**
- No "Forgot password?" link on sign-in page
- User must contact support for manual reset

**Future Implementation:**
```typescript
// Request reset email
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

// On reset-password page (from email link)
await supabase.auth.updateUser({ password: newPassword });
```

### Already Authenticated User Visits /auth
**Scenario:** Signed-in user navigates to `/auth` page.

**Handling:**
```typescript
if (isAuthenticated && !loading) {
  return <Navigate to="/app" replace />;
}
```

User immediately redirected to `/app` home page.

### Sign-Up While Signed In (Edge Case)
**Scenario:** User opens second tab, signs in, returns to first tab still showing sign-up form.

**Handling:**
- First tab's AuthContext syncs via `onAuthStateChange` listener
- Sign-up form detects `isAuthenticated = true`
- Redirects to `/app` automatically

### Network Failure During Sign-Up
**Scenario:** User submits sign-up form but network request fails.

**Handling:**
- Supabase client throws error
- `signUp` catch block catches error
- Toast: "An error occurred during sign up. Please try again."
- Form state resets: isSubmitting = false
- User can retry submission

## UI Locations

### Auth Page (`/auth`)
**Layout:**
- Centered card with tabs
- Tab 1: Login
- Tab 2: Register

**Login Form:**
```
┌─────────────────────────────────┐
│          Login Tab              │
├─────────────────────────────────┤
│                                 │
│  Email                          │
│  [____________________________] │
│                                 │
│  Password                       │
│  [____________________________] │
│                                 │
│  [    Sign in    ]             │
│                                 │
└─────────────────────────────────┘
```

**Register Form:**
```
┌─────────────────────────────────┐
│         Register Tab            │
├─────────────────────────────────┤
│                                 │
│  Full Name                      │
│  [____________________________] │
│                                 │
│  Email                          │
│  [____________________________] │
│                                 │
│  Password                       │
│  [____________________________] │
│                                 │
│  Confirm Password               │
│  [____________________________] │
│                                 │
│  [   Create account   ]        │
│                                 │
└─────────────────────────────────┘
```

**Footer:**
- Link: "Back to landing page" → `/`

### After Sign-In/Sign-Up
- Navigate to `/app`
- If no babies → Redirect to `/onboarding`
- If has babies → Show home page

## Dependencies

### Technical
- **Supabase Auth** (`@supabase/supabase-js`): Authentication backend
- **React Hook Form** (`react-hook-form`): Form state management
- **Zod** (`zod`): Schema validation
- **React Router** (`react-router-dom`): Navigation after auth
- **Sonner** (`sonner`): Toast notifications

### Context
- **AuthContext**: Provides auth state and methods globally
- **useAuth Hook**: Access auth state in any component

### Backend
- **Supabase Auth API**: `/auth/v1/signup`, `/auth/v1/token`
- **RLS Policies**: Protect user data based on `auth.uid()`

## Implementation Notes

### AuthContext Setup
```typescript
// In AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Form Validation Schemas
```typescript
// Login schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Register schema
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### Protected Route Guard
```typescript
// In App.tsx or route configuration
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Usage
<Route path="/app" element={<ProtectedRoute><Home /></ProtectedRoute>} />
```

### Error Handling
```typescript
// In Auth.tsx
const handleLogin = async (data: LoginFormValues) => {
  try {
    await signIn(data.email, data.password);
    // Success handled by AuthContext (toast + navigate)
  } catch (error) {
    // Error already handled in signIn() with toast
    // Form stays visible for retry
  }
};
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
