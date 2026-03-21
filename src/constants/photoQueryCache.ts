/**
 * React Query tuning for photo lists + Supabase signed URLs (3600s expiry).
 * Stale window matches product spec; gc evicts before URLs expire.
 */
export const PHOTO_QUERY_STALE_MS = 5 * 60 * 1000; // 5m
export const PHOTO_QUERY_GC_MS = 50 * 60 * 1000; // 50m
