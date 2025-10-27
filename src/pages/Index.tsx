import React from "react";
import { Feed } from "@/components/feed/Feed";
import { FacebookLayout } from "@/components/layout/FacebookLayout";
import { SimpleOnboardingModal } from "@/components/onboarding/SimpleOnboardingModal";
import { useOnboarding } from "@/hooks/use-onboarding";
import { StoriesBar } from "@/components/stories/StoriesBar";

export default function Index() {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return (
    <FacebookLayout>
      <div className="w-full space-y-0 pb-24">
        <StoriesBar />
        <Feed />
      </div>

      <SimpleOnboardingModal
        isOpen={showOnboarding}
        onClose={completeOnboarding}
      />
    </FacebookLayout>
  );
}