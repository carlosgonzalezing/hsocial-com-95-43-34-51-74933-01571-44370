import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface IdeaParticipantsProps {
  postId: string;
}

export function IdeaParticipants({ postId }: IdeaParticipantsProps) {
  const [participantsCount, setParticipantsCount] = useState(0);

  useEffect(() => {
    const loadParticipants = async () => {
      // Por ahora, usar un conteo simple basado en reacciones/comentarios
      const { count } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      setParticipantsCount(count || 0);
    };

    loadParticipants();
  }, [postId]);

  if (participantsCount === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
      <span>👥 {participantsCount} {participantsCount === 1 ? 'Participante' : 'Participantes'}</span>
    </div>
  );
}
