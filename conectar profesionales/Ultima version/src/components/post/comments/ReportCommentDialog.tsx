
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/post";

type ReportReason = "spam" | "inappropriate" | "harassment" | "false_information" | "other";

interface ReportCommentDialogProps {
  comment: Comment;
}

export function ReportCommentDialog({ comment }: ReportCommentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reasons: { value: ReportReason; label: string }[] = [
    { value: "spam", label: "Spam" },
    { value: "inappropriate", label: "Contenido inapropiado" },
    { value: "harassment", label: "Acoso" },
    { value: "false_information", label: "Información falsa" },
    { value: "other", label: "Otro" },
  ];

  const handleReport = async () => {
    if (!selectedReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona una razón para reportar",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reportar un comentario",
        });
        setIsOpen(false);
        return;
      }

      // Insert report directly instead of using RPC
      const { error } = await (supabase as any)
        .from('comment_reports')
        .insert({
          comment_id: comment.id,
          reason: selectedReason,
          user_id: session.session.user.id
        });

      if (error) throw error;

      // Check reports count to see if comment should be deleted
      const { count, error: countError } = await (supabase as any)
        .from('comment_reports')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', comment.id);

      if (countError) throw countError;

      // If 10 or more reports, delete the comment
      if (count && count >= 10) {
        const { error: deleteError } = await (supabase as any)
          .from('comments')
          .delete()
          .eq('id', comment.id);

        if (deleteError) throw deleteError;

        toast({
          title: "Comentario eliminado",
          description: "Este comentario ha sido eliminado debido a múltiples reportes.",
        });
      } else {
        toast({
          title: "Comentario reportado",
          description: "Gracias por ayudar a mantener la comunidad segura.",
        });
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Error reporting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reportar el comentario. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground">
          <Flag className="h-4 w-4" />
          <span className="sr-only">Reportar comentario</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reportar comentario</DialogTitle>
          <DialogDescription>
            Por favor, selecciona la razón por la que estás reportando este comentario.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {reasons.map((reason) => (
              <div key={reason.value} className="flex items-center">
                <input
                  type="radio"
                  id={reason.value}
                  name="report-reason"
                  className="mr-2"
                  checked={selectedReason === reason.value}
                  onChange={() => setSelectedReason(reason.value)}
                />
                <label htmlFor={reason.value}>{reason.label}</label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleReport} disabled={isSubmitting || !selectedReason}>
            {isSubmitting ? "Reportando..." : "Reportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
