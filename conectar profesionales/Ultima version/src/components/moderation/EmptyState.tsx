
import React from "react";
import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const EmptyState: React.FC = () => {
  return (
    <Card className="p-8 text-center">
      <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-green-500" />
      <h2 className="text-xl font-semibold mb-2">No hay publicaciones reportadas</h2>
      <p className="text-muted-foreground">
        Todas las publicaciones reportadas han sido revisadas.
      </p>
    </Card>
  );
};

export default EmptyState;
