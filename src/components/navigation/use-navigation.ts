
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionManager } from "@/hooks/use-subscription-manager";
import type { NavigationLink } from "./types";

export function useNavigation() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newPosts, setNewPosts] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getOrCreateChannel, removeChannel } = useSubscriptionManager();

  useEffect(() => {
    // Obtener usuario actual
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getUserId();

    // Establecer un listener para cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setCurrentUserId(session?.user.id || null);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
      }
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    // Load initial unread notifications count
    const loadUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("receiver_id", currentUserId)
        .eq("read", false);
      
      if (count !== null) {
        setUnreadNotifications(count);
      }
    };

    loadUnreadCount();

    // Set up notifications subscription
    const notificationsPromise = getOrCreateChannel("notifications", (channel) => {
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          if (location.pathname !== "/notifications") {
            setUnreadNotifications(prev => prev + 1);
            // Notificar al usuario
            const notif = payload.new as any;
            if (notif.type === "post_like") {
              toast({
                title: "Nueva notificación",
                description: "Alguien ha reaccionado a tu publicación"
              });
            } else if (notif.type === "post_comment") {
              toast({
                title: "Nueva notificación",
                description: "Alguien ha comentado en tu publicación"
              });
            } else if (notif.type === "friend_request") {
              toast({
                title: "Nueva notificación",
                description: "Has recibido una solicitud de seguimiento"
              });
            } else if (notif.type === "profile_heart_received") {
              toast({
                title: "❤️ Nuevo corazón",
                description: "Alguien te envió un corazón en tu perfil"
              });
            } else if (notif.type === "engagement_hearts_earned") {
              toast({
                title: "❤️ Corazones ganados",
                description: "Has ganado corazones por tu actividad"
              });
            } else if (notif.type === "mention") {
              toast({
                title: "📢 Te han mencionado",
                description: "Alguien te mencionó en una publicación"
              });
            }
          }
        }
      );
    });

    // Set up posts subscription
    const postsPromise = getOrCreateChannel("new-posts", (channel) => {
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts"
        },
        (payload) => {
          if (location.pathname !== "/" && payload.new) {
            const post = payload.new as any;
            // Si no es una publicación propia
            if (post.user_id !== currentUserId) {
              setNewPosts(prev => prev + 1);
            }
          }
        }
      );
    });

    // Handle subscription errors
    notificationsPromise?.catch((error) => {
      console.error("Failed to subscribe to notifications:", error);
    });

    postsPromise?.catch((error) => {
      console.error("Failed to subscribe to posts:", error);
    });

    return () => {
      removeChannel("notifications");
      removeChannel("new-posts");
    };
  }, [currentUserId, location.pathname, toast, getOrCreateChannel, removeChannel]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Explicitly navigate to auth page after signing out
      navigate("/auth");
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente."
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta nuevamente."
      });
    }
  };

  const handleHomeClick = () => {
    // Resetear contador de nuevas publicaciones
    setNewPosts(0);

    // Si ya estamos en la página principal, forzar scroll al inicio y mostrar publicaciones recientes
    if (location.pathname === "/") {
      // Usar searchParams para indicar que queremos mostrar publicaciones recientes
      navigate("/?new=true");
      // Hacer scroll al inicio de la página
      window.scrollTo(0, 0);
    } else {
      // Si no estamos en la página principal, navegar allí con el parámetro
      navigate("/?new=true");
    }
  };

  const handleNotificationClick = async () => {
    setUnreadNotifications(0);
    
    // Mark all notifications as read when clicking on notifications icon
    if (currentUserId) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("receiver_id", currentUserId)
        .eq("read", false);
    }
  };

  return {
    currentUserId,
    unreadNotifications,
    newPosts,
    handleLogout,
    handleHomeClick,
    handleNotificationClick,
    location
  };
}
