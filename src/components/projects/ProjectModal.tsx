import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Users, 
  Calendar,
  ExternalLink,
  Github,
  Globe,
  Mail,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PROJECT_STATUS_CONFIG, type Project } from '@/types/project';
import { useProjectViews, useProjectComments } from '@/hooks/projects';
import { usePostReactions } from '@/hooks/posts/use-post-reactions';
import { ReactionType } from '@/types/database/social.types';

interface ProjectModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectModal({ project, open, onOpenChange }: ProjectModalProps) {
  const [newComment, setNewComment] = useState('');
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];
  
  // Hooks for views, reactions, and comments
  const { viewsCount, viewers } = useProjectViews(project.id);
  const { userReaction, onReaction } = usePostReactions(project.id);
  const { comments, submitComment, isSubmitting } = useProjectComments(project.id);

  // Count total reactions (from posts table if available)
  const reactionsCount = project.likes_count || 0;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      submitComment(newComment, {
        onSuccess: () => {
          setNewComment('');
        }
      });
    }
  };

  const handleReaction = () => {
    onReaction(project.id, 'love' as ReactionType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Banner */}
          {project.image_url && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Status and Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className={`${statusConfig.color} text-white px-3 py-1`}>
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Categoría: {project.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {/* Reaction Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReaction}
                className={`flex items-center gap-1 ${userReaction ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
              >
                <Heart size={16} fill={userReaction ? 'currentColor' : 'none'} />
                <span>{reactionsCount}</span>
              </Button>
              
              {/* Comments Count */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle size={16} />
                <span>{comments.length}</span>
              </div>
              
              {/* Views with hover card showing viewers */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <Eye size={16} />
                    <span>{viewsCount}</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Visto por</h4>
                    {viewers.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {viewers.map((viewer) => (
                          <div key={viewer.viewer_id} className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={viewer.avatar_url || undefined} />
                              <AvatarFallback>
                                {viewer.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {viewer.username || 'Usuario'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(viewer.viewed_at), {
                                  addSuffix: true,
                                  locale: es
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aún no hay visualizaciones
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {/* Author and Professor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Users size={14} />
                Autor del Proyecto
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={project.author?.avatar_url} />
                  <AvatarFallback>
                    {project.author?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.author?.username}</p>
                  <p className="text-xs text-muted-foreground">Desarrollador Principal</p>
                </div>
              </div>
            </div>

            {project.professor && (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Users size={14} />
                  Profesor a Cargo
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {project.professor.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.professor}</p>
                    <p className="text-xs text-muted-foreground">Supervisor Académico</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* University and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar size={14} />
                Fecha de Creación
              </p>
              <p className="font-medium">
                {new Date(project.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {project.duration && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Universidad</p>
                <p className="font-medium">Universidad Reformada</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
          </div>

          {/* Objectives */}
          {project.objectives && (
            <div>
              <h3 className="font-semibold mb-2">Objetivos</h3>
              <p className="text-muted-foreground leading-relaxed">{project.objectives}</p>
            </div>
          )}

          {/* Technologies */}
          <div>
            <h3 className="font-semibold mb-2">Tecnologías</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Team Members */}
          {project.team_members && project.team_members.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Miembros del Equipo</h3>
              <div className="flex flex-wrap gap-2">
                {project.team_members.map((member, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {member}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Team Button */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
              <Mail size={16} />
              Contactar Equipo
            </Button>
            {project.github_url && (
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Github size={16} />
                  Ver Código
                </a>
              </Button>
            )}
          </div>

          {/* Support Project Section */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Apoya este Proyecto</h3>
                <p className="text-sm text-muted-foreground">
                  Tu donación ayuda a financiar el desarrollo continuo y mejoras del proyecto.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30">
                $10
              </Button>
              <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30">
                $25
              </Button>
              <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30">
                $50
              </Button>
            </div>
          </div>

          {/* Demo and Documentation Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.demo_url && (
              <Button variant="outline" className="flex items-center gap-2 justify-center" asChild>
                <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  Demo en Vivo
                </a>
              </Button>
            )}
            {project.documentation_url && (
              <Button variant="outline" className="flex items-center gap-2 justify-center" asChild>
                <a href={project.documentation_url} target="_blank" rel="noopener noreferrer">
                  <Globe size={16} />
                  Documentación
                </a>
              </Button>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              Comentarios ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="min-h-[80px] resize-none"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="flex items-center gap-1"
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      <Send size={14} />
                      {isSubmitting ? 'Enviando...' : 'Comentar'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.profiles?.username || 'Usuario'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { 
                              addSuffix: true,
                              locale: es
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Sé el primero en comentar este proyecto
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}