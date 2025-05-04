
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { useSubscription } from "@/hooks/useSubscription";

export interface Baby {
  id: string;
  name: string;
  date_of_birth: string;
  created_at: string;
  user_id: string;
}

export const useBabyProfiles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isPremium } = useSubscription();
  
  const fetchBabies = async (): Promise<Baby[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("baby")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching babies:", error);
      toast("Error", {
        description: "Failed to load baby profiles",
        className: "bg-destructive text-destructive-foreground",
      });
      throw error;
    }
    
    return data || [];
  };

  const { data: babies = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['babies', user?.id],
    queryFn: fetchBabies,
    enabled: !!user,
  });

  const createBabyProfile = useMutation({
    mutationFn: async ({ name, dateOfBirth }: { name: string, dateOfBirth: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Check for free tier limit (1 baby)
      if (!isPremium && babies.length >= 1) {
        throw new Error("Free users can only create one baby profile. Upgrade to Premium for unlimited profiles.");
      }
      
      const { data, error } = await supabase
        .from("baby")
        .insert({
          name,
          date_of_birth: dateOfBirth,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] });
      toast("Success", {
        description: "Baby profile created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error creating baby profile:", error);
      toast("Error", {
        description: error.message || "Failed to create baby profile",
        className: "bg-destructive text-destructive-foreground",
      });
    },
  });

  const deleteBabyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("baby")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] });
      toast("Success", {
        description: "Baby profile deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting baby:", error);
      toast("Error", {
        description: "Failed to delete baby profile",
        className: "bg-destructive text-destructive-foreground",
      });
    },
  });

  const deleteBaby = (id: string) => {
    deleteBabyMutation.mutate(id);
  };

  return { 
    babies, 
    loading, 
    fetchBabies: refetch, 
    deleteBaby,
    createBaby: createBabyProfile.mutate,
    isDeleting: deleteBabyMutation.isPending,
    isCreating: createBabyProfile.isPending,
    canCreateNewBaby: isPremium || babies.length < 1
  };
};
