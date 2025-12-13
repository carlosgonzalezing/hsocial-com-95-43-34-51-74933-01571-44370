
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

interface PostActionsProps {
  onAction: (action: 'approve' | 'reject' | 'delete') => void;
}

const PostActions: React.FC<PostActionsProps> = ({ onAction }) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        onClick={() => onAction('approve')}
        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Aprobar
      </Button>
      <Button
        variant="outline"
        onClick={() => onAction('reject')}
        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
      >
        <XCircle className="h-4 w-4 mr-2" />
        Rechazar
      </Button>
      <Button
        variant="outline"
        onClick={() => onAction('delete')}
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar
      </Button>
    </div>
  );
};

export default PostActions;
