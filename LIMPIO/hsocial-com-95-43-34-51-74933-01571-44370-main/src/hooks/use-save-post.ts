import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSavePost(postId: string) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkIfSaved();
  }, [postId]);

  const checkIfSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_posts")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setIsSaved(!!data);
    } catch (error) {
      console.error("Error checking saved post:", error);
    }
  };

  const toggleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para guardar publicaciones",
          variant: "destructive"
        });
        return;
      }

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
        
        setIsSaved(false);
        toast({
          title: "Publicación eliminada de guardados",
          description: "La publicación se ha eliminado de tus guardados"
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from("saved_posts")
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        
        setIsSaved(true);
        toast({
          title: "Publicación guardada",
          description: "La publicación se ha guardado correctamente"
        });
      }
    } catch (error: any) {
      console.error("Error toggling save:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la publicación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSaved,
    toggleSave,
    isLoading
  };
}
