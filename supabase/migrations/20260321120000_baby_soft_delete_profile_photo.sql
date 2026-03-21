-- Soft delete + profile photo path (private bucket; app uses signed URLs)
ALTER TABLE public.baby
	ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
	ADD COLUMN IF NOT EXISTS photo_url text;

COMMENT ON COLUMN public.baby.deleted_at IS 'When set, profile is hidden from main UI; can be restored.';
COMMENT ON COLUMN public.baby.photo_url IS 'Storage object path in baby_images bucket (e.g. userId/babyId/profile-....jpg).';

-- Prefer soft delete via UPDATE; prevent hard DELETE from clients
DROP POLICY IF EXISTS baby_delete_own ON public.baby;
