
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { IdeaJson, JsonSafeParticipant } from "./types";
import { Json } from "@/types/database/json.types";

/**
 * Adds a participant to an idea
 */
export async function addParticipant(
  postId: string,
  userId: string,
  profession: string
): Promise<boolean> {
  try {
    console.log(`Añadiendo participante: ${userId} a idea: ${postId} con profesión: ${profession}`);
    
    // Get current idea data
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("idea")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error("Error al obtener datos del post:", postError);
      throw postError;
    }

    // Safely cast the idea data to our expected type
    const ideaData: IdeaJson = postData.idea ? 
      (typeof postData.idea === 'object' ? postData.idea as IdeaJson : {}) : {};
    
    console.log("Datos de la idea:", ideaData);
    
    // Asegurar que participants sea un array
    const participants = ideaData.participants || [];
    console.log("Participantes actuales:", participants);

    // Check if user is already a participant
    const isParticipant = participants.some(
      (p) => {
        if (typeof p === 'string') return p === userId;
        return typeof p === 'object' && p !== null && p.user_id === userId;
      }
    );

    if (isParticipant) {
      console.log("El usuario ya es participante");
      return false; // Already a participant
    }

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error al obtener datos del usuario:", userError);
      throw userError;
    }

    console.log("Datos del usuario:", userData);

    // Create new participant object
    const newParticipant: JsonSafeParticipant = {
      user_id: userId,
      profession,
      joined_at: new Date().toISOString(),
      username: userData.username || "Usuario",
      avatar_url: userData.avatar_url,
    };

    console.log("Nuevo participante:", newParticipant);

    // Add participant to the idea
    const updatedParticipants = [...participants, newParticipant];
    const updatedIdea = {
      ...ideaData,
      participants: updatedParticipants,
    };

    console.log("Idea actualizada:", updatedIdea);

    // Update the post
    const { error: updateError } = await supabase
      .from("posts")
      .update({ idea: updatedIdea })
      .eq("id", postId);

    if (updateError) {
      console.error("Error al actualizar el post:", updateError);
      toast({
        title: "Error",
        description: "No se pudo unir a la idea. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      return false;
    }

    // Also add to backup table
    const { error: backupError } = await supabase
      .from("idea_participants")
      .insert({
        post_id: postId,
        user_id: userId,
        profession: profession
      });
      
    if (backupError) {
      console.error("Error al agregar a tabla de respaldo:", backupError);
      // No fail if backup fails, the JSON update worked
    }

    // Send notification to the idea creator
    const { data: postAuthorData, error: authorError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!authorError && postAuthorData.user_id !== userId) {
      await supabase.from("notifications").insert({
        type: "idea_join",
        sender_id: userId,
        receiver_id: postAuthorData.user_id,
        post_id: postId,
        read: false,
      });
    }

    return true;
  } catch (error) {
    console.error("Error adding participant:", error);
    toast({
      title: "Error",
      description: "No se pudo unir a la idea. Por favor intenta de nuevo.",
      variant: "destructive",
    });
    return false;
  }
}

/**
 * Removes a participant from an idea
 */
export async function removeParticipant(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    console.log(`Eliminando participante: ${userId} de idea: ${postId}`);
    
    // Get current idea data
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("idea, user_id")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error("Error al obtener datos del post:", postError);
      throw postError;
    }

    // Safely cast the idea data to our expected type
    const ideaData: IdeaJson = postData.idea ? 
      (typeof postData.idea === 'object' ? postData.idea as IdeaJson : {}) : {};
    
    const participants = ideaData.participants || [];
    console.log("Participantes actuales:", participants);

    // Check if user is a participant
    const isParticipant = participants.some(
      (p) => {
        if (typeof p === 'string') return p === userId;
        return typeof p === 'object' && p !== null && p.user_id === userId;
      }
    );

    if (!isParticipant) {
      console.log("El usuario no es participante");
      toast({
        title: "Error",
        description: "No eres participante de esta idea",
        variant: "destructive",
      });
      return false;
    }

    // Remove the participant
    const updatedParticipants = participants.filter(
      (p) => {
        if (typeof p === 'string') return p !== userId;
        return typeof p === 'object' && p !== null && p.user_id !== userId;
      }
    );
    const updatedIdea = {
      ...ideaData,
      participants: updatedParticipants,
    };

    console.log("Idea actualizada:", updatedIdea);

    // Update the post
    const { error: updateError } = await supabase
      .from("posts")
      .update({ idea: updatedIdea })
      .eq("id", postId);

    if (updateError) {
      console.error("Error al actualizar el post:", updateError);
      toast({
        title: "Error",
        description: "No se pudo abandonar la idea. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      return false;
    }

    // Also remove from backup table
    const { error: backupError } = await supabase
      .from("idea_participants")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
      
    if (backupError) {
      console.error("Error al eliminar de tabla de respaldo:", backupError);
      // No fail if backup fails
    }

    // Notify idea creator (if the user is not the creator)
    if (postData.user_id !== userId) {
      await supabase.from("notifications").insert({
        type: "idea_leave",
        sender_id: userId,
        receiver_id: postData.user_id,
        post_id: postId,
        read: false,
      });
    }

    return true;
  } catch (error) {
    console.error("Error removing participant:", error);
    toast({
      title: "Error",
      description: "No se pudo abandonar la idea. Por favor intenta de nuevo.",
      variant: "destructive",
    });
    return false;
  }
}
