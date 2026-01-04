
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { X } from "lucide-react";

export interface Attachment {
  url: string;
  type: string;
}

export interface AttachmentPreviewProps {
  attachment?: Attachment;
  onRemove: () => void;
  // Support for multiple files/previews
  previews?: string[];
  files?: File[];
  className?: string;
  previewClassName?: string;
}

export function AttachmentPreview({ 
  attachment, 
  onRemove,
  previews,
  files,
  className = "",
  previewClassName = ""
}: AttachmentPreviewProps) {
  // Handle legacy single attachment prop
  if (attachment) {
    return (
      <div className="relative">
        {attachment.type === 'image' ? (
          <OptimizedImage 
            src={attachment.url} 
            alt="Preview" 
            width={96}
            height={96}
            className="h-24 w-24 object-cover rounded-md"
            lazy={false}
          />
        ) : attachment.type === 'video' ? (
          <video 
            src={attachment.url} 
            className="h-24 w-24 object-cover rounded-md"
            controls
          />
        ) : (
          <div className="h-24 w-24 bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-center">File</span>
          </div>
        )}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-5 w-5 rounded-full"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Handle multiple previews/files
  if (previews && previews.length > 0) {
    const file = files && files.length > 0 ? files[0] : null;
    const isImage = file ? file.type.startsWith('image/') : true;
    const isVideo = file ? file.type.startsWith('video/') : false;

    return (
      <div className={`relative ${className}`}>
        {isImage ? (
          <OptimizedImage 
            src={previews[0]} 
            alt="Vista previa del archivo" 
            width={96}
            height={96}
            className={previewClassName || "h-24 w-24 object-cover rounded-md"}
            lazy={false}
          />
        ) : isVideo ? (
          <video 
            src={previews[0]} 
            className={previewClassName || "h-24 w-24 object-cover rounded-md"}
            controls
          />
        ) : (
          <div className={previewClassName || "h-24 w-24 bg-muted rounded-md flex items-center justify-center px-3"}>
            <span className="text-xs truncate" title={file?.name || "Archivo"}>{file?.name || "Archivo"}</span>
          </div>
        )}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-5 w-5 rounded-full"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return null;
}
