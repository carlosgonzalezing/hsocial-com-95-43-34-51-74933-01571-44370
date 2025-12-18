import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";

interface ReportButtonProps {
  contentType: 'post' | 'comment' | 'user' | 'story';
  contentId: string;
  reportedUserId?: string;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "secondary";
}

const REPORT_REASONS = [
  { value: 'inappropriate_content', label: 'Contenido inapropiado' },
  { value: 'spam', label: 'Spam o contenido repetitivo' },
  { value: 'harassment', label: 'Acoso o intimidación' },
  { value: 'false_information', label: 'Información falsa' },
  { value: 'violence', label: 'Violencia o amenazas' },
  { value: 'hate_speech', label: 'Discurso de odio' },
  { value: 'copyright', label: 'Violación de derechos de autor' },
  { value: 'other', label: 'Otro motivo' }
];

export function ReportButton({ 
  contentType, 
  contentId, 
  reportedUserId,
  size = "sm",
  variant = "ghost"
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        variant: "destructive",
        title: "Motivo requerido",
        description: "Por favor selecciona un motivo para el reporte"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // For now, store reports in comment_reports or create a notification
      // This is a temporary solution until proper content_reports table is created
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'content_report',
          receiver_id: reportedUserId || user.id, // Admin notification
          message: `Reporte de ${contentType}: ${reason} - ${description || 'Sin descripción'}`,
          metadata: {
            reporter_id: user.id,
            content_type: contentType,
            content_id: contentId,
            reason: reason,
            description: description.trim() || null
          }
        });

      if (error) {
        // Check if already reported
        if (error.code === '23505') {
          toast({
            variant: "destructive",
            title: "Ya reportado",
            description: "Ya has reportado este contenido anteriormente"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Reporte enviado",
        description: "Gracias por ayudar a mantener la comunidad segura. Revisaremos tu reporte pronto."
      });

      setIsOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el reporte. Inténtalo de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="text-muted-foreground">
          <Flag className="h-4 w-4" />
          <span className="sr-only">Reportar contenido</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar contenido</DialogTitle>
          <DialogDescription>
            Ayúdanos a mantener H Social como un espacio seguro y positivo para todos.
            Tu reporte será revisado por nuestro equipo de moderación.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Motivo del reporte</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción adicional (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Proporciona más detalles sobre el problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar reporte"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}