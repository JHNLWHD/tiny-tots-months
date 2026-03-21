import { Baby } from "lucide-react";
import React from "react";
import { useBabyProfilePhotoUrl } from "@/hooks/useBabyProfilePhotoUrl";
import { cn } from "@/lib/utils";

type BabyProfileAvatarProps = {
	photoUrl: string | null | undefined;
	className?: string;
	iconClassName?: string;
	alt?: string;
};

const BabyProfileAvatar: React.FC<BabyProfileAvatarProps> = ({
	photoUrl,
	className,
	iconClassName,
	alt = "",
}) => {
	const signed = useBabyProfilePhotoUrl(photoUrl ?? null);

	if (signed) {
		return (
			<img
				src={signed}
				alt={alt}
				className={cn("object-cover rounded-full", className)}
			/>
		);
	}

	return (
		<div
			className={cn(
				"rounded-full flex items-center justify-center bg-baby-purple/20",
				className,
			)}
		>
			<Baby className={cn("text-baby-purple", iconClassName)} />
		</div>
	);
};

export default BabyProfileAvatar;
