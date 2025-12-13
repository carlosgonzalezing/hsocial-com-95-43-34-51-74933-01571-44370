import { Trophy, Users, Calendar, ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Project {
  id: string;
  title: string;
  description: string;
  impact: string;
  collaborators: number;
  completion_date: string;
  category: string;
  featured_image?: string;
  link?: string;
  technologies?: string[];
  role: string;
  status: 'completed' | 'ongoing' | 'paused';
}

interface ProjectShowcaseProps {
  projects: Project[];
}

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            Proyectos y Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Aún no has compartido ningún proyecto. ¡Muestra lo que has creado!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Proyectos y Resultados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border border-border rounded-lg p-4 bg-muted/20">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{project.role}</p>
              </div>
              {project.link && (
                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>

            {/* Impact */}
            <div className="flex items-start mb-3">
              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
              <div>
                <span className="text-sm font-medium text-foreground">Impacto:</span>
                <p className="text-sm text-muted-foreground">{project.impact}</p>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>{project.collaborators} colaboradores</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(project.completion_date).toLocaleDateString()}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {project.category}
              </Badge>
            </div>

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}