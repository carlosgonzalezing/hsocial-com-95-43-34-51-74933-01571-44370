import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { X } from "lucide-react";
import { useState } from "react";

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
  previewClassName = "",
  isMultiple = false,
  onRemoveIndex,
  isScrollable = false
}: AttachmentPreviewProps & { isMultiple?: boolean; onRemoveIndex?: (index: number) => void; isScrollable?: boolean }) {
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  // Handle legacy single attachment prop
  if (attachment) {
    return (
      <div
        className="fixed bottom-28 left-4 right-4 w-fit max-w-[90vw] max-h-80 bg-background dark:bg-card border border-border shadow-2xl rounded-lg p-4 z-[100]"
      >
        {attachment.type === 'image' ? (
          <OptimizedImage 
            src={attachment.url} 
            alt="Preview" 
            width={200}
            height={200}
            className="max-h-64 max-w-full object-contain rounded-md"
            lazy={false}
          />
        ) : attachment.type === 'video' ? (
          <video 
            src={attachment.url} 
            className="max-h-64 max-w-full object-contain rounded-md"
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
          className="absolute top-2 right-2 h-6 w-6 rounded-full shadow-lg"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Handle multiple previews/files
  if (previews && previews.length > 0) {
    if (isMultiple && files && files.length > 1) {
      // Display all previews as a scrollable grid
      return (
        <div className={`w-full ${isScrollable ? 'overflow-x-auto pb-2' : ''}`}>
          <div className={`flex gap-2 ${isScrollable ? 'w-full pb-2' : 'flex-wrap'}`}>
            {previews.map((preview, index) => {
              const file = files[index];
              const isImage = file?.type.startsWith('image/');
              const isVideo = file?.type.startsWith('video/');

              return (
                <div key={index} className="relative flex-shrink-0">
                  {isImage ? (
                    <OptimizedImage 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className="h-24 w-24 object-cover rounded-md"
                      lazy={false}
                    />
                  ) : isVideo ? (
                    <div className="relative w-24 h-24 bg-black rounded-md flex items-center justify-center">
                      <video
                        src={preview}
                        className="w-full h-full object-cover rounded-md"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 w-24 bg-muted rounded-md flex items-center justify-center px-2">
                      <span className="text-xs text-center truncate">{file?.name}</span>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={() => onRemoveIndex?.(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Single preview
    const file = files && files.length > 0 ? files[0] : null;
    const isImage = file ? file.type.startsWith('image/') : true;
    const isVideo = file ? file.type.startsWith('video/') : false;

    return (
      <div className={`relative w-fit max-h-48 ${className}`}>
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
