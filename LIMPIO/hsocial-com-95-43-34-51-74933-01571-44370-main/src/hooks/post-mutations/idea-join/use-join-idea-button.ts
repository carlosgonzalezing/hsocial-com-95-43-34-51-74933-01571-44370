
import { useState, useEffect } from "react";
import { useIdeaJoinMutation } from "./use-idea-join-mutation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface UseJoinIdeaButtonProps {
  postId: string;
  isParticipant?: boolean;
  showConfirmation?: boolean;
}

export function useJoinIdeaButton({
  postId,
  showConfirmation = true,
}: UseJoinIdeaButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [profession, setProfession] = useState("");
  const [isParticipant, setIsParticipant] = useState(false);
  const { joinIdea, leaveIdea, isJoining, isLeaving } = useIdeaJoinMutation({
    postId,
    onSuccess: () => checkParticipantStatus()
  });
  
  // Verificar si el usuario ya es participante
  const checkParticipantStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Verificar en la tabla idea_participants
      const { data: participant } = await supabase
        .from("idea_participants")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
        
      setIsParticipant(!!participant);
    } catch (error) {
      console.error("Error checking participant status:", error);
    }
  };
  
  // Verificar el estado del participante al cargar el componente
  useEffect(() => {
    checkParticipantStatus();
  }, [postId]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleJoinIdea = async (professionValue: string) => {
    if (!professionValue.trim()) {
      toast({
        title: "Error",
        description: "Debes indicar tu profesión o habilidad",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      console.log("Joining idea with profession:", professionValue);
      const result = await joinIdea(professionValue);
      
      if (result.success) {
        toast({
          title: "¡Te has unido a la idea!",
          description: "Ahora podrás colaborar con otros participantes",
        });
        await checkParticipantStatus();
      } else if (result.alreadyJoined) {
        toast({
          title: "Ya eres participante",
          description: "Ya formas parte de esta idea",
        });
      }
      
      return result.success;
    } catch (error) {
      console.error("Error joining idea:", error);
      toast({
        title: "Error",
        description: "No se pudo unir a la idea",
        variant: "destructive",
      });
      return false;
    }
  };

  // Implementar leaveIdea
  const handleLeaveIdea = async () => {
    try {
      const success = await leaveIdea();
      
      if (success) {
        toast({
          title: "Has abandonado la idea",
          description: "Ya no eres participante de esta idea",
        });
        await checkParticipantStatus();
      }
      
      return success;
    } catch (error) {
      console.error("Error leaving idea:", error);
      toast({
        title: "Error",
        description: "No se pudo abandonar la idea",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    profession,
    setProfession,
    handleJoinIdea,
    handleLeaveIdea,
    isParticipant,
    isJoining,
    isLeaving,
  };
}
