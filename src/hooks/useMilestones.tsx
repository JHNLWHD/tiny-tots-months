import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Milestone = {
	id: string;
	baby_id: string;
	milestone_text: string;
	month_number: number;
	created_at: string;
	updated_at: string;
};

export type CreateMilestoneData = {
	baby_id: string;
	milestone_text: string;
	month_number: number;
};

export const useMilestones = (babyId?: string, monthNumber?: number) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const fetchMilestones = async (): Promise<Milestone[]> => {
		if (!user || !babyId || !monthNumber) return [];

		const query = supabase
			.from("milestone")
			.select("*")
			.eq("baby_id", babyId)
			.eq("month_number", monthNumber);

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching milestones:", error);
			toast("Error loading milestones", {
				description: "Failed to load milestone data",
				className: "bg-destructive text-destructive-foreground",
			});
			throw error;
		}

		return data || [];
	};

	const {
		data: milestones = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["milestones", babyId, monthNumber],
		queryFn: fetchMilestones,
		enabled: !!user && !!babyId && !!monthNumber,
	});

	const createMilestoneMutation = useMutation({
		mutationFn: async (data: CreateMilestoneData) => {
			const { error, data: newMilestone } = await supabase
				.from("milestone")
				.insert(data)
				.select()
				.single();

			if (error) throw error;
			return newMilestone;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["milestones", babyId, monthNumber],
			});
			toast("Success", {
				description: "Milestone added successfully",
			});
		},
		onError: (error) => {
			console.error("Error creating milestone:", error);
			toast("Error", {
				description: "Failed to add milestone",
				className: "bg-destructive text-destructive-foreground",
			});
		},
	});

	const deleteMilestoneMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("milestone").delete().eq("id", id);

			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["milestones", babyId, monthNumber],
			});
			toast("Success", {
				description: "Milestone deleted successfully",
			});
		},
		onError: (error) => {
			console.error("Error deleting milestone:", error);
			toast("Error", {
				description: "Failed to delete milestone",
				className: "bg-destructive text-destructive-foreground",
			});
		},
	});

	return {
		milestones,
		isLoading,
		refetch,
		createMilestone: createMilestoneMutation.mutate,
		deleteMilestone: deleteMilestoneMutation.mutate,
		isCreating: createMilestoneMutation.isPending,
		isDeleting: deleteMilestoneMutation.isPending,
	};
};
