
import React, { useEffect, useState } from "react";
import { ActionsButtons } from "./actions/ActionsButtons";
import { PostActivitySummary } from "./PostActivitySummary";
import { JoinIdeaButton } from "./actions/join-idea/JoinIdeaButton";
import { usePostReactions } from "@/hooks/posts/use-post-reactions";
import { Post } from "@/types/post";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getPostSharesCount } from "@/lib/api/posts/queries/shares";

interface PostActionsProps {
  post: Post;
  onToggleComments: () => void;
  onCommentsClick: () => void;
  commentsExpanded?: boolean;
  isIdeaPost?: boolean;
}

export function PostActions({
  post,
  onToggleComments,
  onCommentsClick,
  commentsExpanded = false,
  isIdeaPost = false
}: PostActionsProps) {
  // Use the centralized hook for reactions
  const { userReaction, onReaction } = usePostReactions(post.id);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  
  // Load shares count
  useEffect(() => {
    const loadSharesCount = async () => {
      try {
        const count = await getPostSharesCount(post.id);
        setSharesCount(count);
      } catch (error) {
        console.error("Error loading shares count:", error);
      }
    };

    loadSharesCount();
  }, [post.id]);

  // Load updated participants
  useEffect(() => {
    if (!isIdeaPost || !post.idea) return;
    
    const loadParticipants = async () => {
      try {
        // Get participants from the backup table
        const { data, error } = await (supabase as any)
          .from("idea_participants")
          .select("user_id")
          .eq("post_id", post.id);
          
        if (error) {
          console.error("Error loading participants:", error);
          return;
        }
        
        // If there are participants in the backup table, update the count
        if (data && data.length > 0) {
          setParticipantsCount(data.length);
        } else if (post.idea && Array.isArray(post.idea.participants)) {
          // Use the participants from the idea field if none in the backup table
          setParticipantsCount(post.idea.participants.length);
        }
      } catch (error) {
        console.error("Error loading participants:", error);
      }
    };
    
    loadParticipants();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`participants_${post.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'idea_participants',
        filter: `post_id=eq.${post.id}`
      }, () => {
        console.log("Change in participants detected, reloading...");
        loadParticipants();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, post.idea, isIdeaPost]);

  // Process reactions data
  const reactionsByType: Record<string, number> = {};
  if (Array.isArray(post.reactions)) {
    post.reactions.forEach((reaction: any) => {
      const type = reaction.reaction_type || reaction.type || 'love';
      reactionsByType[type] = (reactionsByType[type] || 0) + 1;
    });
  } else if (post.reactions?.by_type) {
    Object.assign(reactionsByType, post.reactions.by_type);
  }

  return (
    <div className="pt-0">
      {/* Activity Summary - reactions, comments, shares */}
      <PostActivitySummary
        post={post}
        reactionsByType={reactionsByType}
        commentsCount={post.comments_count || 0}
        sharesCount={sharesCount}
        onCommentsClick={onCommentsClick}
      />
      
      {/* Standard action buttons (like, comments, share) */}
      <ActionsButtons
        postId={post.id}
        userReaction={userReaction}
        onComment={onCommentsClick}
        post={post}
        onReaction={onReaction}
        commentsExpanded={commentsExpanded}
        sharesCount={sharesCount}
      />
      
      {/* If this is an idea post, show join button and participant counter */}
      {isIdeaPost && post.idea && (
        <div className="border-t px-4 py-3">
          <div className="flex flex-col gap-3">
            <Link to={`/idea/${post.id}/participants`} className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Participantes ({participantsCount})</span>
              </div>
            </Link>
            
            <JoinIdeaButton 
              postId={post.id} 
              ideaId={post.idea.id} 
              size="default"
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
