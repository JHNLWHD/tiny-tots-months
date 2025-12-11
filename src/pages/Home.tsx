import { useAuth } from "@/context/AuthContext";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { useSubscription } from "@/hooks/useSubscription";
import React, { useEffect } from "react";

import AddBabyDialog from "@/components/home/AddBabyDialog";
import NavigationHub from "@/components/home/NavigationHub";
import NavigationBreadcrumbs from "@/components/home/NavigationBreadcrumbs";
import ProgressIndicator from "@/components/home/ProgressIndicator";
import EmptyState from "@/components/home/EmptyState";
import MonthCardGrid from "@/components/home/MonthCardGrid";
import { toast } from "sonner";

const Home = () => {
	const { user } = useAuth();
	const {
		babies,
		loading: isLoading,
		createBaby: createBabyMutation,
		deleteBaby: deleteBabyMutation,
	} = useBabyProfiles();
	const { isPremium, isFree, createSubscription, subscription } =
		useSubscription();
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [selectedBaby, setSelectedBaby] = React.useState(null);

	// Wrap the mutation function to return a Promise
	const createBaby = async (data: {
		name: string;
		dateOfBirth: string;
		gender: string;
	}) => {
		return new Promise<void>((resolve, reject) => {
			try {
				createBabyMutation(data, {
					onSuccess: () => resolve(),
					onError: (error) => reject(error),
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	const handleDeleteBaby = (baby: any) => {
		if (window.confirm(`Are you sure you want to delete ${baby.name}'s profile? This action cannot be undone.`)) {
			deleteBabyMutation(baby.id, {
				onSuccess: () => {
					// If we're deleting the selected baby, auto-select another baby
					if (selectedBaby?.id === baby.id) {
						// Find the next baby to select (excluding the one being deleted)
						const remainingBabies = babies.filter(b => b.id !== baby.id);
						if (remainingBabies.length > 0) {
							// Select the first remaining baby (most recently created)
							setSelectedBaby(remainingBabies[0]);
						} else {
							// No babies left, clear selection
							setSelectedBaby(null);
						}
					}
					toast.success(`${baby.name}'s profile has been deleted.`);
				},
				onError: (error) => {
					toast.error(`Failed to delete ${baby.name}'s profile: ${error.message}`);
				},
			});
		}
	};

	function handleOnAddBaby() {
		if (isFree && !isPremium && babies.length >= 1) {
			toast("Premium Required", {
				description:
					"Free users can only add 1 baby profile. Upgrade to Premium to create unlimited baby profiles.",
				className: "bg-destructive text-destructive-foreground",
			});
			return;
		}

		setIsDialogOpen(true);
	}

	useEffect(() => {
		if (subscription) {
			return;
		}

		createSubscription("PHP");
	}, [subscription, createSubscription]);

	// Set first baby as selected when babies load if none is selected
	useEffect(() => {
		if (babies.length > 0 && !selectedBaby) {
			setSelectedBaby(babies[0]);
		}
	}, [babies, selectedBaby]);

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
			{/* Navigation Breadcrumbs */}
			<NavigationBreadcrumbs
				items={[]}
				selectedBaby={selectedBaby}
			/>

			{/* Main Navigation Hub */}
			<NavigationHub
				selectedBaby={selectedBaby}
				babies={babies}
				onSelectBaby={setSelectedBaby}
				onAddBaby={handleOnAddBaby}
				onDeleteBaby={handleDeleteBaby}
			/>

			{/* Progress Indicator */}
			{selectedBaby && (
				<ProgressIndicator
					selectedBaby={selectedBaby}
					showDetailed={false}
				/>
			)}

			{/* Main Content */}
			<div className="space-y-8">
				{/* Month Timeline */}
				{selectedBaby && (
					<MonthCardGrid
						babyId={selectedBaby?.id}
						babyName={selectedBaby?.name}
						showGrid={selectedBaby !== null && !isLoading}
					/>
				)}

				{/* Empty State */}
				{babies.length === 0 && !isLoading && (
					<EmptyState onAddBaby={() => setIsDialogOpen(true)} />
				)}
			</div>

			{/* Detailed Progress (Mobile) */}
			{selectedBaby && (
				<div className="xl:hidden">
					<ProgressIndicator
						selectedBaby={selectedBaby}
						showDetailed={true}
					/>
				</div>
			)}

			{/* Add Baby Dialog */}
			<AddBabyDialog
				isOpen={isDialogOpen}
				setIsOpen={setIsDialogOpen}
				createBaby={createBaby}
			/>
		</div>
	);
};

export default Home;
