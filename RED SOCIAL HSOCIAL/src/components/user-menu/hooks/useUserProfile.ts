
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        setUserId(user.id);
        
        // Fetch profile data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('username, avatar_url, birth_date')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          setUsername(user.email?.split('@')[0] || 'Usuario');
          setAvatarUrl(null);
          setIsLoading(false);
          return;
        }
          
        if (profileData) {
          setUsername(profileData.username || 'Usuario');
          setAvatarUrl(profileData.avatar_url);
        } else {
          setUsername(user.email?.split('@')[0] || 'Usuario');
          setAvatarUrl(null);
        }
      }
      setIsLoading(false);
    };
    
    fetchUserProfile();
  }, []);

  return { username, avatarUrl, userId, isLoading };
}
