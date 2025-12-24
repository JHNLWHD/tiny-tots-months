import { ChevronRight, Home, Baby, Calendar } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
	label: string;
	href?: string;
	icon?: React.ComponentType<{ className?: string }>;
	current?: boolean;
};

type NavigationBreadcrumbsProps = {
	items: BreadcrumbItem[];
	selectedBaby?: any;
	currentMonth?: number;
};

const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({
	items,
	selectedBaby,
	currentMonth,
}) => {
	// Generate breadcrumbs based on current context
	const generateBreadcrumbs = (): BreadcrumbItem[] => {
		const breadcrumbs: BreadcrumbItem[] = [
			{
				label: "App",
				href: "/app",
				icon: Home,
			},
		];

		if (selectedBaby) {
			breadcrumbs.push({
				label: selectedBaby.name,
				href: `/app`,
				icon: Baby,
			});
		}

		if (currentMonth && selectedBaby) {
			breadcrumbs.push({
				label: `Month ${currentMonth}`,
				href: `/app/month/${selectedBaby.id}/${currentMonth}`,
				icon: Calendar,
				current: true,
			});
		}

		// Use provided items if available, otherwise use generated ones
		return items.length > 0 ? items : breadcrumbs;
	};

	const breadcrumbs = generateBreadcrumbs();

	if (breadcrumbs.length <= 1) {
		return null;
	}

	return (
		<nav aria-label="Breadcrumb" className="mb-6">
			<div className="flex items-center space-x-2 text-sm">
				{breadcrumbs.map((item, index) => {
					const isLast = index === breadcrumbs.length - 1;
					const IconComponent = item.icon;

					return (
						<React.Fragment key={index}>
							{index > 0 && (
								<ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
							)}
							
							{item.href && !isLast ? (
								<Link
									to={item.href}
									className="flex items-center gap-1.5 text-gray-600 hover:text-baby-purple transition-colors font-medium"
								>
									{IconComponent && (
										<IconComponent className="h-4 w-4" />
									)}
									{item.label}
								</Link>
							) : (
								<span
									className={`flex items-center gap-1.5 font-medium ${
										isLast || item.current
											? "text-baby-purple"
											: "text-gray-600"
									}`}
								>
									{IconComponent && (
										<IconComponent className="h-4 w-4" />
									)}
									{item.label}
								</span>
							)}
						</React.Fragment>
					);
				})}
			</div>

			{/* Context Information */}
			{selectedBaby && (
				<div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
					<span>
						Born: {new Date(selectedBaby.date_of_birth).toLocaleDateString()}
					</span>
					{selectedBaby.gender && (
						<span className="capitalize">
							{selectedBaby.gender}
						</span>
					)}
					{currentMonth && (
						<span>
							Viewing Month {currentMonth}
						</span>
					)}
				</div>
			)}
		</nav>
	);
};

export default NavigationBreadcrumbs;
