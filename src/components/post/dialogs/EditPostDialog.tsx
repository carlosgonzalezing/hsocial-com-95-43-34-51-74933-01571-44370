
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface EditPostDialogProps {
  postId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (content: string) => void;
}

export function EditPostDialog({ postId, isOpen, onOpenChange, onSave }: EditPostDialogProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      const loadPost = async () => {
        try {
          setIsLoading(true);
          const { data } = await (supabase as any)
            .from("posts")
            .select("content")
            .eq("id", postId)
            .single();
          
          if (data?.content) {
            setContent(data.content);
          }
        } catch (error) {
          console.error("Error loading post:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadPost();
    }
  }, [isOpen, postId]);

  const handleSave = () => {
    onSave(content);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar publicación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás pensando?"
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
