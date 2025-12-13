import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectJoinsListProps {
  postId: string;
  maxVisible?: number;
}

export function ProjectJoinsList({ postId, maxVisible = 3 }: ProjectJoinsListProps) {
  const { data: joins = [] } = useQuery({
    queryKey: ["project-joins", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_joins')
        .select('id, user_id, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching project joins:", error);
        return [];
      }
      
      if (!data || data.length === 0) return [];
      
      // Get profiles for the users
      const userIds = data.map(join => join.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      // Combine the data
      return data.map(join => ({
        ...join,
        profile: profiles?.find(p => p.id === join.user_id) || null
      }));
    }
  });
  
  if (joins.length === 0) return null;
  
  const visibleJoins = joins.slice(0, maxVisible);
  const remainingCount = joins.length - maxVisible;
  
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex -space-x-2">
        {visibleJoins.map((join) => (
          <Avatar key={join.id} className="h-6 w-6 border-2 border-background">
            <AvatarImage src={join.profile?.avatar_url || ''} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {join.profile?.username?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="font-medium text-green-600">🤝 {joins.length}</span>
        <span className="ml-1">
          {joins.length === 1 ? 'persona se unió' : 'personas se unieron'}
        </span>
        {remainingCount > 0 && (
          <span className="ml-1">y {remainingCount} más</span>
        )}
      </div>
    </div>
  );
}