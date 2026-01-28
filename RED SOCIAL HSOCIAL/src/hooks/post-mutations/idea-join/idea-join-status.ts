
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIdeaJoinStatus(postId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  
  // Verificar si el usuario ya se unió al montar el componente
  useEffect(() => {
    const checkJoinStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        console.log("Verificando estado de participación para usuario:", user.id, "en post:", postId);

        // Comprobar directamente en la tabla idea_participants
        const { data: participation, error } = await supabase
          .from('idea_participants')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();
          
        if (error) {
          console.error("Error al verificar participación:", error);
        }
          
        const isInBackupTable = !!participation;
        console.log("¿Está en tabla de respaldo?:", isInBackupTable);
        
        // También verificar en el campo JSON de la idea
        const { data: postData } = await supabase
          .from('posts')
          .select('idea')
          .eq('id', postId)
          .single();
          
        let isInJsonField = false;
        
        if (postData?.idea && typeof postData.idea === 'object') {
          const ideaObj = postData.idea as Record<string, any>;
          if (Array.isArray(ideaObj.participants)) {
            isInJsonField = ideaObj.participants.some(p => {
              if (typeof p === 'string') return p === user.id;
              if (p && typeof p === 'object' && 'user_id' in p) {
                return p.user_id === user.id;
              }
              return false;
            });
          }
        }
        
        console.log("¿Está en campo JSON?:", isInJsonField);
        
        // Si está en cualquiera de los dos lugares, considerar que ha unido
        setHasJoined(isInBackupTable || isInJsonField);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking join status:", error);
        setIsLoading(false);
      }
    };
    
    checkJoinStatus();
  }, [postId]);

  return {
    isLoading,
    hasJoined,
    setHasJoined
  };
}
