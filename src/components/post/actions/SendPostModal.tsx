import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Search, MessageCircle, Check } from "lucide-react";
import { Post } from "@/types/post";
import { playUiSound } from "@/lib/ui-sounds";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface SendPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export function SendPostModal({ isOpen, onClose, post }: SendPostModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredFriends(
        friends.filter((friend) =>
          friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFriends([]);
        setFilteredFriends([]);
        return;
      }

      // MODELO SIMPLE TIPO INSTAGRAM:
      // contacto = persona a la que SIGO y que TAMBIÉN me sigue (mutuo)

      // Usuarios que SIGUES (following)
      const { data: following, error: followingError } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingError) throw followingError;

      // Usuarios que te SIGUEN (followers)
      const { data: followers, error: followersError } = await supabase
        .from("followers")
        .select("follower_id")
        .eq("following_id", user.id);

      if (followersError) throw followersError;

      const followingIds = new Set(
        following?.map((f: { following_id: string }) => f.following_id) || []
      );
      const followerIds = new Set(
        followers?.map((f: { follower_id: string }) => f.follower_id) || []
      );

      // IDs que están en ambos sets = se siguen mutuamente
      const mutualIds = Array.from(followingIds).filter((id) => followerIds.has(id));

      if (mutualIds.length === 0) {
        setFriends([]);
        setFilteredFriends([]);
        return;
      }

      // Cargar perfiles de esos contactos mutuos
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", mutualIds);

      if (profilesError) throw profilesError;

      const contacts: Friend[] =
        profiles?.map((p) => ({
          id: p.id,
          username: p.username || "Usuario",
          avatar_url: p.avatar_url,
        })) || [];

      setFriends(contacts);
      setFilteredFriends(contacts);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
      setFilteredFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      playUiSound('copy');
      toast({
        title: "Enlace copiado",
        description: "El enlace se ha copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const handleSendToGlobalChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para enviar mensajes",
          variant: "destructive",
        });
        return;
      }

      const postUrl = `${window.location.origin}/post/${post.id}`;
      const message = `📢 Compartido: ${post.content?.slice(0, 100) || "Publicación"}... \n🔗 ${postUrl}`;

      const { error } = await supabase.from("mensajes").insert({
        contenido: message,
        id_autor: user.id,
        id_canal: "2f79759f-c53f-40ae-b786-59f6e69264a6", // Global chat ID
      });

      if (error) throw error;

      playUiSound('send_post');

      toast({
        title: "Enviado",
        description: "Se ha compartido en el chat global",
      });
      onClose();
    } catch (error) {
      console.error("Error sending to global chat:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar al chat global",
        variant: "destructive",
      });
    }
  };

  const handleSendToFriend = async (friend: Friend) => {
    // For now, copy link and show toast - DMs can be implemented later
    const postUrl = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      playUiSound('copy');
      toast({
        title: "Enlace copiado",
        description: `Comparte este enlace con ${friend.username}`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar publicación</DialogTitle>
          <DialogDescription>
            Comparte esta publicación con tus amigos o copia el enlace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            <span>{copied ? "¡Copiado!" : "Copiar enlace"}</span>
          </Button>

          {/* Send to Global Chat */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleSendToGlobalChat}
          >
            <MessageCircle className="h-5 w-5" />
            <span>Enviar al chat global</span>
          </Button>

          {/* Search Friends */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Friends List */}
          <ScrollArea className="h-[200px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-muted-foreground text-sm">Cargando...</span>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-muted-foreground text-sm">
                  {friends.length === 0
                    ? "No tienes contactos aún"
                    : "No se encontraron contactos"}
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSendToFriend(friend)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar_url || undefined} />
                      <AvatarFallback>
                        {friend.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{friend.username}</span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
