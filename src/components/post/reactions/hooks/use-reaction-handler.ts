
import { useState } from 'react';
import { db } from '@/lib/supabase-type-helpers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ReactionType } from '@/types/database/social.types';

interface UseReactionHandlerProps {
  postId: string;
  initialReaction?: ReactionType;
}

export function useReactionHandler({ postId, initialReaction }: UseReactionHandlerProps) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialReaction || null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReaction = async (reactionType: ReactionType) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar"
        });
        return;
      }

      // Check if user already has a reaction on this post
      const { data: existingReaction } = await db.select("reactions", "*")
        .eq("post_id" as any, postId)
        .eq("user_id" as any, user.id)
        .single();

      const existing = db.getData(existingReaction);

      if (existing) {
        // If same reaction, remove it; if different, update it
        if (db.getProp(existing, 'reaction_type') === reactionType) {
          await db.delete("reactions")
            .eq("post_id" as any, postId)
            .eq("user_id" as any, user.id);
          setUserReaction(null);
        } else {
          await db.update("reactions", { reaction_type: reactionType } as any)
            .eq("post_id" as any, postId)
            .eq("user_id" as any, user.id);
          setUserReaction(reactionType as ReactionType);
        }
      } else {
        // Create new reaction
        await db.insert("reactions", {
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType
        } as any);
        setUserReaction(reactionType as ReactionType);
      }

    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la reacción"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userReaction,
    isLoading,
    handleReaction
  };
}
