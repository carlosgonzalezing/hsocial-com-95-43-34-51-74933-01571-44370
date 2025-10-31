
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfileImage } from "@/hooks/use-profile-image";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfileTable } from "@/types/database/profile.types";

export type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  education: string | null;
  career: string | null;
  semester: string | null;
  birth_date: string | null;
  relationship_status: string | null;
  followers_count: number;
  hearts_count: number;
  created_at: string;
  updated_at: string;
  last_seen?: string | null;
  status?: 'online' | 'offline' | 'away' | null;
};

export default function Profile() {
  const { userId: routeUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { handleImageUpload } = useProfileImage();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(false);

        console.log('Loading profile with ID from URL:', routeUserId);

        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        // Si no hay ID en la URL, usar el del usuario actual (para /profile sin parámetros)
        // Pero si hay ID, usarlo estrictamente
        const profileId = routeUserId || user?.id;
        
        if (!profileId) {
          setError(true);
          return;
        }

        // Ejecutar todas las consultas en paralelo para mejorar velocidad
        const [profileResult, followersResult, heartsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single(),
          supabase
            .from('friendships')
            .select('*', { count: 'exact', head: true })
            .eq('friend_id', profileId)
            .eq('status', 'accepted'),
          Promise.resolve({ count: 0, error: null })
        ]);

        const { data: profileData, error: profileError } = profileResult;
        const { count: followersCount, error: followersError } = followersResult;
        const { count: heartsCount, error: heartsError } = heartsResult;

        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          setError(true);
          return;
        }

        if (followersError) {
          console.error('Error fetching followers:', followersError);
        }

        if (heartsError) {
          console.error('Error fetching hearts:', heartsError);
        }

        const typedProfileData = profileData as unknown as ProfileTable['Row'];

        // Crear el objeto Profile con los datos obtenidos
        const newProfile: Profile = {
          id: typedProfileData.id,
          username: typedProfileData.username,
          bio: typedProfileData.bio,
          avatar_url: typedProfileData.avatar_url,
          cover_url: typedProfileData.cover_url,
          location: null,
          education: null,
          career: typedProfileData.career,
          semester: typedProfileData.semester,
          birth_date: typedProfileData.birth_date,
          relationship_status: typedProfileData.relationship_status,
          followers_count: followersCount || 0,
          hearts_count: heartsCount || 0,
          created_at: typedProfileData.created_at,
          updated_at: typedProfileData.updated_at
        };

        console.log('Profile loaded successfully:', newProfile);
        setProfile(newProfile);
      } catch (err) {
        console.error('Error in loadProfile:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [routeUserId]);

  const onImageUpload = async (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>): Promise<string> => {
    try {
      const url = await handleImageUpload(type, e);
      if (url && profile) {
        const updatedProfile = {
          ...profile,
          [type === 'avatar' ? 'avatar_url' : 'cover_url']: url
        };
        setProfile(updatedProfile);
        toast({
          title: "Imagen actualizada",
          description: `Tu foto de ${type === 'avatar' ? 'perfil' : 'portada'} ha sido actualizada exitosamente`,
        });
      }
      return url;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la imagen",
      });
      return '';
    }
  };

  return (
    <ProfileLayout isLoading={loading} error={error}>
      {profile && (
        <>
          <ProfileHeader
            profile={profile}
            currentUserId={currentUserId}
            onImageUpload={onImageUpload}
            onProfileUpdate={handleProfileUpdate}
          />
          <div className="space-y-4 px-2 sm:px-4 py-4">
            <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-3' : ''} gap-4`}>
              <div className={`${!isMobile ? 'md:col-span-1' : ''}`}>
                <ProfileInfo profile={profile} />
              </div>
              <div className={`${!isMobile ? 'md:col-span-2' : ''}`}>
                <ProfileContent profileId={profile.id} />
              </div>
            </div>
          </div>
        </>
      )}
    </ProfileLayout>
  );
}
