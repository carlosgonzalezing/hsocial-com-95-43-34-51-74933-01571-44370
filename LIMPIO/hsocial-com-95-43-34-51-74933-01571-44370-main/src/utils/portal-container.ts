// Safe portal container management for Radix UI
let portalContainer: HTMLElement | null = null;

export const getPortalContainer = (): HTMLElement => {
  if (!portalContainer) {
    portalContainer = document.getElementById('portal-root');
    
    if (!portalContainer) {
      // Create portal container if it doesn't exist
      portalContainer = document.createElement('div');
      portalContainer.id = 'portal-root';
      document.body.appendChild(portalContainer);
    }
  }
  
  return portalContainer;
};

// Ensure portal container exists on app initialization
export const initializePortalContainer = () => {
  getPortalContainer();
};