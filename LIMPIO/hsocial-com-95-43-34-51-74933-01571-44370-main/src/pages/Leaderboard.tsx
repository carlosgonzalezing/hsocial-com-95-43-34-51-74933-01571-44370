import { Layout } from "@/components/layout";
import { Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Leaderboard() {
  const navigate = useNavigate();
  
  const { data: topUsers, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Layout hideLeftSidebar hideRightSidebar>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout hideLeftSidebar hideRightSidebar>
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl font-bold">Tabla de Popularidad</h1>
        </div>

        <div className="space-y-3">
          {topUsers?.map((user, index) => (
            <Card 
              key={user.id} 
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-muted-foreground min-w-[40px]">
                  #{index + 1}
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">@{user.username || 'usuario'}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.career || 'Sin carrera'}
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1 flex-shrink-0">
                  <Star className="h-3 w-3" />
                  Top
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
