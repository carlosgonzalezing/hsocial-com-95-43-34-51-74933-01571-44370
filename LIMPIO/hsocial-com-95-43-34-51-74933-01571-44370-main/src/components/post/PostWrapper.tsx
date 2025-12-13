import { Card } from "@/components/ui/card";

interface PostWrapperProps {
  children: React.ReactNode;
  isHidden?: boolean;
  isIdeaPost?: boolean;
  isPinned?: boolean;
}

export function PostWrapper({ 
  children,
  isHidden = false,
}: PostWrapperProps) {
  return (
    <Card 
      className={`overflow-hidden w-full rounded-lg border border-border/30 bg-card shadow-sm ${isHidden ? 'opacity-70' : ''}`}
    >
      {children}
    </Card>
  );
}
