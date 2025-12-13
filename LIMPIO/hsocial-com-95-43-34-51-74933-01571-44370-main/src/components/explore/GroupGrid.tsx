import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export function GroupGrid({ searchQuery }: { searchQuery: string }) {
  // Grupos temporalmente deshabilitados - tabla eliminada
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Los grupos están temporalmente deshabilitados</p>
    </div>
  );
}
