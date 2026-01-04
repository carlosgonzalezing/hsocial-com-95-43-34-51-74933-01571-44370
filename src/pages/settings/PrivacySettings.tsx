
import { useState } from "react";
// Removed StoryPrivacySettings - stories feature removed
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacySettings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6 gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Privacidad</h1>
      </div>

      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Las configuraciones de privacidad han sido simplificadas para mejorar el rendimiento de la app.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Toda la información se mantiene privada por defecto.
          </p>
        </div>
      </div>
    </div>
  );
}
