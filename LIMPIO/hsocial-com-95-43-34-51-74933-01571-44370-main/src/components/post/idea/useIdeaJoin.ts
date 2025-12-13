
import { useState, useEffect } from "react";
import { db } from "@/lib/supabase-type-helpers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useIdeaJoin(postId: string) {
  const [isParticipant, setIsParticipant] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is already a participant
  useEffect(() => {
    checkParticipation();
  }, [postId]);

  const checkParticipation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await db.select("idea_participants", "*")
        .eq("user_id" as any, user.id)
        .eq("post_id" as any, postId);

      const participants = db.getArray(data, []);
      setIsParticipant(participants.length > 0);
    } catch (error) {
      console.error("Error checking participation:", error);
    }
  };

  const joinIdea = async (profession: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Get current post data
      const { data: postData } = await db.select("posts", "idea")
        .eq("id" as any, postId)
        .single();

      const post = db.getData(postData);
      if (!post) throw new Error("Post no encontrado");

      const currentIdea = db.getProp(post, 'idea', {});
      const currentParticipants = db.getProp(currentIdea, 'participants', []);

      // Add participant to database
      await db.insert("idea_participants", {
        user_id: user.id,
        post_id: postId,
        profession: profession
      } as any);

      // Update post's idea JSON
      const newParticipant = {
        user_id: user.id,
        profession: profession,
        joined_at: new Date().toISOString()
      };

      const updatedParticipants = [...currentParticipants, newParticipant];
      const updatedIdea = {
        ...currentIdea,
        participants: updatedParticipants
      };

      await db.update("posts", { idea: updatedIdea } as any)
        .eq("id" as any, postId);

      setIsParticipant(true);
      toast({
        title: "¡Te has unido a la idea!",
        description: "Ahora formas parte de este proyecto"
      });

      return true;
    } catch (error: any) {
      console.error("Error joining idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo unir a la idea"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveIdea = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Remove from database
      await db.delete("idea_participants")
        .eq("user_id" as any, user.id)
        .eq("post_id" as any, postId);

      setIsParticipant(false);
      toast({
        title: "Has salido de la idea",
        description: "Ya no formas parte de este proyecto"
      });

      return true;
    } catch (error: any) {
      console.error("Error leaving idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo salir de la idea"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isParticipant,
    isLoading,
    joinIdea,
    leaveIdea,
    checkParticipation
  };
}
