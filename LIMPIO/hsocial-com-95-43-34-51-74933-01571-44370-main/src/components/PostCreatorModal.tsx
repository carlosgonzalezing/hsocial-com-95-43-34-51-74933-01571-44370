import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PostCreator } from "./PostCreator";
import { toast } from "@/hooks/use-toast";

interface PostCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusOnOpen?: boolean;
  openWithMedia?: boolean;
  selectedMood?: any;
  selectedFile?: File | null;
}

export function PostCreatorModal({ 
  open, 
  onOpenChange, 
  focusOnOpen = false,
  openWithMedia = false,
  selectedMood = null,
  selectedFile = null
}: PostCreatorModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [initialContent, setInitialContent] = useState("");

  useEffect(() => {
    if (open && focusOnOpen && textareaRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open, focusOnOpen]);

  // Set initial content based on selected mood
  useEffect(() => {
    if (selectedMood && open) {
      const moodText = selectedMood.type === 'mood' 
        ? `Sintiéndome ${selectedMood.label.toLowerCase()} ${selectedMood.emoji}`
        : `${selectedMood.emoji} ${selectedMood.label}`;
      setInitialContent(moodText);
    } else {
      setInitialContent("");
    }
  }, [selectedMood, open]);

  const handlePostCreated = () => {
    onOpenChange(false);
    toast({
      title: "¡Publicación creada!",
      description: "Tu publicación se ha compartido exitosamente",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col animate-scale-in sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Crear publicación
            {selectedMood && (
              <span className="text-lg">{selectedMood.emoji}</span>
            )}
          </DialogTitle>
          <DialogDescription>
            Comparte tus ideas, crea eventos o publica contenido con tu comunidad.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <PostCreator 
            onPostCreated={handlePostCreated}
            textareaRef={textareaRef}
            openWithMedia={openWithMedia}
            initialContent={initialContent}
            selectedFile={selectedFile}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}