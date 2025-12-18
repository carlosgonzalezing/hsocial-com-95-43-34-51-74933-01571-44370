import React from 'react';
import { Eye, Heart, MessageCircle, Users, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PROJECT_STATUS_CONFIG, type Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];
  
  const displayTechs = project.technologies.slice(0, 4);
  const remainingTechsCount = project.technologies.length - 4;

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-card border-border/50"
      onClick={onClick}
    >
      {/* Horizontal Layout: Image Left, Content Right */}
      <div className="flex flex-col md:flex-row">
        {/* Project Image - Left Side */}
        <div className="relative md:w-2/5 aspect-[16/9] md:aspect-auto bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-20">📁</div>
            </div>
          )}
          
          {/* Gradient overlay for better badge visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
          
          {/* Status Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <Badge 
              className={`${statusConfig.color} text-white font-bold px-3 py-1.5 text-xs uppercase tracking-wide shadow-lg backdrop-blur-sm`}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Collaboration Badge - Top Right */}
          {project.seeking_collaborators && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-emerald-500 text-white font-bold px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm">
                🤝 Busca colaboradores
              </Badge>
            </div>
          )}

          {/* Views count overlay - Bottom Right */}
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 text-white text-xs font-medium">
              <Eye size={12} className="opacity-80" />
              <span>{project.views_count.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Content - Right Side */}
        <div className="flex-1 p-6 space-y-4">
          {/* Title */}
          <h3 className="font-bold text-2xl text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {project.short_description || project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2">
            {displayTechs.map((tech, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all px-3 py-1 text-xs font-semibold rounded-full"
              >
                {tech}
              </Badge>
            ))}
            {remainingTechsCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-muted/50 text-muted-foreground hover:bg-muted transition-all px-3 py-1 text-xs font-semibold rounded-full"
              >
                +{remainingTechsCount}
              </Badge>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Author and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-primary/10 shadow-md transition-all group-hover:ring-primary/30">
                <AvatarImage src={project.author?.avatar_url} />
                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                  {project.author?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {project.author?.username || 'Usuario'}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={11} className="opacity-60" />
                  <span>
                    {formatDistanceToNow(new Date(project.created_at), { 
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              {project.team_members && project.team_members.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Users size={15} className="opacity-70" />
                  <span>{project.team_members.length + 1}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                <Heart size={15} className="opacity-70" />
                <span>{project.likes_count}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer">
                <MessageCircle size={15} className="opacity-70" />
                <span>{project.comments_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}