
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { usePostTogglePin } from "@/hooks/post-mutations/use-post-toggle-pin";

interface UseAuthorPostOptionsProps {
  postId: string;
  isPinned?: boolean;
  visibility?: string;
}

export function useAuthorPostOptions({
  postId,
  isPinned = false,
  visibility = "public"
}: UseAuthorPostOptionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAudience, setIsEditingAudience] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: togglePin } = usePostTogglePin();

  const handleTogglePin = async () => {
    try {
      // Use the togglePin mutation
      togglePin(
        { postId, isPinned },
        {
          onSuccess: () => {
            toast({
              title: isPinned ? "Publicación desfijada" : "Publicación fijada",
              description: isPinned 
                ? "La publicación ya no aparecerá al inicio de tu perfil" 
                : "La publicación aparecerá al inicio de tu perfil",
            });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "No se pudo cambiar el estado de fijado de la publicación",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar el estado de fijado de la publicación",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditAudience = () => {
    setIsEditingAudience(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCancelAudienceEdit = () => {
    setIsEditingAudience(false);
  };

  const handleSaveEdit = async (content: string) => {
    try {
      const { error } = await (supabase as any)
        .from('posts')
        .update({ content })
        .eq('id', postId);
      
      if (error) throw error;
      
      toast({
        title: "Publicación actualizada",
        description: "El contenido de la publicación ha sido actualizado",
      });
      
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la publicación",
      });
    }
  };

  const handleSaveAudience = async (newVisibility: 'public' | 'friends' | 'private') => {
    try {
      const { error } = await (supabase as any)
        .from('posts')
        .update({ visibility: newVisibility })
        .eq('id', postId);
      
      if (error) throw error;
      
      toast({
        title: "Audiencia actualizada",
        description: "La audiencia de la publicación ha sido actualizada",
      });
      
      setIsEditingAudience(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      
    } catch (error) {
      console.error("Error updating audience:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la audiencia de la publicación",
      });
    }
  };

  return {
    isEditing,
    isEditingAudience,
    currentVisibility: visibility,
    isPinned,
    handleTogglePin,
    handleEdit,
    handleEditAudience,
    handleCancelEdit,
    handleCancelAudienceEdit,
    handleSaveEdit,
    handleSaveAudience
  };
}
