import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useConvertIdea() {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const convertIdeaToProject = async (
    postId: string,
    newStatus: 'in_progress' | 'completed' = 'in_progress'
  ) => {
    setIsConverting(true);
    
    try {
      const { data, error } = await supabase.rpc('convert_idea_to_project', {
        post_id_param: postId,
        new_status: newStatus
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || 'Error al convertir la idea');
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["personalized-feed"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      toast({
        title: "¡Idea convertida!",
        description: result.message || "La idea se ha convertido en proyecto exitosamente",
      });

      return true;
    } catch (error) {
      console.error("Error converting idea to project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo convertir la idea",
      });
      return false;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    convertIdeaToProject,
    isConverting
  };
}
