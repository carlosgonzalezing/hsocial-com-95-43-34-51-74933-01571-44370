
import { supabase } from "@/integrations/supabase/client";
import { IdeaJson, JsonSafeParticipant } from "./types";

// Helper functions for updating participants in the idea JSON field
export async function updateParticipantsJson(userId: string, postId: string, profile: any) {
  try {
    const userProfile = profile || {};
    
    // Get user's profession from the idea_participants table
    const { data: participantData } = await supabase
      .from("idea_participants")
      .select("profession")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single();
    
    const profession = participantData?.profession || userProfile.career || "No especificado";
    
    // Get post and idea data
    const { data: post } = await supabase
      .from("posts")
      .select("idea, user_id")
      .eq("id", postId)
      .single();
    
    if (!post || !post.idea) {
      console.error("No se encontró la idea");
      return;
    }
    
    // Extract idea data safely
    const ideaData: IdeaJson = typeof post.idea === 'object' ? {...post.idea} : {};
    
    // Get or initialize participants array
    let participants: (JsonSafeParticipant | string)[] = [];
    if (ideaData && 'participants' in ideaData && Array.isArray(ideaData.participants)) {
      participants = [...ideaData.participants];
    }
    
    // Check if user is already in participants list
    const userAlreadyJoined = participants.some(p => {
      if (typeof p === 'string') {
        return p === userId;
      }
      if (typeof p === 'object' && p !== null && 'user_id' in p) {
        return p.user_id === userId;
      }
      return false;
    });
    
    if (!userAlreadyJoined) {
      // Create new participant entry as a simple object
      const newParticipant: JsonSafeParticipant = {
        user_id: userId,
        profession: profession,
        joined_at: new Date().toISOString(),
        username: userProfile.username || "Usuario",
        avatar_url: userProfile.avatar_url || null
      };
      
      // Add to participants array
      participants.push(newParticipant);
      
      // Update idea in database with a plain object
      await supabase
        .from("posts")
        .update({
          idea: {
            ...ideaData,
            participants: participants
          }
        })
        .eq("id", postId);
    }
  } catch (error) {
    console.error("Error updating JSON field:", error);
  }
}

// Function to remove a participant from the JSON field
export async function removeParticipantFromJson(userId: string, postId: string) {
  try {
    // Get post and idea data
    const { data: post } = await supabase
      .from("posts")
      .select("idea")
      .eq("id", postId)
      .single();
    
    if (!post || !post.idea) {
      console.error("No se encontró la idea");
      return;
    }
    
    // Extract idea data safely
    const ideaData: IdeaJson = typeof post.idea === 'object' ? {...post.idea} : {};
    
    // Get participants array if it exists
    if (ideaData && 'participants' in ideaData && Array.isArray(ideaData.participants)) {
      // Filter out the user
      const updatedParticipants = ideaData.participants.filter(p => {
        if (typeof p === 'string') {
          return p !== userId;
        }
        if (typeof p === 'object' && p !== null && 'user_id' in p) {
          return p.user_id !== userId;
        }
        return true;
      });
      
      // Update idea in database
      await supabase
        .from("posts")
        .update({
          idea: {
            ...ideaData,
            participants: updatedParticipants
          }
        })
        .eq("id", postId);
    }
  } catch (error) {
    console.error("Error removing participant from JSON:", error);
  }
}
