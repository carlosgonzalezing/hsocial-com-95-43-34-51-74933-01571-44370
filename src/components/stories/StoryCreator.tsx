import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useStoryCreator } from "@/hooks/stories/use-story-creator";
import { useToast } from "@/hooks/use-toast";

interface StoryCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoryCreator({ open, onOpenChange }: StoryCreatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const { createStory, isCreating } = useStoryCreator();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCreate = async () => {
    if (!file && !text) {
      toast({
        title: "Error",
        description: "Debes agregar una imagen o texto",
        variant: "destructive",
      });
      return;
    }

    const success = await createStory(file, text);
    if (success) {
      setFile(null);
      setPreview(null);
      setText("");
      onOpenChange(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Historia</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          {preview ? (
            <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
              {text && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-2xl font-bold text-center px-4 drop-shadow-lg">
                    {text}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[9/16] rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-4 bg-muted/50">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Sube una imagen para tu historia
                </p>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </Button>
              </div>
            </div>
          )}

          {/* Text Overlay */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Texto (opcional)
            </label>
            <Textarea
              placeholder="Escribe algo sobre tu historia..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {text.length}/200
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Publicando..." : "Publicar Historia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
