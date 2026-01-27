import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function RecoveryTokenHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hashFragment = window.location.hash;
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.log(' RecoveryTokenHandler - Hash:', hashFragment);
      console.log(' RecoveryTokenHandler - Current path:', location.pathname);
    }
    
    if (hashFragment) {
      const params = new URLSearchParams(hashFragment.substring(1));
      const type = params.get('type');
      const accessToken = params.get('access_token');
      
      if (import.meta.env.DEV) {
        console.log(' RecoveryTokenHandler - Type:', type, 'AccessToken:', accessToken ? 'PRESENT' : 'MISSING');
      }
      
      // If it's a recovery token and we're not on password-reset page
      if (type === 'recovery' && accessToken && location.pathname !== '/password-reset') {
        if (import.meta.env.DEV) {
          console.log(' RecoveryTokenHandler - REDIRECTING TO PASSWORD RESET');
        }
        // Force immediate navigation with hash
        window.location.href = `/password-reset${hashFragment}`;
      }
    }
  }, [navigate, location.pathname, location.hash]);

  return null;
}