
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Plus, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface AccountSwitcherProps {
  currentUserId: string | null;
}

export function AccountSwitcher({ currentUserId }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!currentUserId) return;

      // Get current user profile
      const { data: currentProfileData, error: currentProfileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', currentUserId)
        .single();

      if (currentProfileError) {
        console.error("Error fetching current profile:", currentProfileError);
        return;
      }

      if (currentProfileData) {
        setCurrentProfile(currentProfileData);
        // We'll just show a single profile for now
        setProfiles([currentProfileData]);
      }
    };

    fetchProfiles();
  }, [currentUserId]);

  const handleCreateProfile = () => {
    setOpen(false);
    navigate("/auth?tab=register");
  };

  const handleSelectProfile = (profile: Profile) => {
    // For demonstration purposes only updates UI
    // In a real implementation, this would switch between accounts
    setCurrentProfile(profile);
    toast({
      title: "Perfil seleccionado",
      description: `Has cambiado al perfil de ${profile.username || "Usuario sin nombre"}`
    });
    setOpen(false);
  };

  if (!currentProfile) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between h-auto py-3 px-4"
        >
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={currentProfile.avatar_url || undefined} alt={currentProfile.username || "Usuario"} />
              <AvatarFallback>{(currentProfile.username?.charAt(0) || "U").toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-base font-medium">{currentProfile.username || "Usuario sin nombre"}</span>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="px-0 max-h-[80vh]">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Tus páginas y perfiles</h2>
          </div>
          
          <div className="overflow-y-auto flex-1 py-2">
            {/* Profiles List */}
            <div className="space-y-1">
              {profiles.map(profile => (
                <Button
                  key={profile.id}
                  variant="ghost"
                  className="w-full justify-between px-4 py-3 h-auto"
                  onClick={() => handleSelectProfile(profile)}
                >
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || "Usuario"} />
                      <AvatarFallback>{(profile.username?.charAt(0) || "U").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{profile.username || "Usuario sin nombre"}</span>
                  </div>
                  {profile.id === currentProfile.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </Button>
              ))}
            </div>
            
            {/* Create Profile Button */}
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 h-auto mt-2"
              onClick={handleCreateProfile}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 mr-3 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </div>
                <span>Crear perfil</span>
              </div>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
