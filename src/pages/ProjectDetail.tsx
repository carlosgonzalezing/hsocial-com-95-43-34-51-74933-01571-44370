import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Github, 
  Globe, 
  FileText,
  Users,
  Calendar,
  MapPin
} from "lucide-react";
import { useProjectViews, useProjectComments } from "@/hooks/projects";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectDetail() {
  const { postId } = useParams();
  const [commentContent, setCommentContent] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .eq('post_type', 'project')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!postId
  });

  const { viewsCount } = useProjectViews(postId || '');
  const { comments, submitComment, isSubmitting } = useProjectComments(postId || '');

  const handleSubmitComment = () => {
    if (commentContent.trim()) {
      submitComment(commentContent);
      setCommentContent("");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
        </div>
      </Layout>
    );
  }

  const projectData = (project.idea && typeof project.idea === 'object' && !Array.isArray(project.idea) ? project.idea : {}) as {
    title?: string;
    description?: string;
    project_phase?: string;
    needed_roles?: Array<{
      title: string;
      description: string;
      skills_desired?: string[];
    }>;
    contact_link?: string;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24">
        {/* Hero Image */}
        {project.media_url && (
          <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <img 
              src={project.media_url} 
              alt={projectData.title || "Proyecto"} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Project Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{projectData.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Hace 5 horas</span>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">
              {projectData.project_phase || "En Desarrollo"}
            </Badge>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={project.profiles?.avatar_url || ''} />
              <AvatarFallback>{project.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{project.profiles?.username}</p>
              <p className="text-sm text-muted-foreground">Creador del proyecto</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{viewsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>245</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">Descripción</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {projectData.description}
          </p>
        </Card>

        {/* Technologies */}
        {projectData.needed_roles && projectData.needed_roles.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Roles Necesarios
            </h2>
            <div className="space-y-3">
              {projectData.needed_roles.map((role: any, index: number) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  {role.skills_desired && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {role.skills_desired.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">Enlaces</h2>
          <div className="space-y-2">
            {projectData.contact_link && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={projectData.contact_link} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Contactar
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Buscando Colaboradores
            </Button>
          </div>
        </Card>

        <Separator />

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comentarios ({comments.length})</h2>
          
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Escribe un comentario..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleSubmitComment}
              disabled={!commentContent.trim() || isSubmitting}
            >
              {isSubmitting ? "Publicando..." : "Publicar comentario"}
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || ''} />
                    <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{comment.profiles?.username}</p>
                    <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
