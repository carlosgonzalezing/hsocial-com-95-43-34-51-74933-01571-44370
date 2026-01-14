import { useState, useEffect } from "react";
import { Briefcase, ExternalLink, Users, Target, Calendar, MessageCircle, Pin, PinOff, ChevronDown, ChevronUp, X, ZoomIn } from "lucide-react";
import type { Idea } from "@/types/post";
import { MentionsText } from "./MentionsText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { usePremium } from "@/hooks/use-premium";
import { usePinnedProjects } from "@/hooks/use-pinned-projects";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectContentProps {
  idea: Idea;
  content?: string;
  postId: string;
  postOwnerId: string;
  mediaUrls?: string[];
  projectStatus?: 'idea' | 'in_progress' | 'completed' | null;
}

export function ProjectContent({ idea, content, postId, postOwnerId, mediaUrls = [], projectStatus }: ProjectContentProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { isPremium } = usePremium();
  const { pinnedProjects } = usePinnedProjects(currentUserId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const isOwner = currentUserId === postOwnerId;
  const isPinned = pinnedProjects.some(p => p.id === postId);

  const handlePinProject = async () => {
    if (!isPremium) {
      toast({
        variant: "destructive",
        title: "Solo Premium",
        description: "Solo usuarios Premium pueden fijar proyectos.",
      });
      return;
    }

    try {
      const action = isPinned ? 'unpin' : 'pin';
      const { data, error } = await (supabase as any).rpc(`${action}_project`, {
        user_id_param: currentUserId,
        project_id_param: postId,
      });

      if (error) throw error;

      toast({
        title: isPinned ? "Proyecto des fijado" : "Proyecto fijado",
        description: isPinned ? "El proyecto ya no está en tus destacados" : "El proyecto ahora está en tus destacados",
      });

      // Refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["pinned-projects", currentUserId] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'idea': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const fullText = idea.description || content || '';
  const shouldTruncate = fullText.length > 200;
  const truncatedText = shouldTruncate ? fullText.substring(0, 200) + '...' : fullText;
  const displayText = showFullDescription ? fullText : truncatedText;

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <>
      <div className="px-0 md:px-4 pb-2">
        {/* Header del proyecto */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary" className="text-xs font-medium">Proyecto</Badge>
              {projectStatus && (
                <Badge variant="outline" className={getStatusColor(projectStatus)}>
                  {projectStatus === 'completed' ? 'Terminado' : 
                   projectStatus === 'in_progress' ? 'En desarrollo' : 'Idea'}
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{idea.title}</h3>
            
            {idea.participants && idea.participants.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Users className="h-4 w-4" />
                <span>{idea.participants.length} participante{idea.participants.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Botón de pin para usuarios Premium */}
          {isOwner && isPremium && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePinProject}
              className="ml-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isPinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Imagen del proyecto si existe - Diseño mejorado con clic para ampliar */}
        {mediaUrls && mediaUrls.length > 0 && (
          <div className="mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group cursor-pointer"
                 onClick={() => openImageModal(0)}>
              <img
                src={mediaUrls[0]}
                alt={idea.title}
                className="w-full h-56 sm:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Overlay con información y botón de zoom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">Vista previa del proyecto</p>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <ZoomIn className="h-4 w-4 text-white" />
                      <span className="text-white text-xs font-medium">Ampliar</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Indicador de múltiples imágenes */}
              {mediaUrls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-white text-xs font-medium">1/{mediaUrls.length}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Descripción del proyecto con "Ver más" */}
        <div className="mb-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <MentionsText content={displayText} />
            </div>
          </div>
          
          {/* Botón "Ver más" */}
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-medium"
            >
              {showFullDescription ? (
                <>
                  Ver menos
                  <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Ver más
                  <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Información adicional del proyecto - Diseño mejorado */}
        {(idea.estimated_duration || idea.expected_impact || idea.category) && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {idea.category && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Target className="h-4 w-4 text-blue-500" />
                    Categoría
                  </h4>
                  <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                    {idea.category}
                  </Badge>
                </div>
              )}

              {idea.expected_impact && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Impacto esperado</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{idea.expected_impact}</p>
                </div>
              )}

              {idea.estimated_duration && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Duración estimada
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{idea.estimated_duration}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción - Diseño mejorado */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {idea.contact_link && (
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <a href={idea.contact_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver proyecto completo
                </a>
              </Button>
              
              <Button asChild variant="default" className="flex-1">
                <a href={idea.contact_link} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para ver imagen completa */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
             onClick={closeImageModal}>
          <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            {/* Botón de cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Imagen en tamaño completo */}
            <img
              src={mediaUrls[selectedImageIndex]}
              alt={`${idea.title} - Imagen ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navegación entre imágenes si hay múltiples */}
            {mediaUrls.length > 1 && (
              <>
                {/* Botón anterior */}
                {selectedImageIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors"
                  >
                    <ChevronDown className="h-5 w-5 text-white rotate-90" />
                  </button>
                )}

                {/* Botón siguiente */}
                {selectedImageIndex < mediaUrls.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex + 1);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors"
                  >
                    <ChevronDown className="h-5 w-5 text-white -rotate-90" />
                  </button>
                )}

                {/* Indicador de imágenes */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {mediaUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
