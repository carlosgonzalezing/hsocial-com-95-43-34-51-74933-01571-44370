import { ReactNode } from 'react';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { ChatSystem } from './ChatSystem';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatSystemProvider } from '@/hooks/use-chat-system';
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';
import { RealtimeNotificationHandler } from '@/components/notifications/RealtimeNotificationHandler';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface FacebookLayoutProps {
  children: ReactNode;
  hideLeftSidebar?: boolean;
  hideRightSidebar?: boolean;
  hideNavigation?: boolean;
}

export function FacebookLayout({ 
  children, 
  hideLeftSidebar = false, 
  hideRightSidebar = false,
  hideNavigation = false 
}: FacebookLayoutProps) {
  const isMobile = useIsMobile();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [newPosts, setNewPosts] = useState<number>(0);

  // Get current user and pending requests count
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    getCurrentUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load pending requests count, notifications, and new posts
  useEffect(() => {
    if (!currentUserId) return;
    
    const loadCounts = async () => {
      try {
        // Load pending requests
        const { data: friendRequests, error: friendError } = await supabase
          .from('friendships')
          .select('id')
          .eq('friend_id', currentUserId)
          .eq('status', 'pending');
          
        if (friendError) throw friendError;
        setPendingRequestsCount(friendRequests?.length || 0);

        // Load unread notifications
        setUnreadNotifications(0); // Simplified for now

        // For new posts, we'll keep it simple for now
        setNewPosts(0);
      } catch (error) {
        console.error('Error loading counts:', error);
      }
    };
    
    loadCounts();
    
    const friendshipsChannel = supabase
      .channel('friendships_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `friend_id=eq.${currentUserId}`,
      }, () => {
        loadCounts();
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUserId}`,
      }, () => {
        loadCounts();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(friendshipsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [currentUserId]);

  // Mobile layout
  if (isMobile) {
    return (
      <ChatSystemProvider>
        <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
          {!hideNavigation && (
            <div className="fixed top-0 left-0 right-0 z-50 w-full">
              <TopNavigation pendingRequestsCount={pendingRequestsCount} />
            </div>
          )}
          
          {currentUserId && <RealtimeNotificationHandler userId={currentUserId} />}
          
          <main className={`w-full min-h-screen ${!hideNavigation ? 'pt-[96px] pb-20' : 'py-4 pb-20'}`}>
            <div className="w-full px-0 mx-auto max-w-full">
              {currentUserId && <NotificationPermissionBanner />}
              {children}
            </div>
          </main>
          
          {!hideNavigation && (
            <MobileBottomNavigation 
              currentUserId={currentUserId}
              unreadNotifications={unreadNotifications}
              newPosts={newPosts}
              pendingRequestsCount={pendingRequestsCount}
            />
          )}
          
          {currentUserId && <ChatSystem />}
        </div>
      </ChatSystemProvider>
    );
  }

  // Desktop layout - Facebook style
  return (
    <ChatSystemProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Fixed Top Navigation */}
        {!hideNavigation && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <TopNavigation pendingRequestsCount={pendingRequestsCount} />
          </div>
        )}
        
        {/* Real-time notifications handler */}
        {currentUserId && <RealtimeNotificationHandler userId={currentUserId} />}
        
        {/* Main Content Area - Facebook 3-column layout */}
        <div className="pt-16 flex min-h-screen w-full">
          {/* Left Sidebar - Fixed width on desktop only */}
          {!hideLeftSidebar && (
            <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-[280px] z-10">
              <LeftSidebar currentUserId={currentUserId} />
            </div>
          )}
          
          {/* Center Content - Flexible width with max constraints */}
          <main className={`flex-1 min-h-screen w-full ${!hideLeftSidebar ? 'lg:ml-[280px]' : ''} ${!hideRightSidebar ? 'xl:mr-[320px]' : ''}`}>
            <div className="max-w-[750px] mx-auto px-4 lg:px-6 py-2 lg:py-4 w-full">
              {/* Notification banner */}
              {currentUserId && <NotificationPermissionBanner />}
              {children}
            </div>
          </main>
          
          {/* Right Sidebar - Fixed width on desktop only */}
          {!hideRightSidebar && (
            <div className="hidden xl:block fixed right-0 top-16 bottom-0 w-[320px] z-10">
              <RightSidebar currentUserId={currentUserId} />
            </div>
          )}
        </div>
        
        {/* Chat System - Bottom right */}
        {currentUserId && <ChatSystem />}
      </div>
    </ChatSystemProvider>
  );
}