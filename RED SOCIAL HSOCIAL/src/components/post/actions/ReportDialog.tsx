import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/lib/api/moderation/reports";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type BackendReportReason = 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';

type ReportReasonUI =
  | 'spam'
  | 'violence'
  | 'hate_speech'
  | 'nudity'
  | 'harassment'
  | 'false_information'
  | 'copyright'
  | 'impersonation'
  | 'other';

const REPORT_REASONS: Array<{
  value: ReportReasonUI;
  label: string;
  backend: BackendReportReason;
}> = [
  { value: 'spam', label: 'Spam o contenido engañoso', backend: 'spam' },
  { value: 'false_information', label: 'Información falsa', backend: 'spam' },
  { value: 'harassment', label: 'Acoso o intimidación', backend: 'hate_speech' },
  { value: 'hate_speech', label: 'Discurso de odio', backend: 'hate_speech' },
  { value: 'violence', label: 'Violencia o contenido peligroso', backend: 'violence' },
  { value: 'nudity', label: 'Desnudos o contenido sexual', backend: 'nudity' },
  { value: 'impersonation', label: 'Suplantación de identidad', backend: 'other' },
  { value: 'copyright', label: 'Derechos de autor', backend: 'other' },
  { value: 'other', label: 'Otro motivo', backend: 'other' },
];

interface ReportDialogProps {
  postId: string;
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ postId, userId, open, onOpenChange }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReasonUI>("other");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const descriptionMax = 500;

  // Function to simulate progress for better UX
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para reportar publicaciones",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanup = simulateProgress();

      const selectedReason = REPORT_REASONS.find((r) => r.value === reason);
      const backendReason: BackendReportReason = selectedReason?.backend ?? 'other';
      const trimmed = description.trim();
      const finalDescription = [
        selectedReason?.label ? `Motivo: ${selectedReason.label}` : null,
        trimmed ? trimmed : null,
      ]
        .filter(Boolean)
        .join("\n\n");
      
      const result = await createReport(
        postId,
        userId,
        backendReason,
        finalDescription
      );

      if (!result.success) {
        throw new Error(result.error || "Error al enviar el reporte");
      }
      
      // Complete the progress
      setProgress(100);
      
      toast({
        title: "Reporte enviado",
        description: "Gracias por ayudarnos a mantener la comunidad segura",
      });
      
      // Clean up and close 
      cleanup();
      setTimeout(() => {
        onOpenChange(false);
        // Reset form after dialog closes
        setReason("other");
        setDescription("");
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error("Error al reportar la publicación:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reportar publicación</AlertDialogTitle>
          <AlertDialogDescription>
            Ayúdanos a mantener nuestra comunidad segura.
            Selecciona el motivo por el que quieres reportar esta publicación.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isSubmitting && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-2">
              Enviando reporte...
            </p>
            <Progress value={progress} className="h-2 mb-2" />
          </div>
        )}

        <div className={`space-y-4 py-4 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
          <RadioGroup value={reason} onValueChange={(value) => setReason(value as ReportReasonUI)}>
            {REPORT_REASONS.map((opt) => (
              <div key={opt.value} className="flex items-start space-x-2">
                <RadioGroupItem value={opt.value} id={opt.value} />
                <Label htmlFor={opt.value} className="font-normal">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe por qué estás reportando esta publicación"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, descriptionMax))}
              rows={3}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/{descriptionMax}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar reporte"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
