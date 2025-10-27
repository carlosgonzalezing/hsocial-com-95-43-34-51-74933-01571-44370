import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useStoryCreator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createStory = async (file: File | null, text: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión",
        variant: "destructive",
      });
      return false;
    }

    setIsCreating(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("stories")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("stories")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Create story
      const { error: insertError } = await supabase.from("stories").insert({
        user_id: user.id,
        image_url: imageUrl || "https://via.placeholder.com/800x1200?text=" + encodeURIComponent(text),
        media_type: "image",
      });

      if (insertError) throw insertError;

      toast({
        title: "¡Historia publicada!",
        description: "Tu historia se publicó correctamente",
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["stories"] });

      return true;
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: "Error",
        description: "No se pudo publicar la historia",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createStory,
    isCreating,
  };
}
