import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserGrid({ searchQuery }: { searchQuery: string }) {
  const navigate = useNavigate();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['explore-users', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,career.ilike.%${searchQuery}%`);
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

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {users?.map((user) => (
        <Card 
          key={user.id} 
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 mb-3">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-lg">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-semibold text-sm line-clamp-1">
              @{user.username || 'usuario'}
            </h3>
            
            {user.career && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                {user.career}
              </p>
            )}
            
            <Button 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${user.id}`);
              }}
            >
              Ver perfil
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
