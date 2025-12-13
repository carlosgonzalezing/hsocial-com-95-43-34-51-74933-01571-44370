import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PersonalizedFeedToggleProps {
  isPersonalized: boolean;
  onToggle: (value: boolean) => void;
  stats?: {
    rawPostsCount: number;
    personalizedPostsCount: number;
  };
}

export function PersonalizedFeedToggle({ 
  isPersonalized, 
  onToggle, 
  stats 
}: PersonalizedFeedToggleProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-card/50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isPersonalized ? (
            <Sparkles className="h-4 w-4 text-primary" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <Label htmlFor="personalized-toggle" className="font-medium">
            {isPersonalized ? 'Feed Personalizado' : 'Feed Cronológico'}
          </Label>
        </div>
        
        {stats && (
          <Badge variant="secondary" className="text-xs">
            {isPersonalized ? stats.personalizedPostsCount : stats.rawPostsCount} posts
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="personalized-toggle"
          checked={isPersonalized}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );
}

export function FeedModeExplanation({ isPersonalized }: { isPersonalized: boolean }) {
  if (isPersonalized) {
    return (
      <div className="px-4 py-2 bg-primary/5 border-b">
        <div className="flex items-start space-x-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary">Feed Inteligente Activado</p>
            <p className="text-muted-foreground text-xs mt-1">
              Feed Inteligente activado - Contenido personalizado optimizado para ti
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 bg-muted/30 border-b">
      <div className="flex items-start space-x-2">
        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Feed Cronológico</p>
          <p className="text-muted-foreground text-xs mt-1">
            Posts ordenados por fecha de publicación, del más reciente al más antiguo
          </p>
        </div>
      </div>
    </div>
  );
}