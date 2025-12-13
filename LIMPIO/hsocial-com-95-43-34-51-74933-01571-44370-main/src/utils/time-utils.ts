export function getTimeAgo(lastSeen: string | null): string {
  if (!lastSeen) return 'hace mucho tiempo';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'ahora';
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return 'hace mucho tiempo';
}

export function isUserOnline(status: string | null, lastSeen: string | null): boolean {
  if (status === 'online') return true;
  
  if (!lastSeen) return false;
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
  
  return diffInMinutes < 5; // Consider online if last seen within 5 minutes
}