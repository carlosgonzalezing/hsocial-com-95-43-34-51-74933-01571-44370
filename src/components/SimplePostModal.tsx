import { useState, useEffect, useRef } from "react";
import { X, Clock, Image, Plus, ChevronDown } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<{ avatar_url: string | null; username: string } | null>(null);
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
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setFilePreview(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setFilePreview(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) return;
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      if (selectedFile) {
        mediaUrl = await uploadMediaFile(selectedFile);
        mediaType = getMediaType(selectedFile);
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim() || null,
        visibility,
        media_url: mediaUrl,
        media_type: mediaType,
        post_type: 'regular'
      });

      if (error) throw error;

      toast({ title: "¡Publicado!", description: "Tu publicación se creó correctamente" });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["personalized-feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      
      setContent("");
      setSelectedFile(null);
      setFilePreview(null);
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
            disabled={isSubmitting || (!content.trim() && !selectedFile)}
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

        {/* File Preview */}
        {filePreview && (
          <div className="relative mt-4 inline-block">
            <img src={filePreview} alt="Preview" className="max-h-40 rounded-lg" />
            <button
              onClick={() => { setSelectedFile(null); setFilePreview(null); }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {selectedFile && !filePreview && (
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-end gap-4 px-4 py-3 border-t border-border bg-background">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2"
        >
          <Image className="h-6 w-6 text-muted-foreground" />
        </button>
        <button className="p-2">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
