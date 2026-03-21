import { useBabyProfiles, type Baby } from "@/hooks/useBabyProfiles";
import { useSubscription } from "@/hooks/useSubscription";
import { useAbilities } from "@/hooks/useAbilities";
import { useEffect, useState } from "react";

import AddBabyDialog from "@/components/home/AddBabyDialog";
import EditBabyDialog from "@/components/home/EditBabyDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NavigationHub from "@/components/home/NavigationHub";
import NavigationBreadcrumbs from "@/components/home/NavigationBreadcrumbs";
import ProgressIndicator from "@/components/home/ProgressIndicator";
import EmptyState from "@/components/home/EmptyState";
import MonthCardGrid from "@/components/home/MonthCardGrid";
import {
	HOME_BABY_MODAL_CLOSED,
	HomeBabyModalKind,
	type HomeBabyModal,
} from "@/components/home/HomeBabyModal.types";
import { toast } from "sonner";

const SELECTED_BABY_STORAGE_KEY = "tiny-tots-selected-baby-id";

/** Opening Edit from the card `DropdownMenu` before this delay caused instant dialog dismiss (non-modal Dialog + menu teardown). Shorter delays (e.g. 100ms) were unreliable. */
const EDIT_BABY_MENU_OPEN_DELAY_MS = 500;

function Home() {
	const {
		babies,
		deletedBabies,
		loading: isLoading,
		createBaby: createBabyMutation,
		deleteBaby: deleteBabyMutation,
		restoreBaby: restoreBabyMutation,
		updateBaby: updateBabyMutation,
	} = useBabyProfiles();
	const { createSubscription, subscription } = useSubscription();
	const abilities = useAbilities({ babyCount: babies.length });
	const [babyModal, setBabyModal] = useState<HomeBabyModal>(
		HOME_BABY_MODAL_CLOSED,
	);
	const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);

	const babyModalOpen = babyModal.kind !== HomeBabyModalKind.None;

	function openBabyModal(next: HomeBabyModal) {
		setBabyModal(next);
	}

	function closeBabyModal() {
		setBabyModal(HOME_BABY_MODAL_CLOSED);
	}

	/* Non-modal Dialog has no Radix RemoveScroll on the overlay; lock page scroll locally. */
	useEffect(() => {
		if (!babyModalOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [babyModalOpen]);

	function selectBaby(baby: Baby | null) {
		setSelectedBaby(baby);
		if (baby) {
			localStorage.setItem(SELECTED_BABY_STORAGE_KEY, baby.id);
		} else {
			localStorage.removeItem(SELECTED_BABY_STORAGE_KEY);
		}
	}

	// Wrap the mutation function to return a Promise
	async function createBaby(data: {
		name: string;
		dateOfBirth: string;
		gender: string;
	}) {
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
	}

	function handleDeleteBaby(baby: Baby) {
		if (
			window.confirm(
				`Remove ${baby.name}'s profile from your list? You can restore them from "Recently removed" below.`,
			)
		) {
			deleteBabyMutation(baby.id, {
				onSuccess: () => {
					if (selectedBaby?.id === baby.id) {
						const remainingBabies = babies.filter((b) => b.id !== baby.id);
						if (remainingBabies.length > 0) {
							selectBaby(remainingBabies[0]);
						} else {
							selectBaby(null);
						}
					}
					toast.success(`${baby.name} was removed. You can restore the profile anytime.`);
				},
				onError: (error) => {
					toast.error(`Failed to remove ${baby.name}'s profile: ${error.message}`);
				},
			});
		}
	}

	function handleRestoreBaby(baby: Baby) {
		restoreBabyMutation(baby.id, {
			onSuccess: () => {
				toast.success(`${baby.name}'s profile was restored.`);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	}

	function handleEditBaby(baby: Baby) {
		window.setTimeout(() => {
			openBabyModal({ kind: HomeBabyModalKind.EditBaby, baby });
		}, EDIT_BABY_MENU_OPEN_DELAY_MS);
	}

	function handleOnAddBaby() {
		const abilityCheck = abilities.canCreateBaby();

		if (!abilityCheck.allowed) {
			abilities.showUpgradePrompt("create", "Baby");
			return;
		}

		openBabyModal({ kind: HomeBabyModalKind.AddBaby });
	}

	function handleBabyDialogOpenChange(nextOpen: boolean) {
		if (!nextOpen) closeBabyModal();
	}

	function handleNestedBabyDialogOpenChange(nextOpen: boolean) {
		if (!nextOpen) closeBabyModal();
	}

	useEffect(() => {
		if (subscription) {
			return;
		}

		createSubscription("PHP");
	}, [subscription, createSubscription]);

	useEffect(() => {
		if (babies.length === 0) {
			setSelectedBaby((prev) => {
				if (prev) localStorage.removeItem(SELECTED_BABY_STORAGE_KEY);
				return null;
			});
			return;
		}

		setSelectedBaby((prev) => {
			let next: Baby | null = null;
			if (prev) {
				const refreshed = babies.find((b) => b.id === prev.id);
				if (refreshed) next = refreshed;
			}
			if (!next) {
				const stored = localStorage.getItem(SELECTED_BABY_STORAGE_KEY);
				next =
					(stored ? babies.find((b) => b.id === stored) : undefined) ??
					babies[0];
			}
			if (next) {
				localStorage.setItem(SELECTED_BABY_STORAGE_KEY, next.id);
			}
			return next;
		});
	}, [babies]);

	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key !== SELECTED_BABY_STORAGE_KEY) return;
			const id = e.newValue;
			if (!id) {
				const next = babies[0] ?? null;
				setSelectedBaby(next);
				if (next) {
					localStorage.setItem(SELECTED_BABY_STORAGE_KEY, next.id);
				} else {
					localStorage.removeItem(SELECTED_BABY_STORAGE_KEY);
				}
				return;
			}
			const next = babies.find((b) => b.id === id);
			if (next) setSelectedBaby(next);
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [babies]);

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
			<NavigationBreadcrumbs items={[]} selectedBaby={selectedBaby} />

			<NavigationHub
				selectedBaby={selectedBaby}
				babies={babies}
				deletedBabies={deletedBabies}
				onSelectBaby={selectBaby}
				onAddBaby={handleOnAddBaby}
				onDeleteBaby={handleDeleteBaby}
				onRestoreBaby={handleRestoreBaby}
				onEditBaby={handleEditBaby}
			/>

			{selectedBaby && (
				<ProgressIndicator
					selectedBaby={selectedBaby}
					showDetailed={false}
				/>
			)}

			<div className="space-y-8">
				{selectedBaby && (
					<MonthCardGrid
						babyId={selectedBaby?.id}
						babyName={selectedBaby?.name}
						showGrid={selectedBaby !== null && !isLoading}
					/>
				)}

				{babies.length === 0 && !isLoading && (
					<EmptyState onAddBaby={handleOnAddBaby} />
				)}
			</div>

			{selectedBaby && (
				<div className="xl:hidden">
					<ProgressIndicator
						selectedBaby={selectedBaby}
						showDetailed={true}
					/>
				</div>
			)}

			{/*
				`modal={false}` + `staticBackdrop`: see radix-ui/primitives#2122 (pointer-events /
				nested portaled UI). Body scroll locked in `useEffect` while a baby modal is open.
			*/}
			<Dialog
				modal={false}
				open={babyModalOpen}
				onOpenChange={handleBabyDialogOpenChange}
			>
				{/*
					Do not put `key` on DialogContent: closing Edit used to change key from
					`edit-<id>` to `add`, remounting the Radix shell in the same tick as open=false
					and leaving react-remove-scroll’s body pointer-events lock stuck. Keys belong on
					the inner forms only so Add vs Edit still remount when switching.
				*/}
				<DialogContent staticBackdrop className="overflow-visible">
					{babyModal.kind === HomeBabyModalKind.AddBaby && (
						<AddBabyDialog
							key="add"
							open
							onOpenChange={handleNestedBabyDialogOpenChange}
							createBaby={createBaby}
						/>
					)}
					{babyModal.kind === HomeBabyModalKind.EditBaby && (
						<EditBabyDialog
							key={`edit-${babyModal.baby.id}`}
							open
							baby={babyModal.baby}
							onOpenChange={handleNestedBabyDialogOpenChange}
							updateBaby={updateBabyMutation}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default Home;
