
import type { Post } from "@/types/post";

export function transformPostsData(posts: any[]): Post[] {
  return posts.map(transformPostData);
}

export function transformPostData(post: any): Post {
  // Transform post data into the expected format
  return {
    id: post.id,
    content: post.content,
    created_at: post.created_at,
    updated_at: post.updated_at,
    user_id: post.user_id,
    profiles: post.profiles,
    media_url: post.media_url,
    media_type: post.media_type,
    reactions: post.reactions,
    poll: post.poll,
    idea: post.idea,
    post_type: post.post_type,
    event: post.academic_events?.[0] ? {
      id: post.academic_events[0].id,
      title: post.academic_events[0].title,
      description: post.academic_events[0].description,
      start_date: post.academic_events[0].start_date,
      end_date: post.academic_events[0].end_date,
      location: post.academic_events[0].location,
      location_type: post.academic_events[0].is_virtual ? 'virtual' : 'presencial',
      max_attendees: post.academic_events[0].max_attendees,
      category: post.academic_events[0].event_type,
      registration_required: post.academic_events[0].registration_required,
      registration_deadline: post.academic_events[0].registration_deadline,
      contact_info: post.academic_events[0].organizer_contact,
      banner_url: post.academic_events[0].banner_url,
      organizer_id: post.user_id
    } : undefined,
    comments_count: post.comments?.[0]?.count || 0,
    shared_post_id: post.shared_post_id,
    shared_from: post.shared_from,
    visibility: post.visibility,
    is_pinned: post.is_pinned,
    // If there's a shared post, transform it too
    shared_post: post.shared_post ? transformPostData(post.shared_post) : undefined
  };
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
