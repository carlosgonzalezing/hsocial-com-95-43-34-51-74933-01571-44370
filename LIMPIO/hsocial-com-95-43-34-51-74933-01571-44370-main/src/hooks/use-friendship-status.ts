import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function useFriendshipStatus(userId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFriend, setIsFriend] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !userId || user.id === userId) {
      setIsLoading(false);
      return;
    }

    const checkFriendship = async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("status")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (error) {
        console.error("Error checking friendship:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setIsFriend(data.status === "accepted");
        setIsPending(data.status === "pending");
      }
      setIsLoading(false);
    };

    checkFriendship();
  }, [user, userId]);

  const sendFriendRequest = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: userId,
        status: "pending",
      });

      if (error) throw error;

      setIsPending(true);
      toast({
        title: "Solicitud enviada",
        description: "Se envió la solicitud de amistad",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    }
  };

  return {
    isFriend,
    isPending,
    isLoading,
    sendFriendRequest,
  };
}
