import { useState } from "react";
import { ProfileCover } from "./ProfileCover";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileActions } from "./ProfileActions";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
// Removed ChatDialog - using global chat only
import { FullScreenImage } from "@/components/profile/FullScreenImage";
import { useProfileHeart } from "@/hooks/use-profile-heart";
import { useIsMobile } from "@/hooks/use-mobile";
// Removed engagement components for performance
import { trackPremiumProfileView } from "@/lib/api/profile-viewers";
import { useEffect } from "react";
import type { Profile } from "@/pages/Profile";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/use-premium";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { NameEditIndicator } from "./NameEditIndicator";

interface ProfileHeaderProps {
  profile: Profile;
  currentUserId: string | null;
  onImageUpload: (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => Promise<string>;
  onProfileUpdate?: (profile: Profile) => void;
}

export function ProfileHeader({ profile, currentUserId, onImageUpload, onProfileUpdate }: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<{url: string, type: 'avatar' | 'cover'} | null>(null);
  const { hasGivenHeart, heartsCount, isLoading: heartLoading, toggleHeart } = useProfileHeart(profile.id);
  const isMobile = useIsMobile();
  const { isPremium } = usePremium();
  const [currentExperience, setCurrentExperience] = useState<{ title: string; company_name: string } | null>(null);

  const isOwner = currentUserId === profile.id;

  // Track profile views for non-owners
  useEffect(() => {
    if (!isOwner && profile.id) {
      // Track both regular and premium profile views
      // Profile view tracking removed for performance
      trackPremiumProfileView(profile.id);
    }
  }, [profile.id, isOwner]);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    onProfileUpdate?.(updatedProfile);
  };


  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onImageUpload('avatar', e);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onImageUpload('cover', e);
  };

  const openFullScreenAvatar = () => {
    if (profile.avatar_url) {
      setFullscreenImage({ url: profile.avatar_url, type: 'avatar' });
    }
  };

  const openFullScreenCover = () => {
    if (profile.cover_url) {
      setFullscreenImage({ url: profile.cover_url, type: 'cover' });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCurrentExperience = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('profile_experiences')
          .select('title, company_name, is_current, end_date')
          .eq('profile_id', profile.id)
          .order('is_current', { ascending: false })
          .order('end_date', { ascending: false })
          .limit(1);

        if (error) {
          const message = String((error as any)?.message || '');
          if (message.toLowerCase().includes('does not exist')) {
            return;
          }
          return;
        }

        const row = Array.isArray(data) ? data[0] : null;
        if (row && isMounted) {
          setCurrentExperience({
            title: String((row as any).title || ''),
            company_name: String((row as any).company_name || '')
          });
        }
      } catch {
        // ignore
      }
    };

    if (profile?.id) {
      loadCurrentExperience();
    }

    return () => {
      isMounted = false;
    };
  }, [profile.id]);

  const headline = [currentExperience?.title || profile.academic_role, currentExperience?.company_name || profile.career]
    .filter(Boolean)
    .join(" • ");

  return (
    <>
      <ProfileCover 
        coverUrl={profile.cover_url}
        isOwner={isOwner}
        onUpload={handleCoverUpload}
        onOpenFullscreen={openFullScreenCover}
      />

      <div className={`relative px-2 md:px-6 profile-header`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-end'} gap-4`}>
          <div className="-mt-[64px]">
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              username={profile.username}
              isOwner={isOwner}
              onUpload={handleAvatarUpload}
              onOpenFullscreen={openFullScreenAvatar}
            />
          </div>
          
          <div className="flex-1 mt-2 md:mt-0">
            <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center justify-between'}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold">
                    {profile.username || "Usuario sin nombre"}
                  </h1>

                  {/* Indicador de nombre editado manualmente */}
                  <NameEditIndicator 
                    isManuallyEdited={(profile as any).name_manually_edited}
                    googleName={(profile as any).google_name}
                  />

                  {isPremium && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5" />
                      Premium Pro
                    </Badge>
                  )}
                  
                </div>

                {(headline || profile.institution_name) && (
                  <div className="mt-1 space-y-0.5">
                    {headline && (
                      <p className="text-sm font-medium text-foreground/90">
                        {headline}
                      </p>
                    )}
                    {profile.institution_name && (
                      <p className="text-sm text-muted-foreground">
                        {profile.institution_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <ProfileActions
                isOwner={isOwner}
                profileId={profile.id}
                username={profile.username || undefined}
                avatarUrl={profile.avatar_url}
                hasGivenHeart={hasGivenHeart}
                heartLoading={heartLoading}
                currentUserId={currentUserId}
                onEditClick={() => setIsEditDialogOpen(true)}
                onMessageClick={() => {}}
                onToggleHeart={toggleHeart}
              />
            </div>
          </div>
        </div>
      </div>

      <ProfileEditDialog
        profile={profile}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleProfileUpdate}
      />

      {/* Chat removed - using global chat only */}

      {fullscreenImage && (
        <FullScreenImage
          isOpen={!!fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          imageUrl={fullscreenImage.url}
          altText={fullscreenImage.type === 'avatar' ? `Foto de perfil de ${profile.username}` : 'Foto de portada'}
        />
      )}
    </>
  );
}
