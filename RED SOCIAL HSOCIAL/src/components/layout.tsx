
import { FacebookLayout } from "@/components/layout/FacebookLayout";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  hideLeftSidebar?: boolean;
  hideRightSidebar?: boolean;
}

export function Layout({ 
  children, 
  hideNavigation = false, 
  hideLeftSidebar = false, 
  hideRightSidebar = false 
}: LayoutProps) {
  return (
    <FacebookLayout 
      hideNavigation={hideNavigation}
      hideLeftSidebar={hideLeftSidebar}
      hideRightSidebar={hideRightSidebar}
    >
      {children}
    </FacebookLayout>
  );
}
