
import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { SimplifiedRegistration } from "@/components/auth/SimplifiedRegistration";
import { AcademicOnboardingModal } from "@/components/onboarding/AcademicOnboardingModal";
import { sendVerificationEmail } from "@/lib/auth/verification";
import { useTheme } from "next-themes";
import { Moon, Sun, CheckCircle } from "lucide-react";
import { RecoveryTokenHandler } from "@/components/auth/RecoveryTokenHandler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEOHead } from "@/utils/safe-seo";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  
  // Handle OAuth redirects and auth state changes
  useAuthRedirect();

  // Check for verification success - either from query param or from hash token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash;
    
    // Check if there's a signup verification token in the hash
    if (hashFragment) {
      const hashParams = new URLSearchParams(hashFragment.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      // If it's a signup verification token, show success message
      if (type === 'signup' && accessToken) {
        console.log('✅ Auth - Signup verification detected in hash');
        setShowVerificationSuccess(true);
        setAuthMode('login');
        // Clean the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
    }
    
    // Also check for legacy query param
    if (urlParams.get('verified') === 'true') {
      setShowVerificationSuccess(true);
      setAuthMode('login');
      // Remove the parameter from URL without refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 10000);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Fallback recovery token check
  useEffect(() => {
    const hashFragment = window.location.hash;
    if (hashFragment) {
      const params = new URLSearchParams(hashFragment.substring(1));
      const type = params.get('type');
      const accessToken = params.get('access_token');
      
      console.log('🔍 Auth Page - Recovery token fallback check:', { type, hasToken: !!accessToken });
      
      if (type === 'recovery' && accessToken) {
        console.log('🔄 Auth Page - Redirecting to password reset');
        window.location.href = `/password-reset${hashFragment}`;
      }
    }
  }, []);

  // SEO data for react-helmet-async
  const seoData = {
    title: authMode === 'login' ? 'Iniciar sesión | H1Z' : 'Crear cuenta | H1Z',
    description: authMode === 'login'
      ? 'Inicia sesión en H1Z para conectar con amigos, compartir ideas y disfrutar contenido.'
      : 'Crea tu cuenta en H1Z para publicar ideas, hacer amigos y entretenerte.',
    canonical: `${window.location.origin}/auth`,
    robots: 'index,follow'
  };


  return (
    <>
      <SEOHead {...seoData} />
      <RecoveryTokenHandler />
      <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8 sm:py-12 relative" role="main">
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      <div className="w-full max-w-md space-y-6 bg-background rounded-lg shadow-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
          <h1 className="text-2xl font-semibold">
            {authMode === 'login' ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {authMode === 'login' ? "Bienvenido de nuevo" : "Regístrate para comenzar"}
          </p>
        </div>

        {/* Verification Success Alert */}
        {showVerificationSuccess && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              ¡Cuenta verificada exitosamente! Ya puedes iniciar sesión con tu email y contraseña.
            </AlertDescription>
          </Alert>
        )}

        {authMode === 'login' ? (
          <LoginForm loading={loading} setLoading={setLoading} />
        ) : (
          <SimplifiedRegistration 
            loading={loading} 
            setLoading={setLoading} 
            sendVerificationEmail={sendVerificationEmail}
          />
        )}

        <div className="text-center">
          {authMode === 'login' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('register')}
              disabled={loading}
            >
              ¿No tienes cuenta? Crear cuenta
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('login')}
              disabled={loading}
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </Button>
          )}
        </div>
      </div>

      {/* Academic Onboarding Modal */}
      <AcademicOnboardingModal
        open={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
      </main>
    </>
  );
}
