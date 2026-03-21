# Capability: Purchase Credits

## Overview
Enable users to buy credit packs that can be spent on premium features (extra babies, video uploads, extra photos). Credits provide pay-as-you-go flexibility without subscription commitment.

## Inputs

### User Selection
- **Credit package**: One of three pre-defined packs (10, 30, or 70 credits)
- **Currency**: Auto-detected (PHP or USD) based on timezone or manual selection

### Credit Packages

| Package | Credits | PHP Price | USD Price | Value |
|---------|---------|-----------|-----------|-------|
| Starter Pack | 10 | ₱20 | $0.50 | ₱2.00 per credit |
| Value Pack | 30 | ₱50 | $1.25 | ₱1.67 per credit |
| Premium Pack | 70 | ₱100 | $2.50 | ₱1.43 per credit |

### Payment Information
- **Payment method**: GCash (PHP) or PayPal (USD)
- **Account number**: User's GCash/PayPal account
- **Payment proof**: Screenshot of payment confirmation (image file)

## Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  CREDIT PURCHASE FLOW                       │
└─────────────────────────────────────────────────────────────┘

User Journey:
───────────────

1. SELECT PACKAGE
   User clicks "Buy Credits" on Upgrade page
   ↓
   Opens PaymentFlow dialog showing:
   - Selected package (e.g., "30 Credits - ₱50")
   - Currency (PHP or USD)
   
2. SELECT PAYMENT METHOD
   ↓
   User chooses:
   • GCash (if PHP) - Shows GCash number + QR code
   • PayPal (if USD) - Shows PayPal email
   
3. MAKE PAYMENT (External)
   ↓
   User opens GCash/PayPal app
   Transfers money to business account
   Takes screenshot of confirmation
   
4. UPLOAD PROOF
   ↓
   User uploads screenshot image
   Validates file (image type, <5MB)
   Uploads to Supabase Storage (payment_proofs bucket)
   
5. SUBMIT TRANSACTION
   ↓
   Creates payment_transactions record:
   {
     user_id: <current user>,
     amount_in_cents: 5000,  // ₱50 = 5000 centavos
     currency: "PHP",
     payment_method: "gcash",
     transaction_type: "credits",
     status: "pending",
     payment_proof_url: "payment_proofs/<uuid>.jpg",
     metadata: { credits: 30, packageIndex: 1 }
   }
   
6. WAIT FOR APPROVAL
   ↓
   Status: "Payment submitted! Approval within 24 hours."
   User sees transaction in "Pending Payments" section
   Credits NOT yet added to balance

Database State:
───────────────

payment_transactions:
  id: abc-123
  status: "pending"
  transaction_type: "credits"
  amount_in_cents: 5000

user_credits:
  credits_balance: 50  ← No change yet

Admin Action:
─────────────

7. ADMIN REVIEWS
   ↓
   Admin opens payment proof in Admin Panel
   Verifies:
   - Payment amount matches requested amount
   - Screenshot shows successful transfer
   - Account number matches business account
   
8a. ADMIN APPROVES ✓
   ↓
   Update payment_transactions:
     status: "completed"
     updated_at: NOW()
   
   ↓ Trigger Edge Function
   
   Edge Function: purchase-credits
   ↓
   BEGIN TRANSACTION;
     INSERT INTO credit_transactions (
       user_id, amount: 30, 
       transaction_type: "purchase",
       payment_transaction_id: abc-123
     );
     UPDATE user_credits
       SET credits_balance = credits_balance + 30
       WHERE user_id = <user>;
   COMMIT;
   
   ↓
   user_credits:
     credits_balance: 80  ← Was 50, now 80 (+30)
   
   ↓ React Query invalidates cache
   
   ↓
   User sees updated balance in UI
   Toast: "Credits purchased successfully!"

8b. ADMIN REJECTS ✗
   ↓
   Update payment_transactions:
     status: "rejected"
     admin_notes: "Amount mismatch"
   
   ↓
   No credits granted
   User notified to resubmit with correct payment
```

### Sequence Diagram

```
User          Upgrade.tsx    PaymentFlow    Supabase     Admin      EdgeFunction
  │                │              │            │           │              │
  ├─ Click Buy ───▶│              │            │           │              │
  │                ├─ Open ──────▶│            │           │              │
  │                │              ├─ Show QR ──│           │              │
  ├─ Upload proof ─────────────▶ │            │           │              │
  │                │              ├─ Upload ──▶│           │              │
  │                │              ├─ Create ───▶           │              │
  │                │              │  payment   │           │              │
  │                │              │  transaction          │              │
  │◀─ Success msg ──────────────┤            │           │              │
  │                │              │            │           │              │
  │                │              │            │   [Admin reviews]        │
  │                │              │            │           │              │
  │                │              │            │◀─ Approve ┤              │
  │                │              │            ├─ Update ──▶              │
  │                │              │            │  status    │              │
  │                │              │            ├─ Call ────────────────▶  │
  │                │              │            │            │   Grant credits
  │                │              │            │◀─ Credits granted ─────┤
  │◀─ Balance +30 ─────────────────────────────────────────┤              │
  │                │              │            │           │              │
```

## Outputs

### Success Case
- **payment_transactions record**: Created with `status: "pending"`
- **User notification**: "Payment submitted! Approval within 24 hours."
- **UI state**: Shows pending payment in transaction history
- **After approval**:
  - `user_credits.credits_balance` increased by purchased amount
  - `credit_transactions` record created (type: "purchase")
  - Toast notification: "Credits purchased successfully!"
  - UI shows updated balance immediately

### Error Cases

| Error | Cause | User Message | Recovery |
|-------|-------|--------------|----------|
| Invalid file type | Non-image file uploaded | "Please upload an image file (JPG, PNG)" | Re-upload correct file |
| File too large | Image >5MB | "File size must be under 5MB" | Compress or resize image |
| Upload failed | Supabase storage error | "Upload failed. Please try again." | Retry upload |
| Transaction creation failed | Database error | "Failed to submit payment. Try again." | Retry submission |
| Insufficient funds | User paid wrong amount | Admin rejects with note | Resubmit with correct amount |
| Payment rejected | Admin sees invalid proof | Status: "rejected" | User can resubmit |

## Business Rules

### Credit Pricing
- **Fixed packages**: Only 10, 30, or 70 credits available (no custom amounts)
- **No expiration**: Credits never expire
- **No refunds**: Once approved, credits cannot be refunded (manual process via support)
- **Currency locked**: User pays in detected/selected currency (no conversion)

### Payment Validation
- **Proof required**: Cannot submit without payment proof image
- **Admin approval**: All transactions require manual approval
- **24-hour SLA**: Payments reviewed within 24 hours (best effort)
- **Rejection reasons**: Amount mismatch, unclear proof, duplicate payment

### Credit Granting
- **Atomic operation**: Credits granted only after payment status = "completed"
- **Idempotent**: Edge function checks if credits already granted for payment_transaction_id
- **Transaction log**: `credit_transactions` record always created for audit trail
- **Balance cannot be negative**: CHECK constraint prevents negative balance

### Pending Credits
- **Not immediately usable**: Credits from pending payments excluded from balance calculation
- **UI shows pending**: User can see pending transactions but can't spend those credits yet
- **Approval unlocks**: Once approved, credits instantly available

## Edge Cases

### Double Payment Prevention
**Scenario:** User submits payment proof, then submits again for same payment.

**Handling:**
- Each payment proof creates a new `payment_transactions` record
- Admin sees both, can reject duplicates
- Edge function checks if credits already granted for same `payment_transaction_id` (idempotent)

**Mitigation:**
- UI disables submit button after first submission
- Show pending payments prominently so user doesn't retry

### Payment Amount Mismatch
**Scenario:** User selects 30 credits (₱50) but pays ₱20.

**Handling:**
- Admin sees requested amount vs. proof amount
- Admin rejects with note: "Paid ₱20, should be ₱50"
- User notified to pay correct amount or request refund

### Admin Approval Delay
**Scenario:** User buys credits at 11 PM, admin reviews next morning.

**Handling:**
- User sees "Pending approval" status immediately
- Credits not usable until approved
- If user needs immediate access, upgrade prompt suggests premium subscription

### File Upload Failure
**Scenario:** Network error during image upload.

**Handling:**
- Upload button shows error state
- User can retry upload
- No `payment_transactions` record created until upload succeeds

### Edge Function Failure
**Scenario:** Admin approves payment, but edge function fails to grant credits.

**Handling:**
- `payment_transactions.status` updated to "completed"
- Edge function failure logged
- Retry mechanism attempts credit grant again
- If repeated failures, admin manually triggers edge function

### Currency Confusion
**Scenario:** User's timezone suggests PHP but they want to pay in USD.

**Handling:**
- Currency switcher at top of Upgrade page
- User can manually select USD
- Payment method updates (shows PayPal instead of GCash)
- Amount updates to USD pricing

### Rejected Payment After Long Wait
**Scenario:** User waits 24 hours, payment rejected.

**Handling:**
- Email notification: "Payment rejected. Reason: <admin note>"
- User can view rejected transactions in history
- "Resubmit" button opens new payment flow with same package pre-selected

## UI Locations

### Primary Flow
1. **Upgrade Page** (`/app/upgrade`)
   - "Buy Credits" tab
   - Three credit package cards with "Buy Credits" buttons
   - Current credits balance badge at top

2. **Payment Dialog** (Modal overlay)
   - Step 1: Payment method selection (GCash/PayPal)
   - Step 2: Payment details (QR code, account number, amount)
   - Step 3: Upload proof (file picker, preview)
   - Step 4: Processing (loading state)
   - Step 5: Success (confirmation message)

3. **Transaction History** (On Upgrade page or Settings)
   - List of pending/completed/rejected payments
   - Shows: Date, Amount, Credits, Status

### Secondary Locations
- **Navigation Hub**: Credits balance badge next to premium icon
- **Feature Gates**: "Need X credits" messages with link to Upgrade page

## Dependencies

### Technical
- **Supabase Storage**: `payment_proofs` bucket for proof images
- **Supabase Edge Functions**: `purchase-credits` for atomic credit granting
- **React Query**: Cache invalidation after approval
- **usePricing Hook**: Currency detection and formatting
- **useSubscription Hook**: Fetching current balance, purchase mutation

### External
- **GCash**: User has GCash account and can transfer to business account
- **PayPal**: User has PayPal account (for international payments)
- **Admin Panel**: Admin has access to review and approve payments

### Data
- **payment_transactions table**: Stores payment proof and status
- **user_credits table**: Stores current balance
- **credit_transactions table**: Audit log of all credit movements

## Implementation Notes

### Payment Proof Upload
```typescript
// In PaymentFlow.tsx
const handleUpload = async (file: File) => {
  // 1. Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be under 5MB');
  }
  
  // 2. Upload to Supabase Storage
  const filename = `${uuid()}.${file.name.split('.').pop()}`;
  const { data, error } = await supabase.storage
    .from('payment_proofs')
    .upload(filename, file);
  
  if (error) throw error;
  
  return data.path; // e.g., "payment_proofs/abc-123.jpg"
};
```

### Transaction Creation
```typescript
// In usePaymentIntegration.tsx
const createPaymentTransaction = async (paymentRequest: PaymentRequest) => {
  const { data, error } = await supabase
    .from('payment_transactions')
    .insert({
      user_id: user.id,
      amount_in_cents: paymentRequest.amount * 100, // ₱50 → 5000
      currency: paymentRequest.currency,
      payment_method: paymentMethod, // "gcash" or "paypal"
      transaction_type: paymentRequest.type, // "credits"
      status: 'pending',
      payment_proof_url: proofPath,
      // Note: metadata stored as JSONB column if needed
    })
    .select()
    .single();
  
  if (error) throw error;
  return data.id; // payment_transaction_id
};
```

### Edge Function (purchase-credits)
```typescript
// supabase/functions/purchase-credits/index.ts
export async function handler(req: Request) {
  const { credits, paymentTransactionId } = await req.json();
  const userId = await getUserIdFromRequest(req);
  
  // 1. Verify payment is completed
  const { data: payment } = await supabase
    .from('payment_transactions')
    .select('status, transaction_type')
    .eq('id', paymentTransactionId)
    .single();
  
  if (!payment) {
    return new Response(JSON.stringify({ error: 'Payment not found' }), { status: 404 });
  }
  
  if (payment.status !== 'completed') {
    return new Response(JSON.stringify({ error: 'Payment not yet approved' }), { status: 400 });
  }
  
  if (payment.transaction_type !== 'credits') {
    return new Response(JSON.stringify({ error: 'Invalid transaction type' }), { status: 400 });
  }
  
  // 2. Check if credits already granted (idempotency)
  const { data: existing } = await supabase
    .from('credit_transactions')
    .select('id')
    .eq('payment_transaction_id', paymentTransactionId)
    .maybeSingle();
  
  if (existing) {
    // Credits already granted, return success (idempotent)
    const { data: balance } = await supabase
      .from('user_credits')
      .select('credits_balance')
      .eq('user_id', userId)
      .single();
    
    return new Response(JSON.stringify({ newBalance: balance.credits_balance, credits }), { status: 200 });
  }
  
  // 3. Grant credits atomically
  const { data, error } = await supabase.rpc('grant_credits', {
    p_user_id: userId,
    p_amount: credits,
    p_payment_transaction_id: paymentTransactionId,
    p_description: `Purchased ${credits} credits`
  });
  
  if (error) {
    console.error('Error granting credits:', error);
    return new Response(JSON.stringify({ error: 'Failed to grant credits' }), { status: 500 });
  }
  
  return new Response(JSON.stringify({ newBalance: data.new_balance, credits }), { status: 200 });
}
```

### Database Function (grant_credits)
```sql
CREATE OR REPLACE FUNCTION grant_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_transaction_id UUID,
  p_description TEXT
)
RETURNS TABLE(new_balance INTEGER) AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id, amount, transaction_type, description, payment_transaction_id
  ) VALUES (
    p_user_id, p_amount, 'purchase', p_description, p_payment_transaction_id
  );
  
  -- Update balance
  UPDATE user_credits
    SET credits_balance = credits_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  
  -- Return new balance
  RETURN QUERY
    SELECT credits_balance FROM user_credits WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### React Query Invalidation
```typescript
// In useSubscription.tsx
const purchaseCredits = useMutation({
  mutationFn: async ({ amount, credits, paymentTransactionId }) => {
    // Call edge function
    const { data, error } = await supabase.functions.invoke('purchase-credits', {
      body: { amount, credits, paymentTransactionId }
    });
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    // Invalidate credits query to refetch balance
    queryClient.invalidateQueries({ queryKey: ['userCredits', user?.id] });
    toast.success('Credits purchased successfully!');
  }
});
```

### Admin Approval Trigger
```typescript
// In Admin Panel
const handleApprove = async (paymentId: string) => {
  // 1. Update payment status
  await supabase
    .from('payment_transactions')
    .update({ status: 'completed', updated_at: new Date() })
    .eq('id', paymentId);
  
  // 2. Trigger edge function (or rely on webhook/cron)
  // For immediate granting, call directly:
  const { data: payment } = await supabase
    .from('payment_transactions')
    .select('amount_in_cents, currency, metadata')
    .eq('id', paymentId)
    .single();
  
  const credits = payment.metadata.credits;
  await supabase.functions.invoke('purchase-credits', {
    body: { credits, paymentTransactionId: paymentId }
  });
  
  toast.success('Payment approved and credits granted!');
};
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
