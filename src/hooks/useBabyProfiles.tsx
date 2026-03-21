import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, trackDatabaseError } from "@/lib/analytics";
import { FILE_SIZE_LIMITS } from "@/components/photoUploader/validateFile";
import { compressImage } from "@/utils/imageCompressor";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type Baby = {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	date_of_birth: string;
	gender: string | null;
	user_id: string | undefined;
	deleted_at: string | null;
	photo_url: string | null;
};

type CreateBabyData = {
	name: string;
	dateOfBirth: string;
	gender: string;
};

export type UpdateBabyPayload = {
	name: string;
	dateOfBirth: string;
	gender: string;
	photoFile?: File | null;
	/** Current storage path; used to remove old object after a new upload */
	previousPhotoUrl?: string | null;
};

function mapBabyRow(item: {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	date_of_birth: string;
	gender: string | null;
	user_id: string;
	deleted_at?: string | null;
	photo_url?: string | null;
}): Baby {
	return {
		id: item.id,
		created_at: item.created_at,
		updated_at: item.updated_at,
		name: item.name,
		date_of_birth: item.date_of_birth,
		gender: item.gender ?? null,
		user_id: item.user_id,
		deleted_at: item.deleted_at ?? null,
		photo_url: item.photo_url ?? null,
	};
}

function splitBabies(rows: Baby[]): { active: Baby[]; deleted: Baby[] } {
	const active: Baby[] = [];
	const deleted: Baby[] = [];
	for (const b of rows) {
		if (b.deleted_at) deleted.push(b);
		else active.push(b);
	}
	return { active, deleted };
}

async function uploadBabyProfileImage(
	userId: string,
	babyId: string,
	file: File,
	previousPath: string | null | undefined,
): Promise<string> {
	if (file.size > FILE_SIZE_LIMITS.IMAGE_MAX_SIZE) {
		throw new Error("Image is too large");
	}

	const compressed = await compressImage(file);
	const ext = compressed.name.split(".").pop() || "jpg";
	const path = `${userId}/${babyId}/profile-${uuidv4()}.${ext}`;

	const { error: uploadError } = await supabase.storage
		.from("baby_images")
		.upload(path, compressed, {
			contentType: compressed.type || "image/jpeg",
		});

	if (uploadError) throw new Error(uploadError.message);

	if (
		previousPath &&
		previousPath.length > 0 &&
		previousPath.startsWith(`${userId}/`)
	) {
		await supabase.storage.from("baby_images").remove([previousPath]);
	}

	return path;
}

export function useBabyProfiles() {
	const { user } = useAuth();
	const [babies, setBabies] = useState<Baby[]>([]);
	const [deletedBabies, setDeletedBabies] = useState<Baby[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [restoring, setRestoring] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const applyRows = useCallback((rows: unknown[] | null) => {
		const mapped = (rows || []).map((item) =>
			mapBabyRow(item as Parameters<typeof mapBabyRow>[0]),
		);
		const { active, deleted } = splitBabies(mapped);
		setBabies(active);
		setDeletedBabies(deleted);
	}, []);

	useEffect(() => {
		const fetchBabies = async () => {
			setLoading(true);
			try {
				if (user) {
					const { data, error: fetchError } = await supabase
						.from("baby")
						.select("*")
						.eq("user_id", user.id)
						.order("created_at", { ascending: false });

					if (fetchError) {
						console.error("Error fetching babies:", fetchError);
						trackDatabaseError(fetchError, "select", "baby", user.id);
						setError(fetchError.message);
					} else {
						applyRows(data);
					}
				} else {
					setBabies([]);
					setDeletedBabies([]);
				}
			} catch (err) {
				console.error("Unexpected error fetching babies:", err);
				const dbError =
					err instanceof Error ? err : new Error("Unknown fetch error");
				trackDatabaseError(dbError, "select", "baby", user?.id);
				setError(dbError.message);
			} finally {
				setLoading(false);
			}
		};

		fetchBabies();
	}, [user, applyRows]);

	const refetch = useCallback(() => {
		if (!user) return;

		supabase
			.from("baby")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.then(({ data, error: refetchError }) => {
				if (refetchError) {
					console.error("Error refetching babies:", refetchError);
					trackDatabaseError(refetchError, "select", "baby", user.id);
					setError(refetchError.message);
				} else {
					applyRows(data);
				}
				setLoading(false);
			});
	}, [user, applyRows]);

	const createBaby = (
		data: CreateBabyData,
		options?: { onSuccess?: () => void; onError?: (err: Error) => void },
	) => {
		setCreating(true);

		const newBaby = {
			name: data.name,
			date_of_birth: data.dateOfBirth,
			gender: data.gender,
			user_id: user?.id,
		};

		supabase
			.from("baby")
			.insert([newBaby])
			.select()
			.then(({ error: insertError }) => {
				if (insertError) {
					console.error("Error creating baby:", insertError);
					setError(insertError.message);

					trackEvent("baby_creation_failed", {
						error_message: insertError.message,
					});
					trackDatabaseError(insertError, "insert", "baby", user?.id);

					options?.onError?.(new Error(insertError.message));
				} else {
					trackEvent("baby_created", {
						baby_name: data.name,
						baby_gender: data.gender,
					});

					refetch();
					options?.onSuccess?.();
				}

				setCreating(false);
			});
	};

	const updateBaby = (
		babyId: string,
		payload: UpdateBabyPayload,
		options?: { onSuccess?: () => void; onError?: (err: Error) => void },
	) => {
		if (!user?.id) {
			options?.onError?.(new Error("User not authenticated"));
			return;
		}

		(async () => {
			try {
				let photoPath: string | undefined;
				if (payload.photoFile) {
					photoPath = await uploadBabyProfileImage(
						user.id,
						babyId,
						payload.photoFile,
						payload.previousPhotoUrl,
					);
				}

				const updates: Record<string, string> = {
					name: payload.name,
					date_of_birth: payload.dateOfBirth,
					gender: payload.gender,
				};
				if (photoPath) updates.photo_url = photoPath;

				const { error: updateError } = await supabase
					.from("baby")
					.update(updates)
					.eq("id", babyId)
					.eq("user_id", user.id);

				if (updateError) {
					console.error("Error updating baby:", updateError);
					setError(updateError.message);
					trackEvent("baby_update_failed", {
						error_message: updateError.message,
						baby_id: babyId,
					});
					trackDatabaseError(updateError, "update", "baby", user.id);
					options?.onError?.(new Error(updateError.message));
				} else {
					trackEvent("baby_updated", { baby_id: babyId });
					refetch();
					options?.onSuccess?.();
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Update failed";
				trackEvent("baby_update_failed", {
					error_message: msg,
					baby_id: babyId,
				});
				options?.onError?.(new Error(msg));
			}
		})();
	};

	const deleteBaby = (
		babyId: string,
		options?: { onSuccess?: () => void; onError?: (err: Error) => void },
	) => {
		if (!user?.id) {
			options?.onError?.(new Error("User not authenticated"));
			return;
		}

		setDeleting(true);

		supabase
			.from("baby")
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", babyId)
			.eq("user_id", user.id)
			.then(({ error: softDeleteError }) => {
				if (softDeleteError) {
					console.error("Error soft-deleting baby:", softDeleteError);
					setError(softDeleteError.message);

					trackEvent("baby_deletion_failed", {
						error_message: softDeleteError.message,
						baby_id: babyId,
					});
					trackDatabaseError(softDeleteError, "update", "baby", user?.id);

					options?.onError?.(new Error(softDeleteError.message));
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

	const restoreBaby = (
		babyId: string,
		options?: { onSuccess?: () => void; onError?: (err: Error) => void },
	) => {
		if (!user?.id) {
			options?.onError?.(new Error("User not authenticated"));
			return;
		}

		setRestoring(true);

		supabase
			.from("baby")
			.update({ deleted_at: null })
			.eq("id", babyId)
			.eq("user_id", user.id)
			.then(({ error: restoreError }) => {
				if (restoreError) {
					console.error("Error restoring baby:", restoreError);
					setError(restoreError.message);
					trackEvent("baby_restore_failed", {
						error_message: restoreError.message,
						baby_id: babyId,
					});
					trackDatabaseError(restoreError, "update", "baby", user?.id);
					options?.onError?.(new Error(restoreError.message));
				} else {
					trackEvent("baby_restored", { baby_id: babyId });
					refetch();
					options?.onSuccess?.();
				}

				setRestoring(false);
			});
	};

	return {
		babies,
		deletedBabies,
		loading,
		error,
		creating,
		deleting,
		restoring,
		createBaby,
		updateBaby,
		deleteBaby,
		restoreBaby,
	};
}
