
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MentionUser } from "./types";

export function useMentionSearch() {
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const { toast } = useToast();

  // Search for users when mentionSearch changes
  useEffect(() => {
    if (mentionSearch.length === 0) {
      setMentionUsers([]);
      return;
    }

    const searchForUsers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log("Searching for users with query:", mentionSearch);
        
        // Crear opciones especiales
        const specialOptions = createSpecialOptions(mentionSearch);
        
        // Primero buscar entre amigos y seguidores
        const friendsAndFollowers = await fetchFriendsAndFollowers(user.id, mentionSearch);
        
        // Si no hay suficientes resultados de usuarios, complementar con otros usuarios
        const remainingSlots = Math.max(0, 5 - friendsAndFollowers.length);
        const otherUsers = remainingSlots > 0 ? await fetchOtherUsers(user.id, mentionSearch, remainingSlots) : [];
        
        // Combinar: opciones especiales primero, luego usuarios
        setMentionUsers([...specialOptions, ...friendsAndFollowers, ...otherUsers]);
      } catch (error) {
        console.error('Error searching for users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los usuarios para mención"
        });
      }
    };

    // Always search if we have at least one character to make sure results show up
    if (mentionSearch.length > 0) {
      searchForUsers();
    }
  }, [mentionSearch, toast]);

  // Crear opciones especiales basadas en la búsqueda
  const createSpecialOptions = (query: string): MentionUser[] => {
    const options: MentionUser[] = [];
    
    if ('seguidores'.includes(query.toLowerCase())) {
      options.push({
        id: 'special-seguidores',
        username: 'seguidores',
        avatar_url: null,
        isSpecial: true,
        specialType: 'seguidores',
        description: 'Algunos seguidores podrían recibir notificaciones'
      });
    }
    
    if ('destacar'.includes(query.toLowerCase())) {
      options.push({
        id: 'special-destacar',
        username: 'destacar',
        avatar_url: null,
        isSpecial: true,
        specialType: 'destacar',
        description: 'Es posible que algunos amigos reciban notificaciones'
      });
    }
    
    return options;
  };

  // Función para obtener amigos y seguidores que coincidan con la búsqueda
  const fetchFriendsAndFollowers = async (userId: string, query: string): Promise<MentionUser[]> => {
    const results: MentionUser[] = [];
    
    // 1. Obtener amigos (relaciones aceptadas donde el usuario es el iniciador)
    const { data: friends, error: friendsError } = await supabase
      .from('friendships')
      .select(`
        friend:profiles!friendships_friend_id_fkey (
          id, username, avatar_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');
      
    if (friendsError) {
      console.error("Error fetching friends:", friendsError);
    } else {
      const filteredFriends = friends
        .filter(f => f.friend.username?.toLowerCase().includes(query.toLowerCase()))
        .map(f => ({
          id: f.friend.id,
          username: f.friend.username || '',
          avatar_url: f.friend.avatar_url,
          relationship: 'Amigo'
        }));
      results.push(...filteredFriends);
    }
    
    // 2. Obtener seguidores (relaciones donde el usuario es el objetivo)
    const { data: followers, error: followersError } = await supabase
      .from('friendships')
      .select(`
        user:profiles!friendships_user_id_fkey (
          id, username, avatar_url
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'accepted');
      
    if (followersError) {
      console.error("Error fetching followers:", followersError);
    } else {
      // Excluir usuarios que ya son amigos (ya incluidos arriba)
      const friendIds = new Set(results.map(r => r.id));
      
      const filteredFollowers = followers
        .filter(f => 
          !friendIds.has(f.user.id) && 
          f.user.username?.toLowerCase().includes(query.toLowerCase())
        )
        .map(f => ({
          id: f.user.id,
          username: f.user.username || '',
          avatar_url: f.user.avatar_url,
          relationship: 'Seguidor'
        }));
      results.push(...filteredFollowers);
    }
    
    return results.slice(0, 5); // Limitar a 5 resultados máximo
  };
  
  // Función para obtener otros usuarios si no hay suficientes amigos/seguidores
  const fetchOtherUsers = async (userId: string, query: string, limit: number): Promise<MentionUser[]> => {
    if (limit <= 0) return [];
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .neq('id', userId)
      .ilike('username', `%${query}%`)
      .order('username')
      .limit(limit);

    if (error) {
      console.error("Error fetching other users:", error);
      return [];
    }
    
    return (data || []).map(user => ({
      id: user.id,
      username: user.username || '',
      avatar_url: user.avatar_url,
      relationship: null
    }));
  };

  return {
    mentionUsers,
    mentionSearch,
    setMentionSearch
  };
}
