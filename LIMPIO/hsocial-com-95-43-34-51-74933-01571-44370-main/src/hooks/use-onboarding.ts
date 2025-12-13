import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ONBOARDING_KEY = "h-social-onboarding-completed";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check localStorage first for quick response
        const localCompleted = localStorage.getItem(ONBOARDING_KEY);
        
        // Check if user has completed onboarding by looking at their profile completeness
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, bio, career, created_at')
          .eq('id', user.id)
          .single();

        if (profile) {
          const hasBasicInfo = profile.username && profile.career;
          const isNewUser = new Date(profile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Less than 24h old
          
          // Show onboarding if it's a new user and they haven't completed it
          if (isNewUser && !localCompleted && !hasBasicInfo) {
            setIsFirstTime(true);
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isFirstTime,
    completeOnboarding,
    skipOnboarding,
    startOnboarding
  };
}