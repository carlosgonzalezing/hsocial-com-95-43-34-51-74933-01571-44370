// Stub analytics - daily_engagement table removed
import { supabase } from "@/integrations/supabase/client";

export interface PlatformMetrics {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  total_posts: number;
  posts_today: number;
  total_interactions: number;
  interactions_today: number;
  retention_rate: number;
}

export interface UserEngagementMetrics {
  user_id: string;
  username: string;
  daily_score: number;
  weekly_score: number;
  posts_count: number;
  interactions_count: number;
  hearts_given: number;
  hearts_received: number;
  last_activity: string;
}

export async function trackPlatformEvent(
  eventType: string, 
  eventData: Record<string, any> = {}
) {
  console.log('Analytics disabled:', eventType, eventData);
}

export async function getPlatformMetrics(): Promise<PlatformMetrics | null> {
  try {
    const { count: totalUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const { count: totalPosts } = await supabase.from('posts').select('id', { count: 'exact', head: true });

    return {
      total_users: totalUsers || 0,
      active_users_today: 0,
      active_users_week: 0,
      total_posts: totalPosts || 0,
      posts_today: 0,
      total_interactions: 0,
      interactions_today: 0,
      retention_rate: 0
    };
  } catch (error) {
    console.error('Error getting platform metrics:', error);
    return null;
  }
}

export async function getTopEngagedUsers(limit = 10): Promise<UserEngagementMetrics[]> {
  return [];
}

export async function trackFeatureUsage(feature: string, action: string, metadata: any = {}) {
  console.log('Feature tracking disabled:', feature, action);
}

export async function trackUserMilestone(milestone: string, metadata: any = {}) {
  console.log('Milestone tracking disabled:', milestone);
}
