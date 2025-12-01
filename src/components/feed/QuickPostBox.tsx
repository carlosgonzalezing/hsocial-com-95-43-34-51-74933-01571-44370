import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Image, Video, FileText, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimplePostModal } from "@/components/SimplePostModal";

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

  const quickActions = [
    { icon: Image, label: "Foto", color: "text-blue-500" },
    { icon: Video, label: "Video", color: "text-green-500" },
    { icon: FileText, label: "Artículo", color: "text-orange-500" },
    { icon: Briefcase, label: "Proyecto", color: "text-purple-500" },
  ];

  return (
    <>
      <Card className="p-4 mb-2 border-border/50">
        {/* LinkedIn-style post input */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
              {profile.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <button
            onClick={() => setShowPostModal(true)}
            className="flex-1 px-4 py-3 text-left rounded-full border border-border hover:bg-muted/50 transition-colors text-muted-foreground text-sm"
          >
            Iniciar publicación
          </button>
        </div>

        {/* Quick action icons */}
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-border/50">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <SimplePostModal open={showPostModal} onOpenChange={setShowPostModal} />
    </>
  );
}
