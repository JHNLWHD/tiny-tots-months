import { useAuth } from "@/context/AuthContext";
import type { Photo } from "@/hooks/usePhotos";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useBabyPhotos = (babyId: string) => {
	const { data: photos, isLoading, error } = useQuery({
		queryKey: ['photos', babyId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('photo')
				.select('*')
				.eq('baby_id', babyId)
				.order('month_number', { ascending: true });

			if (error) {
				throw error;
			}

			return data || [];
		},
		enabled: !!babyId,
	});

	return {
		photos: photos || [],
		isLoading,
		error
	};
};
