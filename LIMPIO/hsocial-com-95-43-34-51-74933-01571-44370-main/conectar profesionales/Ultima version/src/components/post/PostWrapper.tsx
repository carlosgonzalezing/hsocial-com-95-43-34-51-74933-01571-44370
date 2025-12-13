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
<<<<<<< HEAD:LIMPIO/hsocial-com-95-43-34-51-74933-01571-44370-main/conectar profesionales/Ultima version/src/components/post/PostWrapper.tsx
      className={`mb-4 overflow-hidden w-full rounded-lg border border-border/60 bg-card shadow-sm ${isHidden ? 'opacity-70' : ''}`}
=======
      className={`overflow-hidden w-full rounded-lg border border-border/30 bg-card shadow-sm ${isHidden ? 'opacity-70' : ''}`}
>>>>>>> 11ad84430e20e6bfa46b4992a1a011c0414bbd5a:src/components/post/PostWrapper.tsx
    >
      {children}
    </Card>
  );
}
