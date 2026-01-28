
import { Button } from "@/components/ui/button";

interface FriendTabSelectorProps {
  activeTab: "suggestions" | "friends";
  setActiveTab: (tab: "suggestions" | "friends") => void;
}

export function FriendTabSelector({ activeTab, setActiveTab }: FriendTabSelectorProps) {
  return (
    <div className="flex items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
      <Button 
        variant={activeTab === "suggestions" ? "default" : "ghost"} 
        onClick={() => setActiveTab("suggestions")}
        className="flex-1 rounded-full"
      >
        Sugerencias
      </Button>
      <Button 
        variant={activeTab === "friends" ? "default" : "ghost"} 
        onClick={() => setActiveTab("friends")}
        className="flex-1 rounded-full"
      >
        Tus amigos
      </Button>
    </div>
  );
}
