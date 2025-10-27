
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface JoinIdeaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (profession: string) => Promise<boolean>;
  ideaTitle?: string;
}

export function JoinIdeaDialog({ isOpen, onOpenChange, onJoin, ideaTitle }: JoinIdeaDialogProps) {
  const [profession, setProfession] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUserCareer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data } = await (supabase as any)
          .from("profiles")
          .select("career")
          .eq("id", user.id)
          .single();
          
        if (data?.career) {
          setProfession(data.career);
        }
      } catch (error) {
        console.error("Error al obtener carrera del usuario:", error);
      }
    };
    
    if (isOpen) {
      getUserCareer();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!profession.trim()) return;
    
    setIsLoading(true);
    try {
      const success = await onJoin(profession);
      if (success) {
        onOpenChange(false);
        setProfession("");
      }
    } catch (error) {
      console.error("Error joining idea:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unirse a {ideaTitle || "la idea"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="profession">Tu profesión o habilidad</Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ej: Desarrollador Frontend, Diseñador UX, Marketing..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!profession.trim() || isLoading}>
              {isLoading ? "Uniéndose..." : "Unirse"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
