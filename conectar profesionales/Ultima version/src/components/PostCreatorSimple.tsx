import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image, Video, FileText, Lightbulb, FolderKanban } from "lucide-react";
import { uploadMediaFile, getMediaType } from "@/lib/api/posts/storage";
import { useQueryClient } from "@tanstack/react-query";

interface PostCreatorSimpleProps {
  onPostCreated?: () => void;
}

export function PostCreatorSimple({ onPostCreated }: PostCreatorSimpleProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [postType, setPostType] = useState<'regular' | 'idea' | 'project'>('regular');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Escribe algo o adjunta un archivo" });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({ variant: "destructive", title: "Error", description: "Inicia sesión primero" });
        return;
      }

      let mediaUrl = null;
      let mediaType = null;

      if (selectedFile) {
        mediaUrl = await uploadMediaFile(selectedFile);
        mediaType = getMediaType(selectedFile);
      }

      const { error } = await supabase.from('posts').insert({
        user_id: session.user.id,
        content: content.trim() || null,
        visibility: 'public',
        media_url: mediaUrl,
        media_type: mediaType,
        post_type: postType
      });

      if (error) throw error;

      toast({ title: "¡Publicado!", description: "Tu publicación se creó correctamente" });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      
      setContent("");
      setSelectedFile(null);
      setPostType('regular');
      onPostCreated?.();
    } catch (error) {
      console.error('Error:', error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo publicar" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Selector de tipo */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={postType === 'regular' ? 'default' : 'outline'}
          onClick={() => setPostType('regular')}
        >
          Regular
        </Button>
        <Button
          size="sm"
          variant={postType === 'idea' ? 'default' : 'outline'}
          onClick={() => setPostType('idea')}
        >
          <Lightbulb className="h-4 w-4 mr-1" />
          Idea
        </Button>
        <Button
          size="sm"
          variant={postType === 'project' ? 'default' : 'outline'}
          onClick={() => setPostType('project')}
        >
          <FolderKanban className="h-4 w-4 mr-1" />
          Proyecto
        </Button>
      </div>

      {/* Área de texto */}
      <Textarea
        placeholder={`¿Qué estás pensando?${postType === 'idea' ? ' Comparte tu idea...' : postType === 'project' ? ' Describe tu proyecto...' : ''}`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[120px] resize-none"
      />

      {/* Adjuntos */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Image className="h-4 w-4 mr-1" />
          Foto/Video
        </Button>
        {selectedFile && (
          <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
        )}
      </div>

      {/* Botón publicar */}
      <Button
        onClick={handleSubmit}
        disabled={isUploading || (!content.trim() && !selectedFile)}
        className="w-full"
      >
        {isUploading ? "Publicando..." : "Publicar"}
      </Button>
    </Card>
  );
}
