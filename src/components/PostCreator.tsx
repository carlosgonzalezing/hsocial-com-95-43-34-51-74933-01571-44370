import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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

type PostType = 'regular' | 'idea' | 'evento';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [isUploading, setIsUploading] = useState(false);
  // Simplified - no progress tracking
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
    if (initialFile && !selectedFile) {
      setSelectedFile(initialFile);
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
  }, [content, selectedFile, postType, idea, evento, isUploading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('File selected:', { name: file.name, size: file.size, type: file.type });
      setSelectedFile(file);
    }
  };

  const removeAttachment = () => {
    setSelectedFile(null);
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

      if (!content.trim() && !selectedFile && postType === 'regular') {
        mobileToasts.validationError("Contenido o archivo");
        return;
      }

      if (postType === 'evento' && (!evento.title.trim() || !evento.description.trim() || !evento.start_date || !evento.location.trim())) {
        mobileToasts.validationError("Completa los campos obligatorios del evento (título, descripción, fecha y ubicación)");
        return;
      }

      setIsUploading(true);
      

      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      // Upload file if present
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        
        
        try {
          mediaUrl = await uploadMediaFile(selectedFile);
          mediaType = getMediaType(selectedFile);
          
          console.log('File uploaded successfully:', { mediaUrl, mediaType });
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          mobileToasts.error("Error al subir el archivo");
          setIsUploading(false);
          return;
        }
      }

      

      let visibilityValue: "public" | "friends" | "private" = visibility as "public" | "friends" | "private";
      if (visibility === 'incognito') {
        visibilityValue = 'private';
      }

      // Create post data
      const postData: any = {
        user_id: session.user.id,
        content: content.trim() || null,
        visibility: visibilityValue,
        media_url: mediaUrl,
        media_type: mediaType,
        post_type: postType,
        content_style: contentStyle.backgroundKey !== 'none' ? contentStyle : null
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

      console.log("Creating post with data:", postData);
      
      // Handle events separately using atomic function
      if (postType === 'evento' && evento.title.trim()) {
        // Use atomic function for events with enhanced validation
        console.log("🎯 Creating academic event with data:", {
          title: evento.title,
          description: evento.description,
          category: evento.category,
          start_date: evento.start_date,
          end_date: evento.end_date,
          location: evento.location,
          location_type: evento.location_type,
          max_attendees: evento.max_attendees,
          registration_required: evento.registration_required,
          contact_info: evento.contact_info
        });
        
        // Validate required fields one more time
        if (!evento.title.trim() || !evento.description.trim() || !evento.start_date || !evento.location.trim()) {
          throw new Error('Faltan campos obligatorios para el evento');
        }
        
        // Validate category is in allowed list
        const validCategories = ['conference', 'seminar', 'workshop', 'hackathon', 'webinar', 'networking', 'career_fair'];
        if (!validCategories.includes(evento.category)) {
          console.error('❌ Invalid event category:', evento.category);
          throw new Error(`Categoría de evento no válida: ${evento.category}`);
        }
        
        // Validate location type
        const validLocationTypes = ['presencial', 'virtual', 'híbrido'];
        if (!validLocationTypes.includes(evento.location_type)) {
          console.error('❌ Invalid location type:', evento.location_type);
          throw new Error(`Tipo de ubicación no válido: ${evento.location_type}`);
        }
        
        // Convert date strings to proper timestamps
        const formatDateForDB = (dateString: string): string => {
          if (!dateString) return '';
          
          // If it's already in the right format, return as is
          if (dateString.includes('T')) {
            // Ensure it has timezone info
            if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
              return `${dateString}:00.000Z`;
            }
            return dateString;
          }
          
          // If it's just a date, add default time
          return `${dateString}T09:00:00.000Z`;
        };
        
        const formattedStartDate = formatDateForDB(evento.start_date);
        const formattedEndDate = evento.end_date ? formatDateForDB(evento.end_date) : null;
        
        console.log('📅 Formatted dates:', {
          original_start: evento.start_date,
          formatted_start: formattedStartDate,
          original_end: evento.end_date,
          formatted_end: formattedEndDate
        });
        
        // Validate required fields
        if (!formattedStartDate) {
          mobileToasts.validationError("La fecha de inicio es requerida");
          setIsUploading(false);
          return;
        }
        
        // Use the atomic function to create both post and event
        const { data: eventResult, error: eventError } = await supabase
          .rpc('create_academic_event_atomic', {
            post_content: content.trim() || null,
            post_visibility: visibilityValue,
            event_title: evento.title.trim(),
            event_description: evento.description.trim(),
            event_type: evento.category, // Map category to event_type
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            location: evento.location.trim(),
            is_virtual: evento.location_type === 'virtual',
            meeting_link: evento.location_type === 'virtual' ? evento.location.trim() : null,
            max_attendees: evento.max_attendees || null,
            user_id_param: session.user.id
          });

        console.log('📤 RPC call completed:', { eventResult, eventError });
        
        if (eventError) {
          console.error('❌ Event creation error:', eventError);
          
          // Enhanced error handling for specific cases
          let errorMessage = 'Error al crear el evento';
          if (eventError.message?.includes('invalid input syntax')) {
            errorMessage = 'Error en el formato de fecha. Por favor verifica las fechas ingresadas.';
          } else if (eventError.message?.includes('permission denied')) {
            errorMessage = 'No tienes permisos para crear eventos.';
          } else if (eventError.message?.includes('violates check constraint')) {
            errorMessage = 'Los datos del evento no son válidos. Revisa los campos obligatorios.';
          } else if (eventError.message) {
            errorMessage = eventError.message;
          }
          
          mobileToasts.error(errorMessage);
          setIsUploading(false);
          return;
        }

        // Parse the result as JSON and check success
        const result = eventResult as { success: boolean; error?: string; event_id?: string; post_id?: string };
        console.log('📋 Parsed result:', result);
        
        if (!result?.success) {
          const errorMsg = result?.error || 'Error desconocido al crear evento';
          console.error('❌ Event creation failed:', errorMsg);
          mobileToasts.error(errorMsg);
          setIsUploading(false);
          return;
        }

        console.log('✅ Event created successfully:', eventResult);
        
        // Clear form and show success message
        mobileToasts.postCreated();
        onPostCreated?.();
        clearDraft();
        
        // Reset form
        setContent("");
        setVisibility("public");
        setPostType("regular");
        setSelectedFile(null);
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
        
        setIsUploading(false);
        return; // Exit early for events
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
      setSelectedFile(null);
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
        } else if (postType === 'evento' && (errorMsg.includes('category') || errorMsg.includes('type'))) {
          errorMessage = "Tipo de evento no válido. Selecciona una categoría correcta.";
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
        const isValid = Boolean(content.trim() || selectedFile);
        console.log('✅ Regular post validation:', { isValid, hasContent: !!content.trim(), hasFile: !!selectedFile });
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
      } else if (postType === 'evento') {
        // Valid event categories from database constraint
        const validCategories = ['conference', 'seminar', 'workshop', 'hackathon', 'webinar', 'networking', 'career_fair'];
        
        const validation = {
          hasTitle: evento.title && evento.title.trim().length >= 5,
          hasDescription: evento.description && evento.description.trim().length >= 10,
          hasStartDate: !!evento.start_date,
          hasLocation: evento.location && evento.location.trim().length >= 3,
          validCategory: evento.category && validCategories.includes(evento.category),
          validLocationType: evento.location_type && ['presencial', 'virtual', 'híbrido'].includes(evento.location_type)
        };
        
        const isValid = validation.hasTitle && 
                        validation.hasDescription && 
                        validation.hasStartDate && 
                        validation.hasLocation && 
                        validation.validCategory && 
                        validation.validLocationType;
        
        console.log('🎪 Event validation:', { 
          ...validation, 
          isValid,
          eventData: {
            title: evento.title,
            titleLength: evento.title.length,
            description: evento.description,
            descriptionLength: evento.description.length,
            start_date: evento.start_date,
            location: evento.location,
            locationLength: evento.location.length,
            category: evento.category,
            location_type: evento.location_type
          }
        });
        
        if (!isValid) {
          const missingFields = [];
          if (!validation.hasTitle) missingFields.push(`título (actual: "${evento.title || ''}" - necesita mínimo 5 caracteres)`);
          if (!validation.hasDescription) missingFields.push(`descripción (actual: "${evento.description || ''}" - necesita mínimo 10 caracteres)`);
          if (!validation.hasStartDate) missingFields.push(`fecha de inicio (actual: "${evento.start_date || ''}")`);
          if (!validation.hasLocation) missingFields.push(`ubicación (actual: "${evento.location || ''}" - necesita mínimo 3 caracteres)`);
          if (!validation.validCategory) missingFields.push(`categoría válida (actual: "${evento.category || ''}" - debe ser una de: ${validCategories.join(', ')})`);
          if (!validation.validLocationType) missingFields.push(`tipo de ubicación válido (actual: "${evento.location_type || ''}" - debe ser: presencial, virtual, o híbrido)`);
          
          console.warn('❌ Event validation failed. Missing/invalid fields:', missingFields);
        }
        
        return isValid;
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

      {postType === 'regular' && !selectedFile && (
        <TextBackgroundPalette
          selectedBackground={contentStyle.backgroundKey}
          onBackgroundChange={setContentStyle}
          disabled={!!selectedFile}
        />
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

      {postType === 'evento' && (
        <>
          <EventCreatorForm 
            event={evento} 
            setEvent={setEvento}
          />
          
          {/* Debug panel for event validation - remove in production */}
          <div className="mt-4 p-3 border border-orange-200 bg-orange-50 rounded-lg text-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">🔍 Estado de Validación:</span>
              <span className={`px-2 py-1 rounded ${isFormValid() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isFormValid() ? 'Válido ✅' : 'Inválido ❌'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Título: {evento.title.length >= 5 ? '✅' : '❌'} ({evento.title.length}/5)</div>
              <div>Descripción: {evento.description.length >= 10 ? '✅' : '❌'} ({evento.description.length}/10)</div>
              <div>Fecha: {evento.start_date ? '✅' : '❌'}</div>
              <div>Ubicación: {evento.location.length >= 3 ? '✅' : '❌'} ({evento.location.length}/3)</div>
              <div>Categoría: {['conference', 'seminar', 'workshop', 'hackathon', 'webinar', 'networking', 'career_fair'].includes(evento.category) ? '✅' : '❌'}</div>
              <div>Tipo: {['presencial', 'virtual', 'híbrido'].includes(evento.location_type) ? '✅' : '❌'}</div>
            </div>
          </div>
        </>
      )}

      {/* Marketplace creator removed for performance */}

      {postType === 'regular' && (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <AttachmentInput
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              type="image"
              label="Fotos y Videos"
              showLabel={true}
              buttonSize="sm"
              buttonClassName="flex-1 sm:flex-none justify-center"
              accept="image/*,video/*"
            />
            <AttachmentInput
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              type="file"
              showLabel={true}
              label="Archivos"
              buttonSize="sm"
              buttonClassName="flex-1 sm:flex-none justify-center"
              accept="*/*"
            />
          </div>

          {selectedFile && (
            <AttachmentPreview
              previews={[URL.createObjectURL(selectedFile)]}
              files={[selectedFile]}
              onRemove={removeAttachment}
              className="w-full"
              previewClassName="w-full h-40 sm:h-48 object-cover rounded-lg"
            />
          )}
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
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
