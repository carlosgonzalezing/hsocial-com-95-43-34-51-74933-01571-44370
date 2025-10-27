
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  username: string | null;
  isOwner: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string>;
  onOpenFullscreen: () => void;
}

export function ProfileAvatar({ 
  avatarUrl, 
  username, 
  isOwner, 
  onUpload, 
  onOpenFullscreen 
}: ProfileAvatarProps) {
  return (
    <div className="relative">
      <Avatar 
        className="h-32 w-32 border-4 border-background cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => avatarUrl && onOpenFullscreen()}
      >
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>
          {username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      {isOwner && (
        <div className="absolute right-0 bottom-0">
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
          />
          <label htmlFor="avatar-upload">
            <Button
              size="icon"
              className="cursor-pointer h-8 w-8 rounded-full bg-[#0095f6] hover:bg-[#0095f6]/90"
              asChild
            >
              <span>
                <Plus className="h-5 w-5 text-white" />
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
