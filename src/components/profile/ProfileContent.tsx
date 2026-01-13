
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Feed } from "@/components/feed/Feed";
import { Grid, Lightbulb, FolderOpen, FolderKanban, Briefcase } from "lucide-react";
import { PinnedProjectsSection } from "./PinnedProjectsSection";

interface ProfileContentProps {
  profileId: string;
  isOwner?: boolean;
}

export function ProfileContent({ profileId, isOwner = false }: ProfileContentProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
        <TabsTrigger 
          value="posts" 
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <Grid className="h-4 w-4" />
          <span className="hidden sm:inline">Publicaciones</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ideas"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="hidden sm:inline">Ideas</span>
        </TabsTrigger>
        <TabsTrigger 
          value="files"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Archivos</span>
        </TabsTrigger>

        <TabsTrigger 
          value="projects"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <FolderKanban className="h-4 w-4" />
          <span className="hidden sm:inline">Proyectos</span>
        </TabsTrigger>

        <TabsTrigger 
          value="services"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Servicios</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-0">
        <Feed userId={profileId} />
      </TabsContent>
      
      <TabsContent value="ideas" className="mt-0">
        <Feed userId={profileId} />
      </TabsContent>
      
      <TabsContent value="files" className="mt-0">
        <Card className="p-8">
          <p className="text-center text-muted-foreground">No hay archivos disponibles</p>
        </Card>
      </TabsContent>

      <TabsContent value="projects" className="mt-0">
        <PinnedProjectsSection profileId={profileId} isOwner={isOwner} />
      </TabsContent>

      <TabsContent value="services" className="mt-0">
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            Próximamente podrás publicar servicios y recibir solicitudes.
          </p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

