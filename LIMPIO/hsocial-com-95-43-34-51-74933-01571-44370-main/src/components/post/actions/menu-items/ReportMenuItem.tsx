
import { Flag } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ReportMenuItemProps {
  onReportPost: () => void;
}

export function ReportMenuItem({ onReportPost }: ReportMenuItemProps) {
  return (
    <DropdownMenuItem 
      onClick={onReportPost}
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Flag className="mr-2 h-4 w-4" />
      Reportar publicación
    </DropdownMenuItem>
  );
}
