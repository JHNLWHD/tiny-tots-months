import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { 
	Baby, 
	Crown, 
	Plus, 
	Users,
	MoreVertical,
	Trash2
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface NavigationHubProps {
	selectedBaby: any;
	babies: any[];
	onSelectBaby: (baby: any) => void;
	onAddBaby: () => void;
	onDeleteBaby?: (baby: any) => void;
}

const NavigationHub: React.FC<NavigationHubProps> = ({
	selectedBaby,
	babies,
	onSelectBaby,
	onAddBaby,
	onDeleteBaby,
}) => {
	const { user } = useAuth();
	const { isPremium } = useSubscription();


	return (
		<div className="w-full space-y-6">
			{/* Welcome Header */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
				<div>
					<h1 className="text-3xl lg:text-4xl font-heading text-gray-800 mb-2">
						Welcome back!
					</h1>
					<p className="text-lg text-gray-600">
						{selectedBaby 
							? `Tracking ${selectedBaby.name}'s milestones` 
							: "Ready to capture precious moments?"
						}
					</p>
				</div>
				
				{!isPremium && (
					<Link
						to="/app/upgrade"
						className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-baby-purple to-baby-blue text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
					>
						<Crown className="h-5 w-5" />
						Upgrade to Premium
					</Link>
				)}
			</div>

			{/* Navigation Cards Grid */}
			<div className="grid grid-cols-1 gap-6">
				{/* Baby Selector Card */}
				<Card className="p-6 border-2 border-baby-purple/20 hover:border-baby-purple/40 transition-colors">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-heading text-baby-purple flex items-center gap-2">
							<Users className="h-6 w-6" />
							Your Babies
						</h2>
						<Button
							onClick={onAddBaby}
							size="sm"
							className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full"
						>
							<Plus className="h-4 w-4 mr-1" />
							Add Baby
						</Button>
					</div>
					
					{babies.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{babies.slice(0, 4).map((baby) => (
									<div
										key={baby.id}
										onClick={() => onSelectBaby(baby)}
										className={`p-4 rounded-xl cursor-pointer transition-all duration-300 relative ${
											selectedBaby?.id === baby.id
												? "bg-baby-purple text-white shadow-lg transform scale-105"
												: "bg-gray-50 hover:bg-baby-purple/10 hover:shadow-md"
										}`}
									>
										<div className="flex items-center gap-3">
											<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
												selectedBaby?.id === baby.id
													? "bg-white/20"
													: "bg-baby-purple/20"
											}`}>
												<Baby className={`h-5 w-5 ${
													selectedBaby?.id === baby.id
														? "text-white"
														: "text-baby-purple"
												}`} />
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="font-medium truncate">{baby.name}</h3>
												<p className={`text-sm truncate ${
													selectedBaby?.id === baby.id
														? "text-white/80"
														: "text-gray-500"
												}`}>
													{new Date(baby.date_of_birth).toLocaleDateString()}
												</p>
											</div>
											{onDeleteBaby && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className={`h-8 w-8 p-0 ${
																selectedBaby?.id === baby.id
																	? "hover:bg-white/20 text-white"
																	: "hover:bg-gray-100"
															}`}
															onClick={(e) => e.stopPropagation()}
														>
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																onDeleteBaby(baby);
															}}
															className="text-red-600 hover:text-red-700 hover:bg-red-50"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete Baby
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</div>
									</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<Baby className="h-12 w-12 text-gray-300 mx-auto mb-3" />
							<p className="text-gray-500 mb-4">No babies added yet</p>
							<Button
								onClick={onAddBaby}
								className="bg-baby-purple hover:bg-baby-purple/90 text-white"
							>
								Add Your First Baby
							</Button>
						</div>
					)}
				</Card>
			</div>

				{/* Current Baby Context */}
			{selectedBaby && (
				<Card className="p-6 bg-gradient-to-r from-baby-purple/5 to-baby-blue/5 border border-baby-purple/20">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 bg-baby-purple/20 rounded-full flex items-center justify-center">
								<Baby className="h-8 w-8 text-baby-purple" />
							</div>
							<div>
								<h3 className="text-2xl font-heading text-baby-purple">
									{selectedBaby.name}'s Journey
								</h3>
								<p className="text-gray-600">
									Born {new Date(selectedBaby.date_of_birth).toLocaleDateString()}
								</p>
							</div>
						</div>
						<Link
							to={`/app/baby/${selectedBaby.id}/gallery`}
							className="px-6 py-3 bg-baby-purple text-white rounded-full hover:bg-baby-purple/90 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
						>
							View Gallery
						</Link>
					</div>
				</Card>
			)}
		</div>
	);
};

export default NavigationHub;
