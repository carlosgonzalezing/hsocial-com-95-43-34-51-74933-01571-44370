
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function FriendRequestsHeader() {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-10 bg-background border-b p-2">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Amigos</h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
