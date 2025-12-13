
import { supabase } from "@/integrations/supabase/client";
import { uploadToSupabase } from "@/lib/storage/cloudflare-r2";

export async function uploadFile(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    console.log('Uploading file:', { fileName, fileSize: file.size, fileType: file.type });
    
    // Upload to Supabase Storage
    const publicUrl = await uploadToSupabase(file, fileName);

    console.log('File uploaded successfully:', { fileName, publicUrl });

    return {
      url: publicUrl,
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
