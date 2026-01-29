export type Photo = {
	id: string;
	baby_id: string;
	user_id: string;
	month_number: number;
	storage_path: string;
	description: string | null;
	is_video: boolean;
	file_size?: number; // Size of the uploaded file in bytes (optional for backwards compatibility)
	created_at: string;
	updated_at: string;
	url?: string; // URL for the actual image from storage
};

export type CreatePhotoData = {
	baby_id: string;
	month_number: number;
	description?: string;
	file: File;
	is_video?: boolean;
};
