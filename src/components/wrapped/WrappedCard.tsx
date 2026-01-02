import { cn } from "@/lib/utils";
import type React from "react";

type WrappedCardProps = {
	children: React.ReactNode;
	className?: string;
};

export const WrappedCard: React.FC<WrappedCardProps> = ({
	children,
	className,
}) => {
	return (
		<div
			className={cn(
				"h-full w-full rounded-2xl bg-white p-8 md:p-12 shadow-xl border-2 border-baby-purple/20",
				className,
			)}
		>
			{children}
		</div>
	);
};

