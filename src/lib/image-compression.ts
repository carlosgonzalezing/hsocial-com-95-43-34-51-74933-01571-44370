/**
 * Compresses an image file to reduce its size while maintaining quality
 */
export async function compressImage(
  file: File, 
  maxSizeMB: number = 2,
  maxWidthOrHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidthOrHeight) {
          height = (height * maxWidthOrHeight) / width;
          width = maxWidthOrHeight;
        }
      } else {
        if (height > maxWidthOrHeight) {
          width = (width * maxWidthOrHeight) / height;
          height = maxWidthOrHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }

          // Check if we need further compression
          const sizeInMB = blob.size / (1024 * 1024);
          
          if (sizeInMB <= maxSizeMB) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            // Recursively compress with lower quality
            const newQuality = Math.max(0.1, quality - 0.1);
            canvas.toBlob(
              (secondBlob) => {
                if (!secondBlob) {
                  reject(new Error('Second compression failed'));
                  return;
                }
                const finalFile = new File([secondBlob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(finalFile);
              },
              'image/jpeg',
              newQuality
            );
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validates file size and type before processing
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): boolean {
  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Check file size
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > maxSizeMB) {
    throw new Error(`La imagen no puede ser mayor a ${maxSizeMB}MB`);
  }

  return true;
}

/**
 * Process and compress image if needed
 */
export async function processImageForUpload(file: File): Promise<File> {
  try {
    validateImageFile(file);
    
    // If file is already small enough, return as is
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB <= 2) {
      return file;
    }

    // Compress the image
    return await compressImage(file);
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}