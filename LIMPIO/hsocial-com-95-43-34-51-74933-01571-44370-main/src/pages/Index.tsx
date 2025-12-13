import React from "react";
import { Feed } from "@/components/feed/Feed";
import { FacebookLayout } from "@/components/layout/FacebookLayout";
import { SimpleOnboardingModal } from "@/components/onboarding/SimpleOnboardingModal";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function Index() {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return (
    <FacebookLayout>
      <div className="w-full pb-24 bg-muted/50 min-h-screen">
        <Feed />
      </div>

      <SimpleOnboardingModal
        isOpen={showOnboarding}
        onClose={completeOnboarding}
      />
    </FacebookLayout>
  );
}