
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Feed } from "@/components/feed/Feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Grid, Lightbulb, FolderOpen } from "lucide-react";

interface ProfileContentProps {
  profileId: string;
}

export function ProfileContent({ profileId }: ProfileContentProps) {
  // Get friends data directly from Supabase
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends', profileId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('friendships')
          .select(`
            user:profiles!friendships_user_id_fkey(id, username, avatar_url)
          `)
          .eq('friend_id' as any, profileId)
          .eq('status' as any, 'accepted');

        if (error) throw error;
        
        const rows = (data as any[]) || [];
        return rows.map((item: any) => ({
          friend_id: item?.user?.id,
          friend_username: item?.user?.username,
          friend_avatar_url: item?.user?.avatar_url
        })).filter((f: any) => !!f.friend_id);
      } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
      }
    }
  });

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
        <TabsTrigger 
          value="posts" 
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <Grid className="h-4 w-4" />
          <span className="hidden sm:inline">Publicaciones</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ideas"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="hidden sm:inline">Ideas</span>
        </TabsTrigger>
        <TabsTrigger 
          value="files"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Archivos</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-0">
        <Feed userId={profileId} />
      </TabsContent>
      
      <TabsContent value="ideas" className="mt-0">
        <Feed userId={profileId} />
      </TabsContent>
      
      <TabsContent value="files" className="mt-0">
        <Card className="p-8">
          <p className="text-center text-muted-foreground">No hay archivos disponibles</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

