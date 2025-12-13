import { useState, useRef } from "react";

export type AttachmentType = 'image' | 'video' | 'audio' | 'file' | 'document';

export interface UseAttachmentOptions {
  type?: AttachmentType;
  multiple?: boolean;
  validation?: {
    maxSizeInMB?: number;
    allowedTypes?: string[];
  };
}

export function useAttachment({
  type = 'image',
  multiple = false,
  validation = {},
  onAttachmentChange
}: UseAttachmentOptions & {
  onAttachmentChange?: (files: File[] | null) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file size
    if (validation.maxSizeInMB) {
      const maxSizeInBytes = validation.maxSizeInMB * 1024 * 1024;
      const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeInBytes);
      
      if (oversizedFiles.length > 0) {
        console.error(`Some files exceed the maximum size of ${validation.maxSizeInMB}MB`);
        return;
      }
    }
    
    // Validate file types if specified
    if (validation.allowedTypes && validation.allowedTypes.length > 0) {
      const invalidFiles = selectedFiles.filter(
        file => !validation.allowedTypes?.some(allowedType => 
          file.type.startsWith(allowedType) || 
          file.type === allowedType
        )
      );
      
      if (invalidFiles.length > 0) {
        console.error(`Some files have invalid types. Allowed types: ${validation.allowedTypes.join(', ')}`);
        return;
      }
    }
    
    // Create preview URLs for image files
    const newPreviews = [...previews];
    const newFiles = [...files];
    
    selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      } else {
        // For non-image files, just push an empty string as placeholder
        newPreviews.push('');
      }
      newFiles.push(file);
    });
    
    if (!multiple) {
      // If not multiple, keep only the last selected file
      setFiles([newFiles[newFiles.length - 1]]);
      setPreviews([newPreviews[newPreviews.length - 1]]);
      if (onAttachmentChange) onAttachmentChange([newFiles[newFiles.length - 1]]);
    } else {
      setFiles(newFiles);
      setPreviews(newPreviews);
      if (onAttachmentChange) onAttachmentChange(newFiles);
    }
  };
  
  const removeAttachment = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke object URL to avoid memory leaks
    if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    if (onAttachmentChange) onAttachmentChange(newFiles.length > 0 ? newFiles : null);
  };
  
  const cleanup = () => {
    // Cleanup object URLs when component unmounts
    previews.forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
  };
  
  return {
    files,
    previews,
    fileInputRef,
    handleAttachmentChange,
    removeAttachment,
    cleanup
  };
}
