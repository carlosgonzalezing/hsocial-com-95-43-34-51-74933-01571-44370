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
      className={`overflow-hidden w-full rounded-xl border border-border/40 bg-card shadow-sm dark:shadow-none dark:border-white/10 ${isHidden ? 'opacity-70' : ''}`}
    >
      {children}
    </Card>
  );
}
