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
      className={`mb-2 overflow-hidden mx-0 md:mx-0 rounded-none md:rounded-lg border-border/50 bg-card ${isHidden ? 'opacity-70' : ''}`}
    >
      {children}
    </Card>
  );
}
