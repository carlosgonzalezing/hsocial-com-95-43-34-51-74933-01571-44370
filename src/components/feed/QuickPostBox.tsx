import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Lightbulb, Calendar } from "lucide-react";
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
      <Card className="p-4 mb-4">
        {/* Icon buttons row - LinkedIn/Facebook style */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => setShowPostModal(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">Proyectos</span>
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">Equipos</span>
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">Ideas</span>
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">Eventos</span>
          </button>
        </div>

        {/* Post input row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <button
            onClick={() => setShowPostModal(true)}
            className="flex-1 px-4 py-3 text-left rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
          >
            ¿Qué idea tienes en mente?
          </button>
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
