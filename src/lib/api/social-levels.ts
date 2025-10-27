import { supabase } from "@/integrations/supabase/client";

export interface SocialLevel {
  id: string;
  level_name: string;
  min_score: number;
  max_score: number | null;
  icon_name: string;
  color_from: string;
  color_to: string;
  benefits: any;
}

export interface SocialLevelProgress {
  currentLevel: SocialLevel;
  nextLevel: SocialLevel | null;
  progress: number;
  progressPercentage: number;
}

// Get all social levels
export async function getSocialLevels(): Promise<SocialLevel[]> {
  try {
    const { data, error } = await supabase
      .from('social_levels')
      .select('*')
      .order('min_score', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      benefits: typeof item.benefits === 'string' ? JSON.parse(item.benefits) : item.benefits
    }));
  } catch (error) {
    console.error('Error fetching social levels:', error);
    return [];
  }
}

// Get social level for a specific score
export async function getSocialLevelForScore(score: number): Promise<SocialLevel | null> {
  try {
    const levels = await getSocialLevels();
    return levels.find(level => 
      score >= level.min_score && 
      (level.max_score === null || score <= level.max_score)
    ) || null;
  } catch (error) {
    console.error('Error fetching social level for score:', error);
    return null;
  }
}

// Get social level progress for a user
export async function getSocialLevelProgress(currentScore: number): Promise<SocialLevelProgress | null> {
  try {
    const levels = await getSocialLevels();
    if (levels.length === 0) return null;

    // Find current level
    const currentLevel = levels.find(level => 
      currentScore >= level.min_score && 
      (level.max_score === null || currentScore <= level.max_score)
    );

    if (!currentLevel) return null;

    // Find next level
    const nextLevel = levels.find(level => 
      level.min_score > currentScore
    );

    // Calculate progress
    const progress = currentScore - currentLevel.min_score;
    const progressPercentage = nextLevel 
      ? (progress / (nextLevel.min_score - currentLevel.min_score)) * 100
      : 100;

    return {
      currentLevel,
      nextLevel,
      progress,
      progressPercentage: Math.min(progressPercentage, 100)
    };
  } catch (error) {
    console.error('Error calculating social level progress:', error);
    return null;
  }
}