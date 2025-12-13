
import { supabase } from "@/integrations/supabase/client";

export async function getPosts(userId?: string) {
  try {
    // Add a table query that includes the keys we need
    const { data: tableInfo } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    // Determine which fields exist in the posts table
    const hasSharedFields = tableInfo && tableInfo.length > 0 && 
      ('shared_post_id' in tableInfo[0] || 'shared_from' in tableInfo[0]);

    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:profiles(*),
        comments:comments(count)
      `);

    // Si hay un userId, solo obtener los posts de ese usuario
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Obtener el usuario actual para verificar si le ha dado like
    const { data: { user } } = await supabase.auth.getUser();

    const postsWithUserReactions = await Promise.all(data.map(async (post: any) => {
      const postWithExtras = { ...post };
      
      // Para cada post, vemos si hay un post compartido referenciado
      // Check for shared_post_id property before using it
      if (hasSharedFields && 'shared_post_id' in post && post.shared_post_id) {
        try {
          const { data: sharedPostData, error: sharedPostError } = await supabase
            .from("posts")
            .select(`
              *,
              profiles:profiles(*),
              comments:comments(count)
            `)
            .eq("id", post.shared_post_id)
            .single();

          if (!sharedPostError && sharedPostData) {
            postWithExtras.shared_post = {
              ...sharedPostData,
              comments_count: sharedPostData.comments?.[0]?.count || 0
            };
          }
        } catch (err) {
          console.error("Error fetching shared post:", err);
          // Continue even if shared post fetch fails
        }
      }

      // Obtener reactions count para el post
      const { count: reactionsCount } = await supabase
        .from("reactions")
        .select("*", { count: 'exact', head: true })
        .eq("post_id", post.id);
      
      // Verificar si el usuario actual ha reaccionado
      let userHasReacted = false;
      if (user) {
        const { data: userReaction } = await supabase
          .from("reactions")
          .select("reaction_type")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .maybeSingle();
        userHasReacted = !!userReaction;
      }

      return {
        ...postWithExtras,
        shared_post: postWithExtras.shared_post || null,
        shared_post_id: post.shared_post_id || null,
        shared_from: post.shared_from || null,
        userHasReacted,
        comments_count: post.comments?.[0]?.count || 0,
        user_reaction: null, // Default value
        reactions_count: reactionsCount || 0
      };
    }));

    console.log('Posts fetched with media URLs:', postsWithUserReactions.map(p => ({ id: p.id, media_url: p.media_url, media_type: p.media_type })));

    return postsWithUserReactions;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

export async function getHiddenPosts() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("hidden_posts")
      .select("post_id")
      .eq("user_id", user.id);

    if (error) throw error;
    return data.map(item => item.post_id);
  } catch (error) {
    console.error("Error fetching hidden posts:", error);
    return [];
  }
}

export async function hidePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { error } = await supabase
      .from("hidden_posts")
      .insert({ user_id: user.id, post_id: postId });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error hiding post:", error);
    throw error;
  }
}

export async function unhidePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { error } = await supabase
      .from("hidden_posts")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error unhiding post:", error);
    throw error;
  }
}

export async function createPost({ 
  content, 
  file, 
  pollData,
  ideaData,
  visibility = "public" 
}: { 
  content: string; 
  file: File | null; 
  pollData?: { question: string; options: string[] };
  ideaData?: { title: string; description: string; participants: string[] };
  visibility?: "public" | "friends" | "private";
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No user logged in");
    }

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    // Upload file if present
    if (file) {
      console.log('Uploading file:', { name: file.name, size: file.size, type: file.type });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: fileData, error: uploadError } = await supabase
        .storage
        .from("media")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: urlData } = await supabase
        .storage
        .from("media")
        .getPublicUrl(fileName);

      mediaUrl = urlData.publicUrl;
      
      // Map file type to database accepted values
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      } else {
        // Default to 'image' if type cannot be determined
        mediaType = 'image';
      }

      console.log('File uploaded successfully:', { mediaUrl, mediaType });
    }

    // Create poll object if poll data is present
    const pollObject = pollData ? {
      question: pollData.question,
      options: pollData.options.map((option, index) => ({
        id: index,
        text: option,
        votes: 0,
        percentage: 0
      }))
    } : null;

    // Create idea object if idea data is present
    const ideaObject = ideaData ? {
      title: ideaData.title,
      description: ideaData.description || content,
      participants: ideaData.participants || [],
    } : null;

    // Create the post data object
    const postData: any = {
      user_id: user.id,
      content,
      visibility,
      media_url: mediaUrl,
      media_type: mediaType
    };

    // Add poll and idea if present
    if (pollObject) {
      postData.poll = pollObject;
    }
    
    if (ideaObject) {
      postData.idea = ideaObject;
    }

    console.log("Creating post with data:", postData);
    
    // Insert post
    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (postError) {
      console.error('Post creation error:', postError);
      throw postError;
    }

    console.log('Post created successfully:', newPost);
    return newPost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function addReaction(postId: string, reactionType: string = 'love') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Check if reaction exists
    const { data: existingReaction, error: checkError } = await supabase
      .from("reactions")
      .select("id, reaction_type")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    // If user already reacted with the same type, remove it (toggle behavior)
    if (existingReaction && existingReaction.reaction_type === reactionType) {
      const { error: deleteError } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) throw deleteError;
      return { success: true, action: "removed" };
    }
    
    // If user reacted with a different type, update the reaction type
    else if (existingReaction) {
      const { error: updateError } = await supabase
        .from("reactions")
        .update({ reaction_type: reactionType })
        .eq("id", existingReaction.id);

      if (updateError) throw updateError;
      return { success: true, action: "updated" };
    }

    // Add new reaction
    const { error: insertError } = await supabase
      .from("reactions")
      .insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: reactionType
      });

    if (insertError) throw insertError;
    return { success: true, action: "added" };
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Get post to check ownership
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, media_url")  // Use user_id instead of author_id
      .eq("id", postId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (post && post.user_id !== user.id) {
      throw new Error("You don't have permission to delete this post");
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) throw deleteError;

    // Delete associated media if exists
    if (post && post.media_url) {
      // Extract file path from URL
      const url = new URL(post.media_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('media') + 1).join('/');
      
      if (filePath) {
        await supabase
          .storage
          .from("media")
          .remove([filePath]);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
