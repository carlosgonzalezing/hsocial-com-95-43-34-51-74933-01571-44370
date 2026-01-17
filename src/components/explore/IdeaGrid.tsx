import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIdeaParticipantsCount } from "@/hooks/ideas/use-idea-participants-count";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Post } from "@/components/Post";
import type { Post as PostType } from "@/types/post";
import { JoinIdeaButton } from "@/components/post/actions/join-idea/JoinIdeaButton";

export function IdeaGrid({ searchQuery }: { searchQuery: string }) {
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  
  const { data: ideas, isLoading } = useQuery({
    queryKey: ['explore-ideas', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .eq('post_type', 'idea')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (searchQuery) {
        query = query.or(`content.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const postIds = ideas?.map(idea => idea.id) || [];
  const { data: participantCounts } = useIdeaParticipantsCount(postIds);

  if (isLoading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
    </div>;
  }

  if (!ideas || ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No se encontraron ideas</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ideas?.map((idea) => {
        const participantCount = participantCounts?.get(idea.id) || 0;
        
        return (
          <Card 
            key={idea.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-card border border-border"
            onClick={() => {
              setSelectedPost(idea as PostType);
              setShowPostModal(true);
            }}
          >
            {/* Imagen o placeholder */}
            {idea.media_url ? (
              <img 
                src={idea.media_url} 
                alt={idea.content}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Lightbulb className="h-12 w-12 text-white" />
              </div>
            )}
            
            <CardContent className="p-3 space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2">
                {idea.content?.substring(0, 60) || 'Idea sin título'}...
              </h3>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={idea.profiles?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {idea.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  @{idea.profiles?.username || 'usuario'}
                </span>
              </div>

              {participantCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {participantCount} {participantCount === 1 ? 'participante' : 'participantes'}
                </Badge>
              )}

              <div className="pt-1 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPost(idea as PostType);
                    setShowPostModal(true);
                  }}
                >
                  Ver publicación
                </Button>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <JoinIdeaButton
                    postId={idea.id}
                    size="sm"
                    className="h-8 px-3 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      <Dialog
        open={showPostModal && !!selectedPost}
        onOpenChange={(open) => {
          setShowPostModal(open);
          if (!open) setSelectedPost(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-4 py-3 border-b border-border">
            <DialogTitle className="text-base">Publicación</DialogTitle>
          </DialogHeader>

          <div className="p-4">
            {selectedPost && <Post post={selectedPost} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
