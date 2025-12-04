import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function LeaderboardGrid({ searchQuery }: { searchQuery: string }) {
  const navigate = useNavigate();
  
  const { data: leaders, isLoading } = useQuery({
    queryKey: ['explore-leaders', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(20);
      
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="space-y-3">
      {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
    </div>;
  }

  if (!leaders || leaders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No se encontraron líderes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leaders?.map((leader, index) => (
        <Card 
          key={leader.id} 
          className="overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-[#262626] border-none"
          onClick={() => navigate(`/profile/${leader.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Ranking número */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0095f6] text-white font-bold text-sm">
                {index + 1}
              </div>
              
              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarImage src={leader.avatar_url || undefined} />
                <AvatarFallback className="bg-gray-700 text-white">
                  {leader.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-white">
                  {leader.username || 'Usuario'}
                </h3>
                <p className="text-xs text-gray-400">
                  {leader.bio?.substring(0, 30) || 'Usuario destacado'}
                </p>
              </div>
              
              {/* Badge */}
              <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
                <Trophy className="h-3 w-3 mr-1" />
                Top
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
