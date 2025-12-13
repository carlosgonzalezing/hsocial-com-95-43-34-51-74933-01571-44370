
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface CareerBadgeProps {
  career: string | null | undefined;
}

export function CareerBadge({ career }: CareerBadgeProps) {
  if (!career) return null;
  
  // Format career to be more concise if needed
  const formattedCareer = formatCareer(career);
  
  return (
    <Badge 
      variant="idea" 
      className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center gap-1 text-xs"
    >
      <BookOpen className="h-3 w-3" />
      <span>{formattedCareer}</span>
    </Badge>
  );
}

function formatCareer(career: string): string {
  // Add abbreviations for common careers
  const abbreviations: Record<string, string> = {
    "Ingeniería Informática": "Ing. Informática",
    "Ingeniería de Software": "Ing. Software",
    "Ingeniería Civil": "Ing. Civil",
    "Ingeniería Industrial": "Ing. Industrial",
    "Administración de Empresas": "Admin. Empresas",
    "Ciencias de la Computación": "Cs. Computación",
    "Psicología": "Psicólogo/a",
    // Add more abbreviations as needed
  };
  
  return abbreviations[career] || career;
}
