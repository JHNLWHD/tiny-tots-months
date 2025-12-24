import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Baby, ChevronDown, Plus, MoreVertical, Trash2, Edit } from "lucide-react";
import React from "react";

interface BabySelectorProps {
	babies: any[];
	selectedBaby: any;
	onSelectBaby: (baby: any) => void;
	onAddBaby: () => void;
	onDeleteBaby?: (baby: any) => void;
	isLoading?: boolean;
}

const BabySelector: React.FC<BabySelectorProps> = ({
	babies,
	selectedBaby,
	onSelectBaby,
	onAddBaby,
	onDeleteBaby,
	isLoading = false,
}) => {
	const handleSelectChange = (babyId: string) => {
		const baby = babies.find((b) => b.id === babyId);
		if (baby) {
			onSelectBaby(baby);
		}
	};

	if (isLoading) {
		return (
			<Card className="p-6 border-2 border-baby-purple/20">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 border-2 border-baby-purple/20 hover:border-baby-purple/40 transition-colors">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-heading text-baby-purple flex items-center gap-2">
					<Baby className="h-6 w-6" />
					Select Baby
				</h2>
				<Button
					onClick={onAddBaby}
					size="sm"
					variant="outline"
					className="border-baby-purple text-baby-purple hover:bg-baby-purple/10"
				>
					<Plus className="h-4 w-4 mr-1" />
					Add Baby
				</Button>
			</div>

			{babies.length > 0 ? (
				<div className="space-y-4">
					{/* Dropdown Selector */}
					<Select
						value={selectedBaby?.id || ""}
						onValueChange={handleSelectChange}
					>
						<SelectTrigger className="w-full h-14 border-2 border-gray-200 hover:border-baby-purple/50 focus:border-baby-purple transition-colors">
							<div className="flex items-center gap-3">
								{selectedBaby ? (
									<>
										<div className="w-10 h-10 bg-baby-purple/20 rounded-full flex items-center justify-center">
											<Baby className="h-5 w-5 text-baby-purple" />
										</div>
										<div className="text-left">
											<div className="font-medium text-gray-800">
												{selectedBaby.name}
											</div>
											<div className="text-sm text-gray-500">
												Born {new Date(selectedBaby.date_of_birth).toLocaleDateString()}
											</div>
										</div>
									</>
								) : (
									<SelectValue placeholder="Choose a baby to track..." />
								)}
							</div>
						</SelectTrigger>
						<SelectContent>
							{babies.map((baby) => (
								<SelectItem key={baby.id} value={baby.id}>
									<div className="flex items-center gap-3 py-2">
										<div className="w-8 h-8 bg-baby-purple/20 rounded-full flex items-center justify-center">
											<Baby className="h-4 w-4 text-baby-purple" />
										</div>
										<div>
											<div className="font-medium">{baby.name}</div>
											<div className="text-sm text-gray-500">
												{baby.gender && (
													<span className="capitalize">{baby.gender} • </span>
												)}
												{new Date(baby.date_of_birth).toLocaleDateString()}
											</div>
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Quick Switch Tabs (for mobile/quick access) */}
					{babies.length <= 4 && (
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
							{babies.map((baby) => (
								<div
									key={baby.id}
									className={`relative p-3 rounded-lg text-center transition-all duration-300 cursor-pointer ${
										selectedBaby?.id === baby.id
											? "bg-baby-purple text-white shadow-lg transform scale-105"
											: "bg-gray-50 hover:bg-baby-purple/10 hover:shadow-md"
									}`}
									onClick={() => onSelectBaby(baby)}
								>
									{onDeleteBaby && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className={`absolute top-1 right-1 h-6 w-6 p-0 ${
														selectedBaby?.id === baby.id
															? "hover:bg-white/20 text-white"
															: "hover:bg-gray-100"
													}`}
													onClick={(e) => e.stopPropagation()}
												>
													<MoreVertical className="h-3 w-3" />
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
									<div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
										selectedBaby?.id === baby.id
											? "bg-white/20"
											: "bg-baby-purple/20"
									}`}>
										<Baby className={`h-4 w-4 ${
											selectedBaby?.id === baby.id
												? "text-white"
												: "text-baby-purple"
										}`} />
									</div>
									<div className="text-sm font-medium truncate">
										{baby.name}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Selected Baby Info */}
					{selectedBaby && (
						<div className="mt-4 p-4 bg-gradient-to-r from-baby-purple/5 to-baby-blue/5 rounded-lg border border-baby-purple/20">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-baby-purple/20 rounded-full flex items-center justify-center">
									<Baby className="h-6 w-6 text-baby-purple" />
								</div>
								<div className="flex-1">
									<h3 className="font-heading text-lg text-baby-purple">
										{selectedBaby.name}
									</h3>
									<div className="text-sm text-gray-600 space-y-1">
										<p>Born: {new Date(selectedBaby.date_of_birth).toLocaleDateString()}</p>
										{selectedBaby.gender && (
											<p className="capitalize">Gender: {selectedBaby.gender}</p>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="text-center py-8">
					<div className="w-16 h-16 bg-baby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<Baby className="h-8 w-8 text-baby-purple" />
					</div>
					<h3 className="font-heading text-lg text-gray-700 mb-2">
						No babies added yet
					</h3>
					<p className="text-gray-500 mb-4">
						Add your first baby to start tracking milestones!
					</p>
					<Button
						onClick={onAddBaby}
						className="bg-baby-purple hover:bg-baby-purple/90 text-white"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Your First Baby
					</Button>
				</div>
			)}
		</Card>
	);
};

export default BabySelector;
