import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function PremiumWaitlistModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await (supabase as any).from("premium_waitlist").insert({
        whatsapp,
        email,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: "¡Gracias!", description: "Te contactaremos pronto para activar Premium Pro." });
      setOpen(false);
      setWhatsapp("");
      setEmail("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "No pudimos guardar tu solicitud." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prueba Premium Pro 7 días</DialogTitle>
          <DialogDescription>
            Déjanos tu WhatsApp y email para habilitar tu prueba y verificar tu cuenta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="whatsapp">WhatsApp (con código de país)</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+57 300 123 4567"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Empezar prueba"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
