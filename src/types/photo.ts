export type Photo = {
	id: string;
	baby_id: string;
	user_id: string;
	month_number: number;
	storage_path: string;
	description: string | null;
	is_video: boolean;
	is_favorite?: boolean;
	file_size?: number; // Size of the uploaded file in bytes (optional for backwards compatibility)
	created_at: string;
	updated_at: string;
	url?: string; // Signed URL for the image from storage (use transform params / HeicImage size for grid)
};

export type CreatePhotoData = {
	baby_id: string;
	month_number: number;
	description?: string;
	file: File;
	is_video?: boolean;
};
