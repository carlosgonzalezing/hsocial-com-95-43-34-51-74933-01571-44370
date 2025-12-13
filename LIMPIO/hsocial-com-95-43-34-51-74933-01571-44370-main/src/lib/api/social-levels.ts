// Stub social levels - social_levels table removed

export interface SocialLevel {
  level_name: string;
  min_score: number;
  max_score: number;
  icon_name: string;
  badge_color: string;
  benefits: string[];
}

export async function getSocialLevels(): Promise<SocialLevel[]> {
  return [];
}

export async function getUserSocialLevel(score: number): Promise<SocialLevel | null> {
  return null;
}

export async function calculateUserSocialScore(userId: string): Promise<number> {
  return 0;
}
