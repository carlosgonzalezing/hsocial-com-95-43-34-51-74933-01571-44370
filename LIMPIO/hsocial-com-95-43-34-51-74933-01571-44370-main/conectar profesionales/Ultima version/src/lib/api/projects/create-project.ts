import { supabase } from "@/integrations/supabase/client";
import { uploadToSupabase } from "@/lib/storage/cloudflare-r2";
import type { ProjectFormData } from "@/types/project";

export async function createProject(data: ProjectFormData, imageFile?: File) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    let imageUrl = data.image_url;

    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `projects/${user.id}/${Date.now()}.${fileExt}`;
      imageUrl = await uploadToSupabase(imageFile, fileName);
    }

    // Create post first
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: data.description,
        visibility: 'public',
        post_type: 'project_showcase'
      })
      .select()
      .single();

    if (postError) throw postError;

    // Create project showcase
    const { data: project, error: projectError } = await supabase
      .from('project_showcases')
      .insert({
        post_id: post.id,
        project_title: data.title,
        project_description: data.description,
        project_status: data.status,
        technologies_used: data.technologies,
        github_url: data.github_url || null,
        demo_url: data.demo_url || null,
        project_url: data.documentation_url || null,
        images_urls: imageUrl ? [imageUrl] : [],
        seeking_collaborators: data.seeking_collaborators,
        collaboration_roles: data.team_members,
        achievements: data.achievements ? [data.achievements] : [],
        industry: data.category
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Add creator as first participant
    const { error: participantError } = await supabase
      .from('idea_participants')
      .insert({
        post_id: post.id,
        user_id: user.id,
        profession: data.category || 'Desarrollador del proyecto'
      });

    if (participantError) {
      console.error('Error adding creator as participant:', participantError);
      // Don't throw, just log - the project is already created
    }

    return { post, project };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}
