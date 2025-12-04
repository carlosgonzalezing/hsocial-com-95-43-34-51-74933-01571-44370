
import { Card } from "../ui/card";

export function FeedSkeleton() {
  return (
    <div className="space-y-3">
      <Card className="p-4 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
      <Card className="p-4 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </Card>
    </div>
  );
}
