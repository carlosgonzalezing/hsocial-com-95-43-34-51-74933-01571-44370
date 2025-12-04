
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadWithOptimization } from "@/lib/storage/cloudflare-r2";

export function useProfileImage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (
    type: "avatar" | "cover",
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<string> => {
    if (!e.target.files || e.target.files.length === 0) {
      return "";
    }

    const file = e.target.files[0];
    setLoading(true);

    try {
      // Validaciones
      if (file.size > 5 * 1024 * 1024) {
        // 5MB max
        throw new Error("La imagen no puede ser mayor a 5MB");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Solo se permiten archivos de imagen");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para subir imágenes");

      // Crear un nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${type}_${Date.now()}.${fileExt}`;

      // Subir archivo a Cloudflare R2
      const publicUrl = await uploadWithOptimization(
        file,
        `profiles/${user.id}/${type}/${fileName}`
      );

      // Actualizar perfil en la base de datos
      const updateData =
        type === "avatar"
          ? { avatar_url: publicUrl }
          : { cover_url: publicUrl };

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al subir imagen",
        description: error.message,
      });
      return "";
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleImageUpload,
  };
}
