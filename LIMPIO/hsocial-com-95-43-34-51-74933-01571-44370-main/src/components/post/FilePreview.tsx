
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  
  // Create preview URL for the file when the component mounts
  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Clean up URL when unmounting
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);
  
  if (file.type.startsWith('image/') && preview) {
    return (
      <div className="relative mt-3">
        <img 
          src={preview} 
          alt="Vista previa de imagen" 
          className="max-w-full h-auto rounded-lg max-h-[300px] object-contain border border-border"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  if (file.type.startsWith('video/')) {
    const videoUrl = URL.createObjectURL(file);
    return (
      <div className="relative mt-3">
        <video 
          src={videoUrl} 
          controls
          className="max-w-full rounded-lg border border-border"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  if (file.type.startsWith('audio/')) {
    const audioUrl = URL.createObjectURL(file);
    return (
      <div className="relative mt-3 p-3 bg-muted/30 rounded-lg">
        <audio 
          src={audioUrl} 
          controls
          className="w-full"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="relative mt-3 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
      <span className="truncate max-w-[85%]">{file.name}</span>
      <Button
        variant="destructive"
        size="icon"
        className="h-6 w-6 rounded-full"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
