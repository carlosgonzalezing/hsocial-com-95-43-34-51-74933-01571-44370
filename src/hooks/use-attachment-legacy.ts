
import { useState, useRef } from "react";

export interface Attachment {
  url: string;
  type: string;
}

export function useAttachment() {
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const url = URL.createObjectURL(file);
          setAttachment({
            url,
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file'
          });
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const removeAttachment = () => {
    if (attachment?.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachment(null);
    setUploadProgress(0);
  };

  return {
    attachment,
    isUploading,
    uploadProgress,
    handleFileSelect,
    removeAttachment,
    fileInputRef
  };
}
