
interface ProfileStatsProps {
  followersCount: number;
  postsCount?: number;
  followingCount?: number;
}

export function ProfileStats({ 
  followersCount,
  postsCount = 0,
  followingCount = 0
}: ProfileStatsProps) {
  return (
    <div className="flex items-center gap-6 mt-4">
      <div className="text-center">
        <p className="font-bold text-foreground">{postsCount}</p>
        <p className="text-sm text-muted-foreground">Posts</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-foreground">{followersCount}</p>
        <p className="text-sm text-muted-foreground">Seguidores</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-foreground">{followingCount}</p>
        <p className="text-sm text-muted-foreground">Seguidos</p>
      </div>
    </div>
  );
}
