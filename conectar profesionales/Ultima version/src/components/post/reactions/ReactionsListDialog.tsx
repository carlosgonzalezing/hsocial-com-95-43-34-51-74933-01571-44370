import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { Loader2 } from "lucide-react";

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Hace un momento';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
  if (seconds < 2592000) return `Hace ${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
};

interface Reaction {
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface ReactionsListDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReactionsListDialog({ postId, open, onOpenChange }: ReactionsListDialogProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | ReactionType>("all");

  useEffect(() => {
    if (open && postId) {
      loadReactions();
    }
  }, [open, postId]);

  const loadReactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select(`
          user_id,
          reaction_type,
          created_at,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReactions(data as any || []);
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    reactions.forEach((r) => {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
    });
    return counts;
  };

  const filteredReactions = activeTab === "all" 
    ? reactions 
    : reactions.filter(r => r.reaction_type === activeTab);

  const counts = getReactionCounts();
  const totalCount = reactions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Reacciones ({totalCount})</DialogTitle>
          <DialogDescription className="sr-only">
            Lista de usuarios que reaccionaron a esta publicación
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b px-4 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Todas {totalCount}
            </TabsTrigger>
            {Object.entries(counts).map(([type, count]) => {
              const reaction = reactionIcons[type as ReactionType];
              if (!reaction) return null;
              return (
                <TabsTrigger 
                  key={type}
                  value={type}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <span className="mr-1">{reaction.emoji}</span> {count}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredReactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay reacciones todavía
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReactions.map((reaction) => {
                  const reactionData = reactionIcons[reaction.reaction_type];
                  const reactionTime = new Date(reaction.created_at);
                  const timeAgo = getTimeAgo(reactionTime);
                  
                  return (
                    <div key={`${reaction.user_id}-${reaction.created_at}`} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={reaction.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {reaction.profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {reaction.profiles?.username || 'Usuario'}
                            </p>
                            <span className="text-xl flex-shrink-0">
                              {reactionData?.emoji}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            @{reaction.profiles?.username?.toLowerCase().replace(/\s+/g, '_') || 'usuario'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
