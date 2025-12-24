import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
// Import the analytics tracking function
import { trackEvent, trackDatabaseError } from "@/lib/analytics";
import { useEffect, useState } from "react";

export type Baby = {
	id: string;
	created_at: string;
	name: string;
	date_of_birth: string;
	gender: string | null; // Making gender optional by adding null
	user_id: string | undefined;
};

type CreateBabyData = {
	name: string;
	dateOfBirth: string;
	gender: string;
};

export function useBabyProfiles() {
	const { user } = useAuth();
	const [babies, setBabies] = useState<Baby[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBabies = async () => {
			setLoading(true);
			try {
				if (user) {
					const { data, error } = await supabase
						.from("baby")
						.select("*")
						.eq("user_id", user.id)
						.order("created_at", { ascending: false });

					if (error) {
						console.error("Error fetching babies:", error);
						trackDatabaseError(error, "select", "baby", user.id);
						setError(error.message);
					} else {
						// Map the database data to match our Baby type
						const mappedData: Baby[] = (data || []).map((item) => ({
							...item,
							gender: item.gender || null, // Handle missing gender field
						}));
						setBabies(mappedData);
					}
				}
			} catch (err) {
				console.error("Unexpected error fetching babies:", err);
				const dbError = err instanceof Error ? err : new Error("Unknown fetch error");
				trackDatabaseError(dbError, "select", "baby", user?.id);
				setError(dbError.message);
			} finally {
				setLoading(false);
			}
		};

		fetchBabies();
	}, [user]);

	const refetch = () => {
		if (user) {
			supabase
				.from("baby")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })
				.then(({ data, error }) => {
					if (error) {
						console.error("Error refetching babies:", error);
						trackDatabaseError(error, "select", "baby", user.id);
						setError(error.message);
					} else {
						// Map the database data to match our Baby type
						const mappedData: Baby[] = (data || []).map((item) => ({
							...item,
							gender: item.gender || null, // Handle missing gender field
						}));
						setBabies(mappedData);
					}
					setLoading(false);
				});
		}
	};

	const createBaby = (
		data: CreateBabyData,
		options?: { onSuccess?: () => void; onError?: (err: Error) => void },
	) => {
		setCreating(true);

		const newBaby = {
			name: data.name,
			date_of_birth: data.dateOfBirth, // Use date_of_birth instead of dateOfBirth
			gender: data.gender,
			user_id: user?.id,
		};

		supabase
			.from("baby")
			.insert([newBaby])
			.select()
			.then(({ data: newBabyData, error }) => {
				if (error) {
					console.error("Error creating baby:", error);
					setError(error.message);

					trackEvent("baby_creation_failed", {
						error_message: error.message,
					});
					trackDatabaseError(error, "insert", "baby", user?.id);

					options?.onError?.(new Error(error.message));
				} else {
					trackEvent("baby_created", {
						baby_name: data.name,
						baby_gender: data.gender,
					});

					refetch();
					options?.onSuccess?.();
				}

				setCreating(false); // Move this inside then() instead of using finally()
			});
	};

	const deleteBaby = (
		babyId: string,
		options?: { onSuccess?: () => void; onError?: (err: Error) => void },
	) => {
		setDeleting(true);

		supabase
			.from("baby")
			.delete()
			.eq("id", babyId)
			.eq("user_id", user?.id) // Ensure user can only delete their own babies
			.then(({ error }) => {
				if (error) {
					console.error("Error deleting baby:", error);
					setError(error.message);

					trackEvent("baby_deletion_failed", {
						error_message: error.message,
						baby_id: babyId,
					});
					trackDatabaseError(error, "delete", "baby", user?.id);

					options?.onError?.(new Error(error.message));
				} else {
					trackEvent("baby_deleted", {
						baby_id: babyId,
					});

					refetch();
					options?.onSuccess?.();
				}

				setDeleting(false);
			});
	};

	return {
		babies,
		loading,
		error,
		creating,
		deleting,
		createBaby,
		deleteBaby,
	};
}
