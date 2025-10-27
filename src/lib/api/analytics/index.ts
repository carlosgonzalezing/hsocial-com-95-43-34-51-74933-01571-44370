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

// Track platform events (store in daily_engagement for now)
export async function trackPlatformEvent(
  eventType: string, 
  eventData: Record<string, any> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Store event data in daily_engagement actions field
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('daily_engagement')
      .select('actions')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const currentActions = existing?.actions as any || {};
    const events = Array.isArray(currentActions.events) ? currentActions.events : [];
    
    events.push({
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString()
    });

    await supabase
      .from('daily_engagement')
      .upsert({
        user_id: user.id,
        date: today,
        score: 0, // Will be updated by engagement algorithm
        actions: { ...currentActions, events }
      }, {
        onConflict: 'user_id,date'
      });

  } catch (error) {
    console.error('Error tracking platform event:', error);
  }
}

// Get platform metrics (simplified for existing tables)
export async function getPlatformMetrics(): Promise<PlatformMetrics | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [
      { count: totalUsers },
      { count: activeToday },
      { count: activeWeek },
      { count: totalPosts },
      { count: postsToday }
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('daily_engagement').select('user_id', { count: 'exact', head: true }).eq('date', today),
      supabase.from('daily_engagement').select('user_id', { count: 'exact', head: true }).gte('date', weekAgo),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', today)
    ]);

    return {
      total_users: totalUsers || 0,
      active_users_today: activeToday || 0,
      active_users_week: activeWeek || 0,
      total_posts: totalPosts || 0,
      posts_today: postsToday || 0,
      total_interactions: 0, // Will implement when reactions table exists
      interactions_today: 0,
      retention_rate: totalUsers ? ((activeWeek || 0) / totalUsers) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting platform metrics:', error);
    return null;
  }
}

// Get top engaged users (simplified)
export async function getTopEngagedUsers(limit = 10): Promise<UserEngagementMetrics[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get users with engagement data
    const { data: engagementData, error } = await supabase
      .from('daily_engagement')
      .select('user_id, score')
      .gte('date', weekAgo)
      .order('score', { ascending: false });

    if (error) throw error;

    // Group by user and sum scores
    const userScores = engagementData?.reduce((acc: any, record) => {
      if (!acc[record.user_id]) {
        acc[record.user_id] = 0;
      }
      acc[record.user_id] += record.score || 0;
      return acc;
    }, {}) || {};

    // Get top users
    const topUserIds = Object.entries(userScores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([userId]) => userId);

    if (topUserIds.length === 0) return [];

    // Get user profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, updated_at')
      .in('id', topUserIds);

    return profiles?.map(profile => ({
      user_id: profile.id,
      username: profile.username || 'Usuario',
      daily_score: 0, // Would need today's specific score
      weekly_score: userScores[profile.id] || 0,
      posts_count: 0, // Would need post count query
      interactions_count: 0, // Would need interactions query
      hearts_given: 0,
      hearts_received: 0,
      last_activity: profile.updated_at
    })) || [];
  } catch (error) {
    console.error('Error getting top engaged users:', error);
    return [];
  }
}

// Track feature usage
export async function trackFeatureUsage(feature: string, action: string, metadata: any = {}) {
  await trackPlatformEvent('feature_usage', {
    feature,
    action,
    metadata
  });
}

// Track user journey milestones
export async function trackUserMilestone(milestone: string, metadata: any = {}) {
  await trackPlatformEvent('user_milestone', {
    milestone,
    metadata
  });
}