
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hidePost, unhidePost, setPostInterest, hideUser } from "@/lib/api/posts/manage";

interface UsePostOptionsProps {
  postId: string;
  postUserId: string;
  isHidden?: boolean;
  onHideToggle?: () => void;
}

export function usePostOptions({
  postId,
  postUserId,
  isHidden = false,
  onHideToggle
}: UsePostOptionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsername() {
      try {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('username')
          .eq('id', postUserId)
          .single();
        
        if (error) throw error;
        if (data && 'username' in data) {
          setUsername(data?.username || "Usuario");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("Usuario");
      }
    }
    
    fetchUsername();
  }, [postUserId]);

  const handleSetInterest = async (level: 'interested' | 'not_interested') => {
    try {
      setIsLoading(true);
      
      await setPostInterest(postId, level);
      
      toast({
        title: level === 'interested' ? "Te interesa" : "No te interesa",
        description: level === 'interested' 
          ? "Verás más contenido como este" 
          : "Verás menos contenido como este",
      });
      setOpen(false);
    } catch (error) {
      console.error('Error setting interest:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar tu interés",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHidePost = async () => {
    try {
      setIsLoading(true);
      
      if (isHidden) {
        await unhidePost(postId);
        toast({
          title: "Publicación mostrada",
          description: "Esta publicación ahora está visible",
        });
      } else {
        await hidePost(postId);
        toast({
          title: "Publicación oculta",
          description: "Ya no verás esta publicación",
        });
      }
      
      if (onHideToggle) {
        onHideToggle();
      }
      setOpen(false);
    } catch (error) {
      console.error('Error hiding post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ocultar la publicación",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideUser = async () => {
    try {
      setIsLoading(true);
      
      await hideUser(postUserId);
      
      toast({
        title: "Usuario oculto",
        description: `Ya no verás publicaciones de ${username || 'este usuario'}`,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error hiding user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ocultar al usuario",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportPost = () => {
    navigate(`/report?type=post&id=${postId}`);
    setOpen(false);
  };

  return {
    isLoading,
    open,
    setOpen,
    username,
    handleSetInterest,
    handleHidePost,
    handleHideUser,
    handleReportPost
  };
}
