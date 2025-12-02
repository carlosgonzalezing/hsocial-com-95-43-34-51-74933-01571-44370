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
      className={`mb-0 overflow-hidden w-full rounded-none border-x-0 border-t border-b border-border/50 bg-card shadow-none ${isHidden ? 'opacity-70' : ''}`}
    >
      {children}
    </Card>
  );
}
