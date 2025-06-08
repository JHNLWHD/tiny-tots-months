import { useAuth } from "@/context/AuthContext";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { useSubscription } from "@/hooks/useSubscription";
import { Crown } from "lucide-react";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import AddBabyDialog from "@/components/home/AddBabyDialog";
// Component imports
import BabyList from "@/components/home/BabyList";
import EmptyState from "@/components/home/EmptyState";
import MonthCardGrid from "@/components/home/MonthCardGrid";
import { toast } from "@/components/ui/sonner.tsx";

const Home = () => {
	const { user } = useAuth();
	const {
		babies,
		loading: isLoading,
		createBaby: createBabyMutation,
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

	function handleOnAddBaby() {
		if (isFree && !isPremium) {
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

		createSubscription();
	}, [subscription, createSubscription]);

	// Set first baby as selected when babies load if none is selected
	useEffect(() => {
		if (babies.length > 0 && !selectedBaby) {
			setSelectedBaby(babies[0]);
		}
	}, [babies, selectedBaby]);

	return (
		<div className="max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-0">
					Welcome,{" "}
					<span className="text-baby-purple truncate block sm:inline">
						{user?.email}
					</span>
				</h1>

				{!isPremium && (
					<Link
						to="/app/upgrade"
						className="text-sm md:text-base px-4 md:px-6 py-1.5 md:py-2 bg-baby-purple text-white rounded-lg shadow hover:bg-baby-purple/90 transition-colors flex items-center whitespace-nowrap"
					>
						<Crown className="mr-1.5 md:mr-2 h-4 md:h-5 w-4 md:w-5" />
						Get Premium
					</Link>
				)}
			</div>

			<BabyList
				babies={babies}
				isLoading={isLoading}
				onAddBaby={handleOnAddBaby}
				onSelectBaby={setSelectedBaby}
				selectedBaby={selectedBaby}
			/>

			<MonthCardGrid
				babyId={selectedBaby?.id}
				babyName={selectedBaby?.name}
				showGrid={selectedBaby !== null && !isLoading}
			/>

			<AddBabyDialog
				isOpen={isDialogOpen}
				setIsOpen={setIsDialogOpen}
				createBaby={createBaby}
			/>

			{babies.length === 0 && !isLoading && (
				<EmptyState onAddBaby={() => setIsDialogOpen(true)} />
			)}
		</div>
	);
};

export default Home;
