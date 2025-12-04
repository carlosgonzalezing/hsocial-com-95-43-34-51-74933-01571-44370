
import React from "react";
import { JoinIdeaDialog } from "@/components/post/idea/JoinIdeaDialog";
import { useToast } from "@/hooks/use-toast";

interface JoinIdeaDialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profession: string;
  setProfession: (profession: string) => void;
  onJoin: (profession: string) => Promise<boolean>; // Changed return type to boolean
  ideaTitle?: string;
}

export function JoinIdeaDialogWrapper({
  isOpen,
  onOpenChange,
  profession,
  setProfession,
  onJoin,
  ideaTitle
}: JoinIdeaDialogWrapperProps) {
  const { toast } = useToast();

  const handleJoin = async (professionValue: string): Promise<boolean> => {
    try {
      // Pass the profession value from the dialog
      const success = await onJoin(professionValue);
      if (success) {
        onOpenChange(false); // Close dialog on success
      }
      return success;
    } catch (error) {
      console.error("Error al unirse a la idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo unirte a la idea. Inténtalo de nuevo."
      });
      return false;
    }
  };

  return (
    <JoinIdeaDialog 
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onJoin={handleJoin}
      ideaTitle={ideaTitle}
    />
  );
}
