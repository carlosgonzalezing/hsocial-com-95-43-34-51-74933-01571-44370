
import { Loader2 } from "lucide-react";

export function FriendRequestsLoader() {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </main>
    </div>
  );
}
