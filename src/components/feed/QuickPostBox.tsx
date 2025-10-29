import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Video, Smile } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostCreatorModal } from "@/components/PostCreatorModal";

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
      <Card className="p-4 mb-4 hidden md:block">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <button
            onClick={() => setShowPostModal(true)}
            className="flex-1 px-4 py-2 text-left rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
          >
            ¿Qué estás pensando, {profile.username}?
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => setShowPostModal(true)}
          >
            <Image className="h-5 w-5 text-green-600" />
            <span className="hidden sm:inline">Foto</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => setShowPostModal(true)}
          >
            <Video className="h-5 w-5 text-red-600" />
            <span className="hidden sm:inline">Video</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => setShowPostModal(true)}
          >
            <Smile className="h-5 w-5 text-yellow-600" />
            <span className="hidden sm:inline">Estado</span>
          </Button>
        </div>
      </Card>

      <PostCreatorModal
        open={showPostModal}
        onOpenChange={setShowPostModal}
        focusOnOpen
      />
    </>
  );
}
