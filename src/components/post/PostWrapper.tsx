
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Pin } from "lucide-react";

interface PostWrapperProps {
  children: React.ReactNode;
  isHidden?: boolean;
  isIdeaPost?: boolean;
  isPinned?: boolean;
}

export function PostWrapper({ 
  children,
  isHidden = false,
  isIdeaPost = false,
  isPinned = false
}: PostWrapperProps) {
  return (
    <div className="relative">
      {isPinned && (
        <div className="absolute -top-2 left-4 z-10">
          <Badge className="bg-primary text-white px-2 py-0.5 text-xs flex items-center gap-1">
            <Pin className="h-3 w-3" />
            Fijado
          </Badge>
        </div>
      )}
      
      {isIdeaPost && (
        <div className="absolute -top-2 left-4 z-10">
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 text-xs flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Idea
          </Badge>
        </div>
      )}
      
      <Card 
        className={`mb-6 overflow-hidden mx-0 md:mx-0 rounded-none md:rounded-xl shadow-none md:shadow-sm border-border bg-card ${isHidden ? 'opacity-70' : ''} ${
          isIdeaPost 
            ? 'border-[#0095f6]/30' 
            : ''
        }`}
      >
        {children}
      </Card>
    </div>
  );
}
