import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    friends: number;
    comments: number;
    reactions: number;
  };
}

export function NotificationTabs({ activeTab, onTabChange, counts }: NotificationTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-4 h-9">
        <TabsTrigger value="all" className="text-xs">
          Todas
          {counts.all > 0 && (
            <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {counts.all}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="friends" className="text-xs">
          Amigos
          {counts.friends > 0 && (
            <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {counts.friends}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="comments" className="text-xs">
          Comentarios
          {counts.comments > 0 && (
            <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {counts.comments}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="reactions" className="text-xs">
          Reacciones
          {counts.reactions > 0 && (
            <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {counts.reactions}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
