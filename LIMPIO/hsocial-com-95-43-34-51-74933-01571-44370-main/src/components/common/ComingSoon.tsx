import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description = "Fase beta — En desarrollo. Próximamente." }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Wrench className="w-12 h-12 text-muted-foreground" />
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 text-xs"
              >
                Beta
              </Badge>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-3">{title}</h1>
          
          <p className="text-muted-foreground mb-6">
            {description}
          </p>
          
          <Button 
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}