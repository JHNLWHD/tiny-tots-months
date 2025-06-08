import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Baby } from "@/hooks/useBabyProfiles";
import { Home } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

interface MonthHeaderProps {
	monthNumber: number;
	selectedBaby: Baby | undefined;
}

const MonthHeader: React.FC<MonthHeaderProps> = ({
	monthNumber,
	selectedBaby,
}) => {
	return (
		<div className="space-y-3 mb-6">
			<Breadcrumb className="animate-fade-in">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link
								to="/app"
								className="flex items-center text-gray-500 hover:text-baby-purple transition-colors"
							>
								<Home className="h-3.5 w-3.5 mr-1" />
								<span>Home</span>
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					{selectedBaby && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link
										to={"/app"}
										className="text-gray-500 hover:text-baby-purple transition-colors"
									>
										{selectedBaby.name}
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)}
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink className="text-baby-purple font-medium">
							Month {monthNumber}
						</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
				<h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-baby-purple to-baby-blue animate-fade-in w-full">
					{selectedBaby ? `${selectedBaby.name}'s` : ""} Month {monthNumber}{" "}
					Milestones
				</h1>
			</div>
		</div>
	);
};

export default MonthHeader;
