import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GroupGrid({ searchQuery }: { searchQuery: string }) {
  const navigate = useNavigate();
  
  const { data: groups, isLoading } = useQuery({
    queryKey: ['explore-groups', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('groups')
        .select('*')
        .eq('is_private', false)
        .order('member_count', { ascending: false })
        .limit(20);
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="grid grid-cols-2 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
    </div>;
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No se encontraron grupos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {groups?.map((group) => (
        <Card 
          key={group.id} 
          className="overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-[#262626] border-none"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          {/* Imagen del grupo */}
          {group.cover_url ? (
            <img 
              src={group.cover_url} 
              alt={group.name}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="h-12 w-12 text-white" />
            </div>
          )}
          
          <CardContent className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2 text-white mb-2">
              {group.name}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Users className="h-3 w-3" />
              <span>{group.member_count || 0} miembros</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
