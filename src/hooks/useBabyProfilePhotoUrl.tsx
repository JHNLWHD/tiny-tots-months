import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

/**
 * Resolves a private `baby_images` storage path to a short-lived signed URL.
 */
export function useBabyProfilePhotoUrl(
	storagePath: string | null | undefined,
): string | null {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!storagePath) {
			setUrl(null);
			return;
		}

		let cancelled = false;

		supabase.storage
			.from("baby_images")
			.createSignedUrl(storagePath, 3600)
			.then(({ data, error }) => {
				if (cancelled) return;
				if (error || !data?.signedUrl) {
					setUrl(null);
					return;
				}
				setUrl(data.signedUrl);
			});

		return () => {
			cancelled = true;
		};
	}, [storagePath]);

	return url;
}
