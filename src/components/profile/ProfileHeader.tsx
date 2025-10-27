
import { useState } from "react";
import { ProfileCover } from "./ProfileCover";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileStats } from "./ProfileStats";
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


interface ProfileHeaderProps {
  profile: Profile;
  currentUserId: string | null;
  onImageUpload: (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => Promise<string>;
  onProfileUpdate?: (profile: Profile) => void;
}

export function ProfileHeader({ profile, currentUserId, onImageUpload, onProfileUpdate }: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<{url: string, type: 'avatar' | 'cover'} | null>(null);
  const { hasGivenHeart, heartsCount, isLoading: heartLoading, toggleHeart } = useProfileHeart(profile.id);
  const isMobile = useIsMobile();

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

  const handleMessageClick = () => {
    setIsChatOpen(true);
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

  return (
    <>
      <ProfileCover 
        coverUrl={profile.cover_url}
        isOwner={isOwner}
        onUpload={handleCoverUpload}
        onOpenFullscreen={openFullScreenCover}
      />

      <div className={`relative px-2 md:px-6 -mt-[64px] profile-header`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-end'} gap-4`}>
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            username={profile.username}
            isOwner={isOwner}
            onUpload={handleAvatarUpload}
            onOpenFullscreen={openFullScreenAvatar}
          />
          
          <div className="flex-1 mt-2 md:mt-0">
            <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center justify-between'}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold">
                    {profile.username || "Usuario sin nombre"}
                  </h1>
                  
                </div>
                <ProfileStats 
                  followersCount={profile.followers_count}
                  postsCount={42}
                  followingCount={324}
                />
              </div>
              
              <ProfileActions
                isOwner={isOwner}
                profileId={profile.id}
                hasGivenHeart={hasGivenHeart}
                heartLoading={heartLoading}
                currentUserId={currentUserId}
                onEditClick={() => setIsEditDialogOpen(true)}
                onMessageClick={handleMessageClick}
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
