import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSubscription } from "@/hooks/useSubscription";
import type { Baby } from "@/hooks/useBabyProfiles";
import BabyProfileAvatar from "@/components/home/BabyProfileAvatar";
import {
	Baby as BabyIcon,
	Crown,
	Plus,
	Users,
	MoreVertical,
	Trash2,
	Edit,
	Undo2,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

type NavigationHubProps = {
	selectedBaby: Baby | null;
	babies: Baby[];
	deletedBabies: Baby[];
	onSelectBaby: (baby: Baby) => void;
	onAddBaby: () => void;
	onDeleteBaby?: (baby: Baby) => void;
	onRestoreBaby?: (baby: Baby) => void;
	onEditBaby?: (baby: Baby) => void;
};

const NavigationHub: React.FC<NavigationHubProps> = ({
	selectedBaby,
	babies,
	deletedBabies,
	onSelectBaby,
	onAddBaby,
	onDeleteBaby,
	onRestoreBaby,
	onEditBaby,
}) => {
	const { isPremium } = useSubscription();

	return (
		<div className="w-full space-y-6">
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
				<div>
					<h1 className="text-3xl lg:text-4xl font-heading text-gray-800 mb-2">
						Welcome back!
					</h1>
					<p className="text-lg text-gray-600">
						{selectedBaby
							? `Tracking ${selectedBaby.name}'s milestones`
							: "Ready to capture precious moments?"}
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

			<div className="grid grid-cols-1 gap-6">
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
										<BabyProfileAvatar
											photoUrl={baby.photo_url}
											className={`w-10 h-10 flex-shrink-0 ${
												selectedBaby?.id === baby.id
													? "ring-2 ring-white/80"
													: ""
											}`}
											iconClassName="h-5 w-5"
											alt=""
										/>
										<div className="flex-1 min-w-0">
											<h3 className="font-medium truncate">{baby.name}</h3>
											<p
												className={`text-sm truncate ${
													selectedBaby?.id === baby.id
														? "text-white/80"
														: "text-gray-500"
												}`}
											>
												{new Date(baby.date_of_birth).toLocaleDateString()}
											</p>
										</div>
										{(onDeleteBaby || onEditBaby) && (
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
													{onEditBaby && (
														<DropdownMenuItem
															onSelect={() => onEditBaby(baby)}
														>
															<Edit className="h-4 w-4 mr-2" />
															Edit profile
														</DropdownMenuItem>
													)}
													{onDeleteBaby && (
														<DropdownMenuItem
															onSelect={() => onDeleteBaby(baby)}
															className="text-red-600 hover:text-red-700 hover:bg-red-50"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Remove profile
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<BabyIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
							<p className="text-gray-500 mb-4">No babies added yet</p>
							<Button
								onClick={onAddBaby}
								className="bg-baby-purple hover:bg-baby-purple/90 text-white"
							>
								Add Your First Baby
							</Button>
						</div>
					)}

					{deletedBabies.length > 0 && onRestoreBaby && (
						<div className="mt-6 pt-6 border-t border-gray-200">
							<h3 className="text-sm font-medium text-gray-700 mb-3">
								Recently removed
							</h3>
							<ul className="space-y-2">
								{deletedBabies.map((baby) => (
									<li
										key={baby.id}
										className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-gray-200 px-3 py-2 text-sm"
									>
										<span className="truncate text-gray-600">{baby.name}</span>
										<Button
											type="button"
											size="sm"
											variant="outline"
											className="flex-shrink-0"
											onClick={() => onRestoreBaby(baby)}
										>
											<Undo2 className="h-3.5 w-3.5 mr-1" />
											Restore
										</Button>
									</li>
								))}
							</ul>
						</div>
					)}
				</Card>
			</div>

			{selectedBaby && (
				<Card className="p-6 bg-gradient-to-r from-baby-purple/5 to-baby-blue/5 border border-baby-purple/20">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div className="flex items-center gap-4">
							<BabyProfileAvatar
								photoUrl={selectedBaby.photo_url}
								className="w-16 h-16 flex-shrink-0"
								iconClassName="h-8 w-8"
								alt=""
							/>
							<div>
								<h3 className="text-2xl font-heading text-baby-purple">
									{selectedBaby.name}&apos;s Journey
								</h3>
								<p className="text-gray-600">
									Born {new Date(selectedBaby.date_of_birth).toLocaleDateString()}
								</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<Link
								to={`/app/baby/${selectedBaby.id}/gallery`}
								className="px-6 py-3 bg-baby-purple text-white rounded-full hover:bg-baby-purple/90 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 text-center"
							>
								View Gallery
							</Link>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
};

export default NavigationHub;
