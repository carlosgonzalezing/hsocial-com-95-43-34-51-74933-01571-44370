// Stub profile viewers - premium_profile_viewers and engagement_metrics tables removed

export async function trackProfileView(profileId: string, viewerIpAddress?: string) {
  console.log('Profile viewers tracking disabled');
}

export async function trackPremiumProfileView(profileId: string, viewerIpAddress?: string) {
  console.log('Premium profile viewers tracking disabled');
}

export async function getProfileViewers(profileId: string, limit = 10) {
  return [];
}

export async function getProfileViewsCount(profileId: string) {
  return {
    total: 0,
    today: 0,
    week: 0
  };
}

export async function getPremiumProfileViewers(profileId: string) {
  return [];
}

export async function trackEngagementMetrics(userId: string) {
  console.log('Engagement metrics tracking disabled');
}
