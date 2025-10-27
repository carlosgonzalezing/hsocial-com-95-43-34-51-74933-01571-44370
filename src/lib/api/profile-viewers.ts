import { supabase } from "@/integrations/supabase/client";

export interface ProfileViewer {
  id: string;
  viewer_id: string | null;
  viewed_at: string;
  is_anonymous: boolean;
  viewer_profile?: {
    username: string;
    avatar_url: string;
  };
}

export interface ProfileViewStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  viewers: ProfileViewer[];
}

// Check if user is premium using optimized RPC function
export async function isUserPremium(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    console.log("🚀 Verificando premium en profile-viewers...");

    // Use optimized RPC function
    const { data, error } = await supabase.rpc('check_user_premium_status', {
      user_id_param: user.id
    });

    if (error) {
      console.error('Error checking premium status:', error);
      return false;
    }

    console.log(`✅ Estado premium: ${data ? 'Activo' : 'Inactivo'}`);
    return !!data;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

// Track premium profile view
export async function trackPremiumProfileView(profileId: string, isAnonymous: boolean = false) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.rpc('track_premium_profile_view', {
      profile_id_param: profileId,
      viewer_id_param: user?.id || null,
      is_anonymous_param: isAnonymous
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking premium profile view:', error);
  }
}

// Get profile viewers (premium feature)
export async function getProfileViewers(timeRange: 'today' | 'week' | 'month' | 'all' = 'all'): Promise<ProfileViewer[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Check if user is premium
    const isPremium = await isUserPremium();
    if (!isPremium) {
      throw new Error('Esta función requiere una suscripción premium');
    }

    let timeFilter = '';
    const now = new Date();
    
    switch (timeRange) {
      case 'today':
        timeFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        timeFilter = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        timeFilter = monthAgo.toISOString();
        break;
    }

    let query = supabase
      .from('premium_profile_viewers')
      .select(`
        id,
        viewer_id,
        viewed_at,
        is_anonymous
      `)
      .eq('profile_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(50);

    if (timeFilter) {
      query = query.gte('viewed_at', timeFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get profile information for viewers
    const viewersWithProfiles = await Promise.all((data || []).map(async (viewer) => {
      let viewerProfile = undefined;
      
      if (viewer.viewer_id && !viewer.is_anonymous) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', viewer.viewer_id)
          .maybeSingle();
          
        if (profile) {
          viewerProfile = {
            username: profile.username || 'Usuario',
            avatar_url: profile.avatar_url || ''
          };
        }
      }
      
      return {
        id: viewer.id,
        viewer_id: viewer.viewer_id,
        viewed_at: viewer.viewed_at,
        is_anonymous: viewer.is_anonymous,
        viewer_profile: viewerProfile
      };
    }));

    return viewersWithProfiles;
  } catch (error) {
    console.error('Error fetching profile viewers:', error);
    throw error;
  }
}

// Get profile view statistics
export async function getProfileViewStats(): Promise<ProfileViewStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        totalViews: 0,
        todayViews: 0,
        weekViews: 0,
        monthViews: 0,
        viewers: []
      };
    }

    const isPremium = await isUserPremium();
    
    // Get basic metrics from engagement_metrics
    const { data: metrics } = await supabase
      .from('engagement_metrics')
      .select('profile_views_today, profile_views_total')
      .eq('user_id', user.id)
      .maybeSingle();

    const viewers = isPremium ? await getProfileViewers() : [];

    // Calculate weekly and monthly views from viewers data
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weekViews = viewers.filter(v => new Date(v.viewed_at) >= weekAgo).length;
    const monthViews = viewers.filter(v => new Date(v.viewed_at) >= monthAgo).length;

    return {
      totalViews: metrics?.profile_views_total || 0,
      todayViews: metrics?.profile_views_today || 0,
      weekViews,
      monthViews,
      viewers
    };
  } catch (error) {
    console.error('Error fetching profile view stats:', error);
    return {
      totalViews: 0,
      todayViews: 0,
      weekViews: 0,
      monthViews: 0,
      viewers: []
    };
  }
}