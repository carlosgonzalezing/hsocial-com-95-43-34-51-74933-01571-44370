
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, UserPlus } from "lucide-react";
import { useJoinIdeaButton } from "@/hooks/post-mutations/idea-join/use-join-idea-button";
import { useState, useEffect } from "react";
import { JoinIdeaDialog } from "@/components/post/idea/JoinIdeaDialog";
import { supabase } from "@/integrations/supabase/client";

interface JoinIdeaButtonProps {
  postId: string;
  ideaId?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function JoinIdeaButton({ 
  postId, 
  ideaId,
  variant = "default",
  size = "default",
  className = ""
}: JoinIdeaButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profession, setProfession] = useState("");
  const {
    isParticipant,
    isJoining,
    isLeaving,
    handleJoinIdea,
    handleLeaveIdea
  } = useJoinIdeaButton({ postId });

  // Verificar si el usuario tiene una carrera registrada
  useEffect(() => {
    const getUserCareer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data } = await (supabase as any)
          .from("profiles")
          .select("career")
          .eq("id", user.id)
          .single();
          
        if (data && data.career) {
          setProfession(data.career);
        }
      } catch (error) {
        console.error("Error al obtener carrera del usuario:", error);
      }
    };
    
    if (!isParticipant) {
      getUserCareer();
    }
  }, [isParticipant]);

  // Handle loading state
  if (isJoining || isLeaving) {
    return <LoadingButton size={size} />;
  }

  // Handle join idea submission
  const onJoinSubmit = async (professionValue: string): Promise<boolean> => {
    console.log("Submitting join idea with profession:", professionValue);
    // Ensure profession is not empty before submitting
    if (!professionValue.trim()) {
      return false;
    }
    
    const success = await handleJoinIdea(professionValue);
    return success;
  };

  // If user is already a participant, show leave button
  if (isParticipant) {
    return (
      <Button 
        className={`flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border-none ${className}`}
        variant="secondary"
        size={size}
        onClick={handleLeaveIdea}
      >
        <LogOut className="h-4 w-4" />
        Ya unido
      </Button>
    );
  }

  // Otherwise show join button and dialog
  return (
    <>
      <Button 
        className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        variant="default"
        size={size}
        onClick={() => setDialogOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Unirme
      </Button>

      <JoinIdeaDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onJoin={onJoinSubmit}
        ideaTitle={ideaId ? "esta idea" : undefined}
      />
    </>
  );
}

function LoadingButton({ size }: { size?: "default" | "sm" | "lg" }) {
  return (
    <Button 
      className="flex items-center gap-2"
      variant="outline"
      size={size}
      disabled
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      Cargando
    </Button>
  );
}
