import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mobileToasts } from "@/components/ui/mobile-toast";
import { supabase } from "@/integrations/supabase/client";
import { AttachmentInput } from "./AttachmentInput";
import { AttachmentPreview } from "./AttachmentPreview";
import { VisibilitySelector } from "./post/VisibilitySelector";
// Removed poll and marketplace creators
import { PostCreatorHeader } from "./post/PostCreatorHeader";
import { PostContentInput } from "./post/PostContentInput";
import { TextBackgroundPalette, ContentStyle, backgroundPresets } from "./post/TextBackgroundPalette";
import { EventCreatorForm } from "./post/EventCreatorForm";
import { uploadMediaFile, getMediaType } from "@/lib/api/posts/storage";
import { v4 as uuidv4 } from "uuid";
import { useDraft } from "@/hooks/use-draft";
import { useAutoResize } from "@/hooks/use-auto-resize";
import { useQueryClient } from "@tanstack/react-query";

export interface Idea {
  title: string;
  description: string;
  required_skills: string[];
  max_participants: number;
  deadline?: string;
  contact_link?: string;
}

export interface Proyecto {
  title: string;
  description: string;
  required_skills: string[];
  status: 'planificacion' | 'desarrollo' | 'finalizado';
  contact_link?: string;
  max_participants: number;
}

export interface Encuesta {
  title: string;
  description?: string;
  options: string[];
  multiple_choice?: boolean;
}

export interface Documento {
  title: string;
  description?: string;
  category: 'guía' | 'tutorial' | 'caso de estudio' | 'investigación' | 'otro';
  file?: File;
}

export interface Empleo {
  title: string;
  company: string;
  description: string;
  job_type: 'full-time' | 'part-time' | 'freelance' | 'internship';
  location: string;
  remote: boolean;
  salary_range?: string;
  requirements: string[];
  contact_link?: string;
}

export interface EventForm {
  title: string;
  description: string;
  subtitle?: string;
  start_date: string;
  end_date?: string;
  location: string;
  location_type: 'presencial' | 'virtual' | 'híbrido';
  max_attendees?: number;
  category: 'conference' | 'seminar' | 'workshop' | 'hackathon' | 'webinar' | 'networking' | 'career_fair';
  registration_required?: boolean;
  registration_deadline?: string;
  contact_info?: string;
  gradient_color?: string;
  banner_file?: File | null;
}

type PostType = 'regular' | 'idea' | 'proyecto' | 'evento' | 'encuesta' | 'documento' | 'empleo';
type Visibility = 'public' | 'friends' | 'private' | 'incognito';

interface PostCreatorProps {
  onPostCreated?: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  openWithMedia?: boolean;
  initialContent?: string;
  selectedFile?: File | null;
}

export function PostCreator({ 
  onPostCreated,
  textareaRef: externalTextareaRef,
  openWithMedia = false,
  initialContent = "",
  selectedFile: initialFile = null
}: PostCreatorProps = {}) {
  const [content, setContent] = useState(initialContent);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [postType, setPostType] = useState<PostType>("regular");
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFile ? [initialFile] : []);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [contentStyle, setContentStyle] = useState<ContentStyle>({
    backgroundKey: 'none',
    textColor: 'text-foreground',
    isTextOnly: false
  });
  const [idea, setIdea] = useState<Idea>({
    title: "",
    description: "",
    required_skills: [],
    max_participants: 5,
    contact_link: ""
  });
  const [tempSkills, setTempSkills] = useState(""); // Temporary state for skills input
  const [proyecto, setProyecto] = useState<Proyecto>({
    title: "",
    description: "",
    required_skills: [],
    status: 'planificacion',
    contact_link: "",
    max_participants: 5
  });
  const [evento, setEvento] = useState<EventForm>({
    title: "",
    description: "",
    subtitle: "",
    start_date: "",
    location: "",
    location_type: 'presencial',
    category: 'conference',
    gradient_color: 'gradient-1',
    banner_file: null
  });
  
  const [encuesta, setEncuesta] = useState<Encuesta>({
    title: "",
    description: "",
    options: ["", ""],
    multiple_choice: false
  });
  
  const [documento, setDocumento] = useState<Documento>({
    title: "",
    description: "",
    category: 'guía',
    file: undefined
  });
  
  const [empleo, setEmpleo] = useState<Empleo>({
    title: "",
    company: "",
    description: "",
    job_type: 'full-time',
    location: "",
    remote: false,
    requirements: [],
    contact_link: ""
  });
  
  const [scheduledTime, setScheduledTime] = useState<string>(""); // Para programar publicaciones
  const [autoDeleteTime, setAutoDeleteTime] = useState<string>(""); // Para auto-eliminar

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const finalTextareaRef = externalTextareaRef || textareaRef;
  const { clearDraft } = useDraft(content, setContent);

  // Auto-resize hook for textarea
  const autoResizeRef = useAutoResize<HTMLTextAreaElement>(content);

  // Set initial content when component mounts
  useEffect(() => {
    if (initialContent && !content) {
      setContent(initialContent);
    }
    if (initialFile && selectedFiles.length === 0) {
      setSelectedFiles([initialFile]);
    }
  }, [initialContent, initialFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isFormValid() && !isUploading) {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, selectedFiles, postType, idea, evento, isUploading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Combinar con archivos existentes (máximo 10 archivos)
      const newFiles = [...selectedFiles, ...files].slice(0, 10);
      setSelectedFiles(newFiles);
      
      // Crear previews para todos los archivos nuevos
      const newPreviews: Promise<string>[] = newFiles.map((file) => {
        return new Promise((resolve) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          } else {
            // Para videos y otros, usar URL.createObjectURL
            resolve(URL.createObjectURL(file));
          }
        });
      });
      
      Promise.all(newPreviews).then((previews) => {
        setFilePreviews(previews);
      });
      
      console.log('Files selected:', newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    }
    // Resetear el input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAllAttachments = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const calculateDeleteTime = (timeString: string): string | null => {
    const now = new Date();
    
    const timeMap: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const milliseconds = timeMap[timeString];
    if (!milliseconds) return null;

    return new Date(now.getTime() + milliseconds).toISOString();
  };

  const calculateDeleteTimeFromBase = (timeString: string, baseTime?: string): string | null => {
    const baseDate = baseTime ? new Date(baseTime) : new Date();
    
    const timeMap: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const milliseconds = timeMap[timeString];
    if (!milliseconds) return null;

    return new Date(baseDate.getTime() + milliseconds).toISOString();
  };

  const handleSubmit = async () => {
    try {
      console.log('🚀 Starting post creation...', { postType, isFormValid: isFormValid() });
      
      // Pre-submission validation
      if (!isFormValid()) {
        console.error('❌ Form validation failed before submission');
        mobileToasts.error("Por favor completa todos los campos requeridos.");
        return;
      }
      
      // Enhanced authentication with comprehensive token cleanup
      console.log('🔐 Verifying authentication...');
      
      // First, try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('❌ Authentication failed:', { sessionError, hasSession: !!session });
        
        // Comprehensive auth cleanup
        try {
          const keysToRemove = [
            'supabase.auth.token',
            'supabase.auth.refresh-token',
            'sb-wgbbaxvuuinubkgffpiq-auth-token',
            'sb-wgbbaxvuuinubkgffpiq-auth-token-code-verifier'
          ];
          
          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
          });
          
          await supabase.auth.signOut();
          console.log('🧹 Auth tokens cleaned');
        } catch (cleanupError) {
          console.error('❌ Failed to cleanup auth:', cleanupError);
        }
        
        mobileToasts.error("Error de autenticación. Por favor inicia sesión nuevamente.");
        return;
      }
      
      console.log('✅ User authenticated:', { userId: session.user.id, email: session.user.email });

      if (!content.trim() && selectedFiles.length === 0 && postType === 'regular') {
        mobileToasts.validationError("Contenido o archivo");
        return;
      }

      if (postType === 'proyecto' && (!proyecto.title.trim() || !proyecto.description.trim())) {
        mobileToasts.validationError("Completa los campos obligatorios del proyecto (título y descripción)");
        return;
      }

      if (postType === 'idea' && (!idea.title.trim() || !idea.description.trim())) {
        mobileToasts.validationError("Completa los campos obligatorios de la idea (título y descripción)");
        return;
      }

      if (postType === 'evento' && (!evento.title.trim() || !evento.description.trim() || !evento.start_date || !evento.location.trim())) {
        mobileToasts.validationError("Completa todos los campos del evento (título, descripción, fecha y ubicación)");
        return;
      }

      if (postType === 'encuesta' && (!encuesta.title.trim() || encuesta.options.filter(o => o.trim()).length < 2)) {
        mobileToasts.validationError("La encuesta necesita una pregunta y al menos 2 opciones");
        return;
      }

      if (postType === 'documento' && !documento.title.trim()) {
        mobileToasts.validationError("El documento necesita un título");
        return;
      }

      if (postType === 'empleo' && (!empleo.title.trim() || !empleo.company.trim() || !empleo.description.trim() || !empleo.location.trim())) {
        mobileToasts.validationError("Completa todos los campos de la oferta de empleo (puesto, empresa, descripción y ubicación)");
        return;
      }

      setIsUploading(true);
      

      // Upload multiple files if present
      const mediaUrls: string[] = [];
      const mediaTypes: string[] = [];

      if (selectedFiles.length > 0) {
        console.log(`Uploading ${selectedFiles.length} file(s)...`);
        
        try {
          // Subir todos los archivos en paralelo
          const uploadPromises = selectedFiles.map(async (file) => {
            const url = await uploadMediaFile(file);
            const type = getMediaType(file);
            return { url, type };
          });

          const uploadResults = await Promise.all(uploadPromises);
          
          uploadResults.forEach(({ url, type }) => {
            if (url) {
              mediaUrls.push(url);
              mediaTypes.push(type || 'image');
            }
          });
          
          console.log(`Files uploaded successfully: ${mediaUrls.length} files`);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          mobileToasts.error("Error al subir los archivos");
          setIsUploading(false);
          return;
        }
      }

      // Para compatibilidad con código existente, usar el primer archivo como media_url
      const mediaUrl = mediaUrls.length > 0 ? mediaUrls[0] : null;
      const mediaType = mediaTypes.length > 0 ? mediaTypes[0] : null;

      

      let visibilityValue: "public" | "friends" | "private" = visibility as "public" | "friends" | "private";
      if (visibility === 'incognito') {
        visibilityValue = 'private';
      }

      // Create post data
      const postData: any = {
        user_id: session.user.id,
        content: content.trim() || null,
        visibility: visibilityValue,
        media_url: mediaUrl, // Primera URL para compatibilidad
        media_type: mediaType, // Primer tipo para compatibilidad
        media_urls: mediaUrls.length > 0 ? mediaUrls : null, // Array de URLs para múltiples archivos
        post_type: postType,
        scheduled_at: scheduledTime ? new Date(scheduledTime).toISOString() : null,
        // delete_at se calcula desde scheduled_at si existe, si no desde ahora
        delete_at: autoDeleteTime ? calculateDeleteTimeFromBase(autoDeleteTime, scheduledTime) : null
      };

      // Add type-specific data
      
      if (postType === 'idea' && idea.title.trim()) {
        postData.idea = {
          title: idea.title,
          description: idea.description,
          required_skills: idea.required_skills,
          max_participants: idea.max_participants,
          deadline: idea.deadline || null,
          contact_link: idea.contact_link || null
        };
        postData.project_status = 'idea'; // Mark as idea initially
      }

      if (postType === 'evento' && evento.title.trim()) {
        postData.post_metadata = {
          ...postData.post_metadata,
          evento: {
            title: evento.title,
            description: evento.description,
            start_date: evento.start_date,
            location: evento.location,
            location_type: evento.location_type,
            category: evento.category
          }
        };
      }

      if (postType === 'encuesta' && encuesta.title.trim()) {
        postData.post_metadata = {
          ...postData.post_metadata,
          encuesta: {
            title: encuesta.title,
            options: encuesta.options.filter(o => o.trim()),
            multiple_choice: encuesta.multiple_choice
          }
        };
      }

      if (postType === 'documento' && documento.title.trim()) {
        postData.post_metadata = {
          ...postData.post_metadata,
          documento: {
            title: documento.title,
            description: documento.description,
            category: documento.category
          }
        };
      }

      if (postType === 'empleo' && empleo.title.trim()) {
        postData.post_metadata = {
          ...postData.post_metadata,
          empleo: {
            title: empleo.title,
            company: empleo.company,
            description: empleo.description,
            job_type: empleo.job_type,
            location: empleo.location,
            remote: empleo.remote,
            requirements: empleo.requirements,
            contact_link: empleo.contact_link
          }
        };
      }

      console.log("Creating post with data:", postData);
      
      // Handle proyectos - store metadata in post_metadata
      if (postType === 'proyecto' && proyecto.title.trim()) {
        postData.post_metadata = {
          ...postData.post_metadata,
          proyecto: {
            title: proyecto.title,
            description: proyecto.description,
            required_skills: proyecto.required_skills,
            status: proyecto.status,
            contact_link: proyecto.contact_link || '',
            max_participants: proyecto.max_participants
          }
        };
      }
      
      // Insert regular post or idea post
      const { data: newPost, error: postError } = await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw postError;
      }

      console.log('Post created successfully:', newPost);
      
      // Invalidate queries to update feed immediately
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["personalized-feed"] });

      mobileToasts.postCreated();

      // Call onPostCreated callback if provided
      onPostCreated?.();

      // Clear draft after successful post
      clearDraft();

      // Reset form
      setContent("");
      setVisibility("public");
      setPostType("regular");
      setSelectedFiles([]);
      setFilePreviews([]);
      setContentStyle({
        backgroundKey: 'none',
        textColor: 'text-foreground',
        isTextOnly: false
      });
      setIdea({
        title: "",
        description: "",
        required_skills: [],
        max_participants: 5,
        contact_link: ""
      });
      setTempSkills("");
      setProyecto({
        title: "",
        description: "",
        required_skills: [],
        status: 'planificacion',
        contact_link: "",
        max_participants: 5
      });
      setEvento({
        title: "",
        description: "",
        subtitle: "",
        start_date: "",
        location: "",
        location_type: 'presencial',
        category: 'conference',
        gradient_color: 'gradient-1',
        banner_file: null
      });
      setEncuesta({
        title: "",
        description: "",
        options: ["", ""],
        multiple_choice: false
      });
      setDocumento({
        title: "",
        description: "",
        category: 'guía',
        file: undefined
      });
      setEmpleo({
        title: "",
        company: "",
        description: "",
        job_type: 'full-time',
        location: "",
        remote: false,
        requirements: [],
        contact_link: ""
      });
      setScheduledTime("");
      setAutoDeleteTime("");
    } catch (error) {
      console.error("❌ Error creating post:", error);
      
      // Enhanced error messages with specific handling
      console.error("❌ Error creating post:", { 
        error, 
        postType, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined 
      });
      
      let errorMessage = "Error desconocido al crear la publicación";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('auth') || errorMsg.includes('jwt') || errorMsg.includes('session')) {
          errorMessage = "Error de autenticación. Por favor inicia sesión nuevamente.";
          // Comprehensive auth cleanup
          try {
            const keysToRemove = [
              'supabase.auth.token',
              'supabase.auth.refresh-token',
              'sb-wgbbaxvuuinubkgffpiq-auth-token',
              'sb-wgbbaxvuuinubkgffpiq-auth-token-code-verifier'
            ];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            await supabase.auth.signOut();
          } catch (cleanupError) {
            console.error('❌ Auth cleanup failed:', cleanupError);
          }
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
          errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('too many')) {
          errorMessage = "Demasiadas publicaciones. Espera un momento antes de intentar nuevamente.";
        } else if (errorMsg.includes('violates check constraint')) {
          errorMessage = "Datos del evento no válidos. Revisa los campos obligatorios.";
        } else if (errorMsg.includes('permission') || errorMsg.includes('access')) {
          errorMessage = "No tienes permisos para realizar esta acción.";
        } else {
          errorMessage = error.message;
        }
      }
      
      mobileToasts.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = () => {
    try {
      console.log('🔍 Validating form for postType:', postType);
      
      if (postType === 'regular') {
        // For text-only posts with backgrounds, limit content length
        if (contentStyle.isTextOnly && content.length > 280) {
          console.log('❌ Regular post validation failed: text too long for background');
          return false;
        }
        const isValid = Boolean(content.trim() || selectedFiles.length > 0);
        console.log('✅ Regular post validation:', { isValid, hasContent: !!content.trim(), hasFiles: selectedFiles.length });
        return isValid;
      } else if (postType === 'idea') {
        const validation = {
          hasTitle: idea.title.trim().length >= 5,
          hasDescription: idea.description.trim().length >= 10,
          validParticipants: idea.max_participants > 0 && idea.max_participants <= 50
        };
        const isValid = validation.hasTitle && validation.hasDescription && validation.validParticipants;
        console.log('💡 Idea validation:', { ...validation, isValid });
        return isValid;
      } else if (postType === 'proyecto') {
        const validationProyecto = {
          hasTitle: proyecto.title.trim().length >= 5,
          hasDescription: proyecto.description.trim().length >= 10,
          validParticipants: proyecto.max_participants > 0 && proyecto.max_participants <= 50
        };
        const isValidProyecto = validationProyecto.hasTitle && validationProyecto.hasDescription && validationProyecto.validParticipants;
        console.log('📁 Proyecto validation:', { ...validationProyecto, isValidProyecto });
        return isValidProyecto;
      } else if (postType === 'evento') {
        const validationEvento = {
          hasTitle: evento.title.trim().length >= 5,
          hasDescription: evento.description.trim().length >= 10,
          hasStartDate: evento.start_date.length > 0,
          hasLocation: evento.location.trim().length > 0
        };
        const isValidEvento = Object.values(validationEvento).every(v => v);
        console.log('📅 Evento validation:', { ...validationEvento, isValidEvento });
        return isValidEvento;
      } else if (postType === 'encuesta') {
        const validationEncuesta = {
          hasQuestion: encuesta.title.trim().length >= 5,
          hasOptions: encuesta.options.filter(o => o.trim().length > 0).length >= 2
        };
        const isValidEncuesta = Object.values(validationEncuesta).every(v => v);
        console.log('📊 Encuesta validation:', { ...validationEncuesta, isValidEncuesta });
        return isValidEncuesta;
      } else if (postType === 'documento') {
        const validationDocumento = {
          hasTitle: documento.title.trim().length >= 5
        };
        const isValidDocumento = Object.values(validationDocumento).every(v => v);
        console.log('📄 Documento validation:', { ...validationDocumento, isValidDocumento });
        return isValidDocumento;
      } else if (postType === 'empleo') {
        const validationEmpleo = {
          hasTitle: empleo.title.trim().length >= 5,
          hasCompany: empleo.company.trim().length >= 3,
          hasDescription: empleo.description.trim().length >= 10,
          hasLocation: empleo.location.trim().length >= 2
        };
        const isValidEmpleo = Object.values(validationEmpleo).every(v => v);
        console.log('💼 Empleo validation:', { ...validationEmpleo, isValidEmpleo });
        return isValidEmpleo;
      }
      
      console.log('❌ Unknown postType:', postType);
      return false;
    } catch (error) {
      console.error('❌ Form validation error:', error);
      return false;
    }
  };

  return (
    <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-full overflow-hidden">
      <PostCreatorHeader 
        postType={postType} 
        setPostType={setPostType}
      />
      
      {postType === 'regular' && (
        <PostContentInput
          content={content}
          setContent={setContent}
          textareaRef={finalTextareaRef}
          contentStyle={contentStyle}
        />
      )}

      {postType === 'regular' && selectedFiles.length === 0 && (
        <TextBackgroundPalette
          selectedBackground={contentStyle.backgroundKey}
          onBackgroundChange={setContentStyle}
          disabled={selectedFiles.length > 0}
        />
      )}

      {/* Preview de múltiples archivos - Mejorado para móvil */}
      {postType === 'regular' && selectedFiles.length > 0 && (
        <div className="space-y-3 -mx-3 sm:mx-0 px-3 sm:px-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''} seleccionado{selectedFiles.length > 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeAllAttachments}
              className="text-xs h-6 text-destructive hover:text-destructive"
            >
              Eliminar todos
            </Button>
          </div>
          
          {/* Scroll horizontal en móvil para ver todas las imágenes */}
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-2">
            <div className="flex gap-2 w-fit sm:w-full sm:flex-wrap">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={filePreviews[index] || URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="h-28 w-28 sm:h-24 sm:w-24 object-cover rounded-md"
                    />
                  ) : file.type.startsWith('video/') ? (
                    <div className="relative h-28 w-28 sm:h-24 sm:w-24 bg-black rounded-md flex items-center justify-center">
                      <video
                        src={filePreviews[index] || URL.createObjectURL(file)}
                        className="w-full h-full object-cover rounded-md"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-1">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 w-28 sm:h-24 sm:w-24 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-center px-2 line-clamp-2">{file.name}</span>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full shadow-md"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botón para agregar más archivos */}
          {selectedFiles.length < 10 && (
            <AttachmentInput
              type="image"
              onFileSelect={handleFileSelect}
              accept="image/*,video/*"
              showLabel={true}
              label={`Agregar más (${selectedFiles.length}/10)`}
              buttonVariant="outline"
              buttonClassName="w-full"
            />
          )}
        </div>
      )}

      {/* Poll creator removed for performance */}

      {postType === 'idea' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="idea-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Título de la idea
            </label>
            <Textarea
              id="idea-title"
              placeholder="Ej: App para conectar estudiantes"
              value={idea.title}
              onChange={(e) => setIdea({ ...idea, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Descripción
            </label>
            <Textarea
              id="idea-description"
              placeholder="Describe tu idea en detalle"
              value={idea.description}
              onChange={(e) => setIdea({ ...idea, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-skills" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Habilidades requeridas
            </label>
            <Textarea
              id="idea-skills"
              placeholder="Ej: React, Node.js, Diseño UI"
              value={tempSkills}
              onChange={(e) => setTempSkills(e.target.value)}
              onBlur={(e) => {
                // Process skills only when leaving the field
                const skills = e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s.length > 0);
                setIdea({ ...idea, required_skills: skills });
              }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-contact" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Enlace de contacto (opcional)
            </label>
            <input
              type="url"
              id="idea-contact"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="https://wa.me/1234567890 o https://t.me/usuario"
              value={idea.contact_link || ""}
              onChange={(e) => setIdea({ ...idea, contact_link: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Comparte un enlace de WhatsApp o Telegram para contacto directo
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-participants" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Máximo participantes
            </label>
            <input
              type="number"
              id="idea-participants"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="5"
              value={idea.max_participants}
              onChange={(e) => setIdea({ ...idea, max_participants: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-deadline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Fecha límite (opcional)
            </label>
            <input
              type="datetime-local"
              id="idea-deadline"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={idea.deadline || ""}
              onChange={(e) => setIdea({ ...idea, deadline: e.target.value })}
            />
          </div>
        </div>
      )}

      {postType === 'proyecto' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título del proyecto</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej: App para conectar empresas"
              value={proyecto.title}
              onChange={(e) => setProyecto({ ...proyecto, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              placeholder="Describe tu proyecto en detalle"
              value={proyecto.description}
              onChange={(e) => setProyecto({ ...proyecto, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Habilidades requeridas</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej: React, Node.js, Diseño UI"
              value={proyecto.required_skills.join(', ')}
              onChange={(e) => setProyecto({ ...proyecto, required_skills: e.target.value.split(',').map(s => s.trim()) })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado del proyecto</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={proyecto.status}
              onChange={(e) => setProyecto({ ...proyecto, status: e.target.value as any })}
            >
              <option value="planificacion">En planificación</option>
              <option value="desarrollo">En desarrollo</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enlace de contacto (opcional)</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://wa.me/1234567890 o https://t.me/usuario"
              value={proyecto.contact_link || ""}
              onChange={(e) => setProyecto({ ...proyecto, contact_link: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Máximo participantes</label>
            <input
              type="number"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={proyecto.max_participants}
              onChange={(e) => setProyecto({ ...proyecto, max_participants: parseInt(e.target.value) })}
            />
          </div>
        </div>
      )}

      {postType === 'evento' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título del evento</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej: Conferencia de Tecnología 2024"
              value={evento.title}
              onChange={(e) => setEvento({ ...evento, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              placeholder="Describe el evento"
              value={evento.description}
              onChange={(e) => setEvento({ ...evento, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de inicio</label>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={evento.start_date}
                onChange={(e) => setEvento({ ...evento, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ej: Centro de Convenciones"
                value={evento.location}
                onChange={(e) => setEvento({ ...evento, location: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de evento</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={evento.location_type}
              onChange={(e) => setEvento({ ...evento, location_type: e.target.value as any })}
            >
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="híbrido">Híbrido</option>
            </select>
          </div>
        </div>
      )}

      {postType === 'encuesta' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pregunta</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej: ¿Cuál es tu lenguaje favorito?"
              value={encuesta.title}
              onChange={(e) => setEncuesta({ ...encuesta, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Opciones</label>
            {encuesta.options.map((option, index) => (
              <input
                key={index}
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={`Opción ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...encuesta.options];
                  newOptions[index] = e.target.value;
                  setEncuesta({ ...encuesta, options: newOptions });
                }}
              />
            ))}
            {encuesta.options.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setEncuesta({ ...encuesta, options: [...encuesta.options, ""] })}
              >
                Agregar opción
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="multiple"
              checked={encuesta.multiple_choice}
              onChange={(e) => setEncuesta({ ...encuesta, multiple_choice: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="multiple" className="text-sm font-medium">Permitir múltiples respuestas</label>
          </div>
        </div>
      )}

      {postType === 'documento' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título del documento</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej: Guía de mejores prácticas"
              value={documento.title}
              onChange={(e) => setDocumento({ ...documento, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <Textarea
              placeholder="Describe el contenido del documento"
              value={documento.description}
              onChange={(e) => setDocumento({ ...documento, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={documento.category}
              onChange={(e) => setDocumento({ ...documento, category: e.target.value as any })}
            >
              <option value="guía">Guía</option>
              <option value="tutorial">Tutorial</option>
              <option value="caso de estudio">Caso de estudio</option>
              <option value="investigación">Investigación</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      )}

      {postType === 'empleo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título del puesto</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ej: Desarrollador React Senior"
                value={empleo.title}
                onChange={(e) => setEmpleo({ ...empleo, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Nombre de la empresa"
                value={empleo.company}
                onChange={(e) => setEmpleo({ ...empleo, company: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              placeholder="Describe la vacante y responsabilidades"
              value={empleo.description}
              onChange={(e) => setEmpleo({ ...empleo, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de empleo</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={empleo.job_type}
                onChange={(e) => setEmpleo({ ...empleo, job_type: e.target.value as any })}
              >
                <option value="full-time">Tiempo completo</option>
                <option value="part-time">Tiempo parcial</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ciudad o "Remoto""
                value={empleo.location}
                onChange={(e) => setEmpleo({ ...empleo, location: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              checked={empleo.remote}
              onChange={(e) => setEmpleo({ ...empleo, remote: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="remote" className="text-sm font-medium">Trabajo remoto disponible</label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enlace de contacto</label>
            <input
              type="url"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://careers.example.com"
              value={empleo.contact_link}
              onChange={(e) => setEmpleo({ ...empleo, contact_link: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Sección de programación y auto-eliminación */}
      <div className="space-y-3 border-t pt-3">
        <details className="group cursor-pointer">
          <summary className="flex items-center justify-between text-sm font-medium hover:text-primary transition-colors">
            <span className="flex items-center gap-2">
              🕐 Opciones avanzadas
            </span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="space-y-3 mt-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Programar publicación (opcional)</label>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Déjalo vacío para publicar ahora</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-eliminar después de (opcional)</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={autoDeleteTime}
                onChange={(e) => setAutoDeleteTime(e.target.value)}
              >
                <option value="">No eliminar</option>
                <option value="1h">1 hora</option>
                <option value="6h">6 horas</option>
                <option value="24h">24 horas</option>
                <option value="7d">7 días</option>
                <option value="30d">30 días</option>
              </select>
              <p className="text-xs text-muted-foreground">La publicación se eliminará automáticamente después del tiempo especificado</p>
            </div>
          </div>
        </details>
      </div>
        <VisibilitySelector 
          visibility={visibility}
          setVisibility={setVisibility}
        />
        
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid() || isUploading}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 text-base sm:text-sm font-medium hover-scale touch-manipulation"
            size="lg"
            onMouseEnter={() => {
              // Debug validation on hover
              if (!isFormValid()) {
                console.log('🔍 Button disabled - validation failed:', {
                  postType,
                  formValid: isFormValid(),
                  uploading: isUploading
                });
              }
            }}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Publicando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Publicar
                <span className="hidden sm:inline text-xs opacity-70">Ctrl+Enter</span>
              </div>
            )}
          </Button>
      </div>
    </Card>
  );
}
