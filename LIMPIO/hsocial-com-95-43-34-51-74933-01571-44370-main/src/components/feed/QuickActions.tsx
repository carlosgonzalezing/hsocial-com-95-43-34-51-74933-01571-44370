import { Card } from "@/components/ui/card";
import { Briefcase, Users, Lightbulb, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  const actions = [
    {
      icon: Briefcase,
      label: "Proyectos",
      description: "Ver proyectos en progreso",
      path: "/projects?filter=in-progress",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      icon: Users,
      label: "Equipos",
      description: "Buscar o crear equipos",
      path: "/teams",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    },
    {
      icon: Lightbulb,
      label: "Ideas",
      description: "Ideas que buscan colaboradores",
      path: "/ideas",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600"
    },
    {
      icon: Calendar,
      label: "Eventos",
      description: "Hackathons y conferencias",
      path: "/events",
      color: "bg-emerald-500",
      hoverColor: "hover:bg-emerald-600"
    }
  ];

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Accesos rápidos</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="group"
          >
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-all">
              <div className={`w-12 h-12 rounded-xl ${action.color} ${action.hoverColor} flex items-center justify-center transition-colors group-hover:scale-110 duration-200`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground hidden md:block">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
