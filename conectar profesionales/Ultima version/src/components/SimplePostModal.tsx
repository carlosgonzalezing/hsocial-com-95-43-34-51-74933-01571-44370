import { useState, useEffect, useRef } from "react";
import { X, Clock, Image, Plus, ChevronDown, Lightbulb, Calendar, BarChart3, Briefcase, FileText, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { uploadMediaFile, getMediaType } from "@/lib/api/posts/storage";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SimplePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Visibility = 'public' | 'friends' | 'private';

const visibilityOptions = [
  { value: 'public', label: 'Cualquiera' },
  { value: 'friends', label: 'Amigos' },
  { value: 'private', label: 'Solo yo' },
];

export function SimplePostModal({ open, onOpenChange }: SimplePostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<{ avatar_url: string | null; username: string } | null>(null);
  const [showPostTypeMenu, setShowPostTypeMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data);
    };
    
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    // Crear previews para todos los archivos
    const previews: string[] = [];
    selectedFiles.forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        previews.push(URL.createObjectURL(file));
      } else {
        previews.push('');
      }
    });
    setFilePreviews(previews);
    
    // Cleanup function
    return () => {
      previews.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [selectedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, 10);
      setSelectedFiles(newFiles);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      // Upload all files if multiple attachments
      const mediaUrls: string[] = [];
      let mediaType = null;

      if (selectedFiles.length > 0) {
        // Upload all selected files
        for (const file of selectedFiles) {
          const url = await uploadMediaFile(file);
          if (url) mediaUrls.push(url);
          if (!mediaType) mediaType = getMediaType(file);
        }
      }

      // Prepare the post data
      const postData: any = {
        user_id: user.id,
        content: content.trim() || null,
        visibility,
        media_type: mediaType,
        post_type: 'regular'
      };

      // Store media URLs in the appropriate column
      if (mediaUrls.length > 1) {
        // Multiple files: use media_urls column (JSONB array)
        postData.media_urls = mediaUrls;
      } else if (mediaUrls.length === 1) {
        // Single file: use both columns for backwards compatibility
        postData.media_url = mediaUrls[0];
        postData.media_urls = mediaUrls;
      }

      const { error } = await supabase.from('posts').insert(postData);

      if (error) throw error;

      toast({ title: "¡Publicado!", description: "Tu publicación se creó correctamente" });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["personalized-feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      
      setContent("");
      setSelectedFiles([]);
      setFilePreviews([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo publicar" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const currentVisibility = visibilityOptions.find(v => v.value === visibility);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={() => onOpenChange(false)} className="p-1">
          <X className="h-6 w-6 text-foreground" />
        </button>
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              {profile?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-foreground">
                {currentVisibility?.label}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {visibilityOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value}
                  onClick={() => setVisibility(option.value as Visibility)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
            className="rounded-full px-4"
          >
            {isSubmitting ? "..." : "Publicar"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte tus ideas..."
          className="w-full h-[calc(100vh-180px)] resize-none bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
        />

        {/* File Previews - Mejorados para mejor visibilidad */}
        {filePreviews.length > 0 && (
          <div className="mt-4 mb-20 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-muted-foreground">
                {filePreviews.length} {filePreviews.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  {preview ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                      <img 
                        src={preview} 
                        alt={`Vista previa ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center p-4">
                      <span className="text-xs text-muted-foreground text-center truncate">{selectedFiles[index]?.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-end gap-4 px-4 py-3 border-t border-border bg-background">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2"
        >
          <Image className="h-6 w-6 text-muted-foreground" />
        </button>
        <button 
          className="p-2 relative"
          onClick={() => setShowPostTypeMenu(!showPostTypeMenu)}
        >
          <Plus className="h-6 w-6 text-muted-foreground" />
        </button>
      </div>

      {/* Post Type Menu */}
      {showPostTypeMenu && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={() => setShowPostTypeMenu(false)}>
          <div 
            className="bg-background w-full rounded-t-3xl p-6 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            
            <h3 className="text-lg font-semibold mb-6 text-center">Tipo de publicación</h3>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Idea */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors"
                onClick={() => {
                  toast({ title: "Próximamente", description: "Función en desarrollo" });
                  setShowPostTypeMenu(false);
                }}
              >
                <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Lightbulb className="h-7 w-7 text-yellow-600 dark:text-yellow-500" />
                </div>
                <span className="text-sm font-medium">Idea</span>
              </button>

              {/* Evento */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors"
                onClick={() => {
                  toast({ title: "Próximamente", description: "Función en desarrollo" });
                  setShowPostTypeMenu(false);
                }}
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-500" />
                </div>
                <span className="text-sm font-medium">Evento</span>
              </button>

              {/* Encuesta */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors"
                onClick={() => {
                  toast({ title: "Próximamente", description: "Función en desarrollo" });
                  setShowPostTypeMenu(false);
                }}
              >
                <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-purple-600 dark:text-purple-500" />
                </div>
                <span className="text-sm font-medium">Encuesta</span>
              </button>

              {/* Empleo */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors"
                onClick={() => {
                  toast({ title: "Próximamente", description: "Función en desarrollo" });
                  setShowPostTypeMenu(false);
                }}
              >
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-green-600 dark:text-green-500" />
                </div>
                <span className="text-sm font-medium">Empleo</span>
              </button>

              {/* Documento */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors"
                onClick={() => {
                  toast({ title: "Próximamente", description: "Función en desarrollo" });
                  setShowPostTypeMenu(false);
                }}
              >
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-orange-600 dark:text-orange-500" />
                </div>
                <span className="text-sm font-medium">Documento</span>
              </button>

              {/* Servicios */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors"
                onClick={() => {
                  toast({ title: "Próximamente", description: "Función en desarrollo" });
                  setShowPostTypeMenu(false);
                }}
              >
                <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                  <Wrench className="h-7 w-7 text-teal-600 dark:text-teal-500" />
                </div>
                <span className="text-sm font-medium">Servicios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
