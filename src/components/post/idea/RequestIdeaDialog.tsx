import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface RequestIdeaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (profession: string, message?: string) => Promise<void>;
  ideaTitle?: string;
  isLoading?: boolean;
}

export function RequestIdeaDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  ideaTitle,
  isLoading = false
}: RequestIdeaDialogProps) {
  const [profession, setProfession] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profession.trim()) return;
    
    await onSubmit(profession.trim(), message.trim() || undefined);
    setProfession("");
    setMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar unirse a la idea</DialogTitle>
          <DialogDescription>
            {ideaTitle ? `"${ideaTitle}"` : "Completa tu solicitud para unirte a esta idea"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profession">Tu profesión o habilidad *</Label>
            <Input
              id="profession"
              placeholder="Ej: Desarrollador Full Stack, Diseñador UX..."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje (opcional)</Label>
            <Textarea
              id="message"
              placeholder="¿Por qué te gustaría unirte a esta idea?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!profession.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar solicitud"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
