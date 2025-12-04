
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createPost } from "@/lib/api/posts/create";

export function usePostCreator() {
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const createPostFunction = async (postData: any, isIncognito: boolean = false) => {
    try {
      setIsPosting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para crear un post",
        });
        return false;
      }

      // Handle file upload logic here if needed
      let file = null; // This would come from the attachment

      const result = await createPost({
        content: postData.content,
        file,
        pollData: postData.poll ? {
          question: postData.poll.question,
          options: postData.poll.options
        } : null,
        ideaData: postData.idea ? {
          title: postData.idea.title,
          description: postData.idea.description,
          participants: []
        } : null,
        marketplaceData: postData.marketplace ? {
          title: postData.marketplace.title,
          description: postData.marketplace.description,
          subject: postData.marketplace.title,
          price: postData.marketplace.price || 0,
          contact_info: postData.marketplace.contact_info
        } : null,
        visibility: postData.visibility
      });

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Post creado exitosamente",
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Error al crear el post",
        });
        return false;
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error inesperado al crear el post",
      });
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  return {
    isPosting,
    createPost: createPostFunction
  };
}
