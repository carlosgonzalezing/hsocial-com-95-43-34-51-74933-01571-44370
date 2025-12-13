
import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";
import { ReportWithUser } from "@/types/database/moderation.types";

interface ReportDetailsProps {
  reports: ReportWithUser[];
}

const ReportDetails: React.FC<ReportDetailsProps> = ({ reports }) => {
  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "spam":
        return "Spam o contenido engañoso";
      case "violence":
        return "Violencia o contenido peligroso";
      case "nudity":
        return "Desnudos o contenido sexual";
      case "hate_speech":
        return "Discurso de odio o acoso";
      default:
        return "Otro motivo";
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Detalles de los reportes</h3>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="border rounded-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={report.user.avatar_url || undefined} />
                <AvatarFallback>{report.user.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{report.user.username || "Usuario"}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(report.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{getReasonLabel(report.reason)}</span>
            </div>

            {report.description && (
              <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
                {report.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReportDetails;
