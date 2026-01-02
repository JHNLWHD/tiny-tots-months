import type React from "react";

type ShareableCardProps = {
	children: React.ReactNode;
	fileName?: string;
};

export const ShareableCard: React.FC<ShareableCardProps> = ({
	children,
}) => {
	return (
		<div className="w-full bg-white">
			{children}
		</div>
	);
};

