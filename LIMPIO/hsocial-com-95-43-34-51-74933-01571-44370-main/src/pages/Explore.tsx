import { useState } from "react";
import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Lightbulb, FolderOpen, Users, Trophy } from "lucide-react";
import { IdeaGrid } from "@/components/explore/IdeaGrid";
import { ProjectGrid } from "@/components/explore/ProjectGrid";
import { UserGrid } from "@/components/explore/UserGrid";
import { GroupGrid } from "@/components/explore/GroupGrid";
import { LeaderboardGrid } from "@/components/explore/LeaderboardGrid";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ideas");

  return (
    <Layout hideLeftSidebar hideRightSidebar>
      <div className="min-h-screen bg-background pb-24">
        {/* Sticky search bar */}
        <div className="sticky top-14 z-40 bg-background border-b border-border px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar ideas, proyectos, usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-lg bg-muted border-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Content tabs - 4 tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-around h-12 rounded-none border-b border-border bg-background sticky top-[118px] z-30">
            <TabsTrigger 
              value="ideas" 
              className="flex-1 gap-2 text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <Lightbulb className="h-4 w-4" />
              IDEAS
            </TabsTrigger>
            <TabsTrigger 
              value="proyectos" 
              className="flex-1 gap-2 text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <FolderOpen className="h-4 w-4" />
              PROYECTOS
            </TabsTrigger>
            <TabsTrigger 
              value="grupos" 
              className="flex-1 gap-2 text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <Users className="h-4 w-4" />
              GRUPOS
            </TabsTrigger>
            <TabsTrigger 
              value="lideres" 
              className="flex-1 gap-2 text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <Trophy className="h-4 w-4" />
              LÍDERES
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ideas" className="p-4 mt-0">
            <IdeaGrid searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="proyectos" className="p-4 mt-0">
            <ProjectGrid searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="grupos" className="p-4 mt-0">
            <GroupGrid searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="lideres" className="p-4 mt-0">
            <LeaderboardGrid searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
