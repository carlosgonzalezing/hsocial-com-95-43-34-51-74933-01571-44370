import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Image, Video, PlusSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ModalPublicacionWeb from "@/components/ModalPublicacionWeb";

export function QuickPostBox() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ avatar_url: string | null; username: string } | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (!user || !profile) return null;

  return (
    <>
      <div className="mx-auto w-full max-w-[680px] px-2 lg:px-0">
        <Card className="mb-3 rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
              {profile.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <button
            onClick={() => setShowPostModal(true)}
            className="flex-1 px-4 py-2.5 text-left rounded-full border border-border hover:bg-muted/50 transition-colors text-muted-foreground text-sm"
          >
            ¿Qué idea tienes en mente, {profile.username}?
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPostModal(true)}
              className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center"
              aria-label="Video"
              title="Video"
            >
              <Video className="h-5 w-5 text-red-500" />
            </button>
            <button
              onClick={() => setShowPostModal(true)}
              className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center"
              aria-label="Foto"
              title="Foto"
            >
              <Image className="h-5 w-5 text-green-500" />
            </button>
            <button
              onClick={() => setShowPostModal(true)}
              className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center"
              aria-label="Más"
              title="Más"
            >
              <PlusSquare className="h-5 w-5 text-blue-500" />
            </button>
          </div>
          </div>
        </Card>
      </div>

      <ModalPublicacionWeb
        isVisible={showPostModal}
        onClose={() => setShowPostModal(false)}
        initialPostType={null}
        userAvatar={profile.avatar_url || undefined}
      />
    </>
  );
}
