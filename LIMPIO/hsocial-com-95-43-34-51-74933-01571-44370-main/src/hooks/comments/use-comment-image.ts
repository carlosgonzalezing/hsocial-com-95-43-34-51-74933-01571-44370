
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCommentImage(setCommentImage?: (file: File | null) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Update image preview when image changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo debe ser una imagen"
      });
      return;
    }

    // Check max size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La imagen no debe exceder 5MB"
      });
      return;
    }

    if (setCommentImage) {
      setCommentImage(file);
    }
    
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (setCommentImage) {
      setCommentImage(null);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    fileInputRef,
    imagePreview,
    handleImageChange,
    handleRemoveImage
  };
}
