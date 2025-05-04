
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

export interface Baby {
  id: string;
  name: string;
  date_of_birth: string;
  created_at: string;
  user_id: string;
}

export const useBabyProfiles = () => {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBabies = async () => {
    if (!user) {
      setBabies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("baby")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBabies(data || []);
    } catch (error: any) {
      console.error("Error fetching babies:", error);
      toast("Error", {
        description: "Failed to load baby profiles",
        variant: "destructive",
      });
      setBabies([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBaby = async (id: string) => {
    try {
      const { error } = await supabase
        .from("baby")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Refresh the list after deletion
      fetchBabies();
      
      toast("Success", {
        description: "Baby profile deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting baby:", error);
      toast("Error", {
        description: "Failed to delete baby profile",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBabies();
  }, [user]);

  return { babies, loading, fetchBabies, deleteBaby };
};
