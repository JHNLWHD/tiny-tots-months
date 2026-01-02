import { Badge } from "@/components/ui/badge";
import { isBetaMode } from "@/config/app";
import { cn } from "@/lib/utils";

type BetaBadgeProps = {
	/**
	 * Size variant for the badge
	 * @default "sm"
	 */
	size?: "sm" | "md" | "lg";
	/**
	 * Additional className to apply
	 */
	className?: string;
};

export const BetaBadge = ({ size = "sm", className }: BetaBadgeProps) => {
	if (!isBetaMode) {
		return null;
	}

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5",
		md: "text-sm px-3 py-1",
		lg: "text-sm px-4 py-1.5",
	};

	return (
		<Badge
			variant="outline"
			className={cn(
				"bg-amber-100 border-amber-300 text-amber-800 font-semibold",
				sizeClasses[size],
				className
			)}
		>
			BETA
		</Badge>
	);
};

