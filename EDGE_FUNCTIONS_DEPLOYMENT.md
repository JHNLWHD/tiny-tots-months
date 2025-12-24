# Edge Functions Deployment Guide

This guide explains how to deploy the Supabase Edge Functions for database transactions using **Drizzle ORM**.

## Overview

The edge functions use **Drizzle ORM** with PostgreSQL transactions to ensure atomic database operations. This approach provides:
- Type-safe database queries
- Built-in transaction support
- No need for custom PostgreSQL functions
- Better developer experience with TypeScript

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Project Reference**: Your project ID (found in `supabase/config.toml` or Supabase Dashboard)
3. **Service Role Key**: Required for edge functions to access the database with admin privileges
4. **Database Connection String** (optional): Direct database connection URL for better performance

## Step 1: Get Database Connection String (Optional but Recommended)

For optimal performance, you can use a direct database connection string:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Database**
3. Find the **Connection string** section
4. Copy the **Connection pooling** URI (recommended for serverless)
   - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

Alternatively, the functions will construct the connection string automatically from `PROJECT_URL` and `SERVICE_ROLE_KEY`.

**Note**: Environment variable names cannot start with `SUPABASE_` as it's reserved by Supabase. Use `PROJECT_URL`, `SERVICE_ROLE_KEY`, and `DATABASE_URL` instead.

## Step 2: Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

#### 2.1 Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
npm install -g supabase
```

#### 2.2 Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

#### 2.3 Link Your Project

```bash
cd /path/to/tiny-tots-months
supabase link --project-ref htxczdhdospkxjesvztw
```

Replace `htxczdhdospkxjesvztw` with your actual project reference if different.

#### 2.4 Set Environment Variables

Edge functions need access to your Supabase URL and service role key. Set these as secrets:

**Important**: Environment variable names cannot start with `SUPABASE_` as it's reserved by Supabase.

```bash
# Get your service role key from: Project Settings > API > service_role key

supabase secrets set PROJECT_URL=https://htxczdhdospkxjesvztw.supabase.co
supabase secrets set SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Set direct database connection string for better performance
# supabase secrets set DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Important**: Never commit your service role key to version control. It has admin access to your database.

#### 2.5 Deploy Functions

Deploy all functions at once:

```bash
supabase functions deploy update-payment-transaction
supabase functions deploy purchase-credits
supabase functions deploy spend-credits
```

Or deploy all functions in the `supabase/functions` directory:

```bash
# Deploy all functions
for func in supabase/functions/*/; do
  if [ -f "$func/index.ts" ]; then
    func_name=$(basename "$func")
    supabase functions deploy "$func_name"
  fi
done
```

#### 2.6 Verify Deployment

Check that functions are deployed:

```bash
supabase functions list
```

### Option B: Using Supabase Dashboard (Manual)

#### 2.1 Prepare Functions

1. Create a zip file for each function:
   ```bash
   # For each function directory
   cd supabase/functions/update-payment-transaction
   zip -r update-payment-transaction.zip .
   # Repeat for purchase-credits and spend-credits
   ```

#### 2.2 Upload via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click **Create a new function**
4. For each function:
   - Enter the function name (e.g., `update-payment-transaction`)
   - Upload the zip file
   - Click **Deploy function**

#### 2.3 Set Environment Variables

1. In the Edge Functions section, go to **Settings**
2. Add the following secrets:
   - `PROJECT_URL`: Your Supabase project URL (e.g., `https://htxczdhdospkxjesvztw.supabase.co`)
   - `SERVICE_ROLE_KEY`: Your service role key (from Project Settings > API)
   - `DATABASE_URL` (optional): Direct database connection string for better performance

**Note**: Environment variable names cannot start with `SUPABASE_` as it's reserved by Supabase.

## Step 3: Test the Functions

### Test Update Payment Transaction

```bash
# Using curl
curl -X POST \
  'https://htxczdhdospkxjesvztw.supabase.co/functions/v1/update-payment-transaction' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "transactionId": "your-transaction-id",
    "status": "completed",
    "externalPaymentId": "optional-external-id",
    "adminNotes": "optional-notes"
  }'
```

### Test Purchase Credits

```bash
curl -X POST \
  'https://htxczdhdospkxjesvztw.supabase.co/functions/v1/purchase-credits' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 1000,
    "credits": 10,
    "paymentTransactionId": "your-payment-transaction-id"
  }'
```

### Test Spend Credits

```bash
curl -X POST \
  'https://htxczdhdospkxjesvztw.supabase.co/functions/v1/spend-credits' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 5,
    "description": "Used for video upload"
  }'
```

## Step 4: Update Client Code

The client code has already been updated to call these edge functions. Make sure your environment variables are set:

```env
VITE_SUPABASE_URL=https://htxczdhdospkxjesvztw.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Function Returns 401 Unauthorized

- Ensure you're passing the `Authorization` header with a valid JWT token
- The token should be from an authenticated user session

### Function Returns 500 Internal Server Error

- Check the function logs in Supabase Dashboard > Edge Functions > [Function Name] > Logs
- Verify that environment variables (`PROJECT_URL`, `SERVICE_ROLE_KEY`) are set correctly
- Check database connection: Ensure the connection string is correct and the database is accessible
- Verify Drizzle schema matches your database schema
- **Note**: Make sure environment variable names don't start with `SUPABASE_` (use `PROJECT_URL` and `SERVICE_ROLE_KEY` instead)

### Database Transaction Errors

- **No PostgreSQL functions needed**: The functions use Drizzle ORM transactions directly, so no custom PostgreSQL functions are required
- Check that your database tables exist and match the Drizzle schema in `supabase/functions/_shared/schema.ts`
- Verify connection string format if using `SUPABASE_DB_URL`
- Check for connection pool limits if using connection pooler

### CORS Errors

- The functions include CORS headers, but if you're still seeing CORS errors:
  - Check that the `Access-Control-Allow-Origin` header is set correctly
  - Verify the request is coming from an allowed origin

## Monitoring

### View Function Logs

**Via CLI**:
```bash
supabase functions logs update-payment-transaction
```

**Via Dashboard**:
- Go to Edge Functions > [Function Name] > Logs

### View Function Metrics

- Go to Edge Functions > [Function Name] > Metrics
- Monitor invocation count, error rate, and latency

## Security Best Practices

1. **Never expose service role key**: Only use it in edge functions, never in client-side code
2. **Use RLS policies**: Ensure your database tables have Row Level Security enabled
3. **Validate inputs**: Edge functions validate inputs, but also validate on the client side
4. **Monitor logs**: Regularly check function logs for suspicious activity
5. **Rate limiting**: Consider adding rate limiting for production use

## Rollback

If you need to rollback a function:

1. **Via CLI**:
   ```bash
   supabase functions delete function-name
   ```

2. **Via Dashboard**:
   - Go to Edge Functions > [Function Name] > Settings
   - Click **Delete function**

## Next Steps

- Set up monitoring and alerting for function errors
- Configure function timeouts if needed (default is 60 seconds)
- Consider adding retry logic in the client code for transient failures
- Set up CI/CD to automatically deploy functions on merge to main

