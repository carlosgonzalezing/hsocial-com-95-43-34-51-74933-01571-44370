import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Image as ImageIcon, Clock, ChevronDown, Plus, Lightbulb, Briefcase, BarChart2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { uploadMediaFile, getMediaType } from "@/lib/api/posts/storage";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export type PostType = 'idea' | 'proyecto' | 'encuesta' | 'evento' | null;

interface ModalPublicacionWebProps {
  isVisible: boolean;
  onClose: () => void;
  onPublish?: (content: string, postType: PostType, fileToUpload: File | null) => void;
  userAvatar?: string;
  isPublishing?: boolean;
  initialPostType?: PostType;
}

const ModalPublicacionWeb: React.FC<ModalPublicacionWebProps> = ({
  isVisible,
  onClose,
  onPublish,
  userAvatar,
  isPublishing = false,
  initialPostType,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showPostTypeMenu, setShowPostTypeMenu] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType>(null);
  const [privacy, setPrivacy] = useState('Público');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const privacyMenuRef = useRef<HTMLDivElement>(null);

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isPublishingInternal, setIsPublishingInternal] = useState(false);

  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventLocationType, setEventLocationType] = useState<'presencial' | 'virtual' | 'híbrido'>('presencial');
  const [eventLocation, setEventLocation] = useState('');
  const [eventMeetingLink, setEventMeetingLink] = useState('');
  const [eventCategory, setEventCategory] = useState<'conference' | 'seminar' | 'workshop' | 'hackathon' | 'webinar' | 'networking' | 'career_fair'>('conference');
  const [eventMaxAttendees, setEventMaxAttendees] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setSelectedPostType(initialPostType ?? null);
    }
  }, [initialPostType, isVisible]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPostTypeMenu(false);
      }
      if (privacyMenuRef.current && !privacyMenuRef.current.contains(event.target as Node)) {
        setShowPrivacyMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const effectivePublishing = isPublishing || isPublishingInternal;

  const visibilityValue = useMemo(() => {
    if (privacy === 'Amigos') return 'friends' as const;
    if (privacy === 'Solo yo') return 'private' as const;
    return 'public' as const;
  }, [privacy]);

  const isFormValid = useMemo(() => {
    if (selectedPostType === 'idea') {
      return ideaTitle.trim().length >= 3 && ideaDescription.trim().length >= 10;
    }
    if (selectedPostType === 'proyecto') {
      return projectTitle.trim().length >= 3 && projectDescription.trim().length >= 10;
    }
    if (selectedPostType === 'encuesta') {
      const cleanOptions = pollOptions.map(o => o.trim()).filter(Boolean);
      return pollQuestion.trim().length >= 5 && cleanOptions.length >= 2;
    }
    if (selectedPostType === 'evento') {
      const hasBasic = eventTitle.trim().length >= 3 && eventDescription.trim().length >= 10;
      const hasDates = Boolean(eventStartDate);
      const hasLocation = eventLocationType === 'virtual'
        ? eventMeetingLink.trim().length > 0
        : eventLocation.trim().length > 0;
      return hasBasic && hasDates && hasLocation;
    }
    return Boolean(content.trim() || selectedMedia);
  }, [content, selectedMedia, selectedPostType, ideaTitle, ideaDescription, projectTitle, projectDescription, pollQuestion, pollOptions, eventTitle, eventDescription, eventStartDate, eventLocationType, eventMeetingLink, eventLocation]);

  const handlePublish = async () => {
    if (effectivePublishing) return;
    if (!isFormValid) return;

    setIsPublishingInternal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para publicar',
          variant: 'destructive'
        });
        return;
      }

      let mediaUrl: string | null = null;
      let mediaType: 'image' | 'video' | 'audio' | null = null;

      if (fileToUpload) {
        mediaUrl = await uploadMediaFile(fileToUpload);
        mediaType = getMediaType(fileToUpload);
      }

      const generateOptionId = () => {
        try {
          return crypto.randomUUID();
        } catch {
          return `opt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        }
      };

      if (selectedPostType === 'evento') {
        const isVirtual = eventLocationType === 'virtual';
        const location = isVirtual ? 'Virtual' : eventLocation;
        const meetingLink = isVirtual ? eventMeetingLink : '';
        const endDate = eventEndDate || eventStartDate;

        const { error } = await supabase.rpc('create_academic_event_atomic', {
          user_id_param: user.id,
          post_content: content.trim() || '',
          post_visibility: visibilityValue,
          event_title: eventTitle.trim(),
          event_description: eventDescription.trim(),
          start_date: eventStartDate,
          end_date: endDate,
          location,
          is_virtual: isVirtual,
          meeting_link: meetingLink,
          max_attendees: Number.isFinite(eventMaxAttendees) ? eventMaxAttendees : 100,
          event_type: eventCategory,
        });

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['personalized-feed'] });
        queryClient.invalidateQueries({ queryKey: ['feed-posts'] });

        onPublish?.(content, selectedPostType, fileToUpload);
        toast({ title: 'Publicado', description: 'Tu evento se creó correctamente' });
        onClose();
        return;
      }

      const postData: any = {
        user_id: user.id,
        content: content.trim() || null,
        visibility: visibilityValue,
        media_url: mediaUrl,
        media_type: mediaType,
      };

      if (selectedPostType === 'idea') {
        postData.post_type = 'idea';
        postData.idea = {
          title: ideaTitle.trim(),
          description: ideaDescription.trim(),
          participants: [],
        };
        postData.project_status = 'idea';
      } else if (selectedPostType === 'proyecto') {
        postData.post_type = 'project';
        postData.idea = {
          title: projectTitle.trim(),
          description: projectDescription.trim(),
          participants: [],
        };
        postData.project_status = 'in_progress';
      } else if (selectedPostType === 'encuesta') {
        postData.post_type = 'poll';
        const cleanOptions = pollOptions.map(o => o.trim()).filter(Boolean);
        postData.poll = {
          question: pollQuestion.trim(),
          options: cleanOptions.map((opt) => ({
            id: generateOptionId(),
            content: opt,
            votes: 0,
          })),
          total_votes: 0,
          user_vote: null,
        };
      } else {
        postData.post_type = 'regular';
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert(postData);

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['personalized-feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });

      onPublish?.(content, selectedPostType, fileToUpload);
      toast({ title: 'Publicado', description: 'Tu publicación se creó correctamente' });
      onClose();
    } catch (error: any) {
      console.error('Error publishing from ModalPublicacionWeb:', error);
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo publicar',
        variant: 'destructive'
      });
    } finally {
      setIsPublishingInternal(false);
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan imágenes y videos.');
      e.target.value = ''; // Limpiar el input
      return;
    }

    // Validar tamaño de archivo (20MB máximo)
    const maxSize = 20 * 1024 * 1024; // 20MB en bytes
    if (file.size > maxSize) {
      alert('El archivo excede el tamaño máximo permitido (20MB).');
      e.target.value = ''; // Limpiar el input
      return;
    }

    // Si pasa las validaciones, proceder con la vista previa
    setFileToUpload(file);
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      // Opcional: Mostrar un indicador de carga
    };
    
    reader.onloadend = () => {
      setSelectedMedia(reader.result as string);
    };
    
    reader.onerror = () => {
      console.error('Error al leer el archivo');
      alert('Error al procesar el archivo. Por favor, inténtalo de nuevo.');
      e.target.value = ''; // Limpiar el input
    };
    
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setFileToUpload(null);
  };

  const handlePostTypeSelect = (type: PostType) => {
    setSelectedPostType(type);
    setShowPostTypeMenu(false);
  };

  const handlePrivacySelect = (privacyOption: string) => {
    setPrivacy(privacyOption);
    setShowPrivacyMenu(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${!isVisible ? 'hidden' : ''} sm:px-4`}>
      <div className="bg-white dark:bg-gray-800 shadow-xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:max-w-2xl overflow-hidden sm:overflow-visible flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-200" />
            </button>

            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>

            <div className="relative" ref={privacyMenuRef}>
              <button
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                <span className="text-blue-500">
                  {privacy === 'Público' ? (
                    <span className="flex items-center">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a5 5 0 00-5 5v2a2 5 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                      </svg>
                    </span>
                  ) : privacy === 'Amigos' ? (
                    <span className="flex items-center">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className="mx-1">{privacy}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showPrivacyMenu && (
                <div className="absolute left-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                  <button
                    onClick={() => handlePrivacySelect('Público')}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="mr-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 5 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                    Público
                  </button>
                  <button
                    onClick={() => handlePrivacySelect('Amigos')}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="mr-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Amigos
                  </button>
                  <button
                    onClick={() => handlePrivacySelect('Solo yo')}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="mr-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Solo yo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
              <Clock className="h-5 w-5" />
            </button>

            <Button
              onClick={handlePublish}
              disabled={!isFormValid || effectivePublishing}
              className={cn(
                'ml-2 bg-blue-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-600',
                !isFormValid && 'cursor-not-allowed bg-blue-300 hover:bg-blue-300',
                effectivePublishing && 'opacity-70 cursor-not-allowed'
              )}
            >
              {effectivePublishing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publicando...
                </span>
              ) : 'Publicar'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedPostType === 'idea' && (
            <div className="space-y-3 mb-4">
              <input
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="Título de la idea"
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                placeholder="Descripción de la idea"
                rows={4}
                className="w-full resize-none rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          )}

          {selectedPostType === 'proyecto' && (
            <div className="space-y-3 mb-4">
              <input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Título del proyecto"
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descripción del proyecto"
                rows={4}
                className="w-full resize-none rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          )}

          {selectedPostType === 'encuesta' && (
            <div className="space-y-3 mb-4">
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Pregunta de la encuesta"
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    value={opt}
                    onChange={(e) => {
                      const next = [...pollOptions];
                      next[idx] = e.target.value;
                      setPollOptions(next);
                    }}
                    placeholder={`Opción ${idx + 1}`}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8"
                  onClick={() => setPollOptions((prev) => [...prev, ''])}
                >
                  Agregar opción
                </Button>
                {pollOptions.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setPollOptions((prev) => prev.slice(0, -1))}
                  >
                    Quitar última
                  </Button>
                )}
              </div>
            </div>
          )}

          {selectedPostType === 'evento' && (
            <div className="space-y-3 mb-4">
              <input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Título del evento"
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Descripción del evento"
                rows={3}
                className="w-full resize-none rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
                <input
                  type="datetime-local"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={eventLocationType}
                  onChange={(e) => setEventLocationType(e.target.value as any)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="híbrido">Híbrido</option>
                </select>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="conference">Conferencia</option>
                  <option value="seminar">Seminario</option>
                  <option value="workshop">Taller</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="webinar">Webinar</option>
                  <option value="networking">Networking</option>
                  <option value="career_fair">Feria de empleo</option>
                </select>
              </div>
              {eventLocationType === 'virtual' ? (
                <input
                  value={eventMeetingLink}
                  onChange={(e) => setEventMeetingLink(e.target.value)}
                  placeholder="Link de reunión"
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              ) : (
                <input
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Ubicación"
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              )}
              <input
                type="number"
                value={eventMaxAttendees}
                onChange={(e) => setEventMaxAttendees(Number(e.target.value || 0))}
                placeholder="Máximo asistentes"
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          )}

          <textarea
            className="w-full resize-none border-none p-0 text-gray-900 placeholder-gray-500 focus:ring-0 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
            rows={10}
            placeholder="Comparte tus ideas..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />

          {selectedMedia && (
            <div className="relative mt-4 overflow-hidden rounded-lg">
              {fileToUpload?.type?.startsWith('video/') ? (
                <video
                  src={selectedMedia}
                  className="h-48 w-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
              )}
              <button
                onClick={removeMedia}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center border-t px-3 py-2 sm:px-4">
          <label className="cursor-pointer rounded-full p-2 text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*,video/*" 
              onChange={handleMediaSelect}
            />
            <ImageIcon className="h-5 w-5" />
          </label>
          
          <div className="flex-1"></div>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowPostTypeMenu(!showPostTypeMenu)}
              className="flex items-center rounded-full p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              <Plus className="h-5 w-5" />
            </button>
            
            {showPostTypeMenu && (
              <div className="absolute bottom-12 right-0 z-[9999] w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                <button
                  onClick={() => handlePostTypeSelect('idea')}
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <Lightbulb className="mr-3 h-5 w-5 text-blue-500" />
                  Publicar una idea
                </button>
                
                <button
                  onClick={() => handlePostTypeSelect('proyecto')}
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <Briefcase className="mr-3 h-5 w-5 text-blue-500" />
                  Publicar un proyecto
                </button>
                
                <button
                  onClick={() => handlePostTypeSelect('encuesta')}
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <BarChart2 className="mr-3 h-5 w-5 text-blue-500" />
                  Publicar una encuesta
                </button>
                
                <button
                  onClick={() => handlePostTypeSelect('evento')}
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <Calendar className="mr-3 h-5 w-5 text-blue-500" />
                  Publicar un evento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPublicacionWeb;
