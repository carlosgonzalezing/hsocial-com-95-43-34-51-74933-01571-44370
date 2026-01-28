import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HSocialLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const HSocialLogo = ({ className = "", showText = true, size = "md", onClick }: HSocialLogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={`flex items-center gap-1.5 group ${className}`}>
      {/* Logo minimalista blanco y negro empresarial */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-foreground flex items-center justify-center`}
      >
        <span className="text-lg text-background font-bold">H</span>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-foreground`}>Social</span>
      )}
    </div>
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    check();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  if (onClick) {
    return (
      <button onClick={onClick} className="cursor-pointer">
        {content}
      </button>
    );
  }

  return (
    <Link to={isAuthenticated ? "/home" : "/"} className="cursor-pointer">
      {content}
    </Link>
  );
};
