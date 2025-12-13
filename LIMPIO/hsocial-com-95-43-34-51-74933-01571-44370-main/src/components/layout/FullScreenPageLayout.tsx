import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FullScreenPageLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
}

export function FullScreenPageLayout({ 
  children, 
  title, 
  showBackButton = true 
}: FullScreenPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-background z-40">
      {/* Header with back button */}
      <div className="h-14 bg-card/80 backdrop-blur-sm border-b border-border flex items-center px-4 z-50">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group mr-2"
          >
            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      
      {/* Content */}
      <div className="h-[calc(100%-3.5rem)] overflow-auto">
        {children}
      </div>
    </div>
  );
}