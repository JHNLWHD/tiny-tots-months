-- Favorites for gallery backlog features (grid thumbnails use Supabase Storage image transforms on signed URLs, not a separate object).
ALTER TABLE public.photo
	ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.photo.is_favorite IS 'User-marked favorite; toggled from gallery/month views.';

-- RLS: authenticated owners can UPDATE their rows (e.g. is_favorite).
-- Assumes RLS is already enabled on public.photo with other policies (SELECT/INSERT/DELETE) defined elsewhere.
-- (select auth.uid()) avoids per-row re-evaluation of the JWT helper (Supabase RLS guidance).
DROP POLICY IF EXISTS photo_update_own ON public.photo;

CREATE POLICY photo_update_own ON public.photo
	FOR UPDATE
	TO authenticated
	USING (user_id = (select auth.uid()))
	WITH CHECK (user_id = (select auth.uid()));
