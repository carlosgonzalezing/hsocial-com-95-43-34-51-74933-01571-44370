import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface FirstPostBadgeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirstPostBadge({ isOpen, onClose }: FirstPostBadgeProps) {
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    handleClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <Card className={`relative mx-4 max-w-md w-full p-6 transform transition-all duration-300 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <Trophy className="h-10 w-10 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              ¡Felicidades!
            </h2>
            <p className="text-lg font-medium text-muted-foreground mt-1">
              Publicaste tu primera idea
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🎉 Has dado tu primer paso en H Social</p>
            <p>🚀 Tu idea ahora es visible para toda la comunidad</p>
            <p>💡 Sigue compartiendo y conectando con otros estudiantes</p>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Compartir logro
            </Button>
            <Button onClick={handleClose}>
              ¡Genial!
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
