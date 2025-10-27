import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateInvitationCode } from "@/lib/api/access-control";
import { useToast } from "@/hooks/use-toast";

interface InvitationCodeFormProps {
  onValidCode: (code: string, institutionName: string) => void;
  onSkip?: () => void;
}

export function InvitationCodeForm({ onValidCode, onSkip }: InvitationCodeFormProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleValidate = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Código requerido",
        description: "Por favor ingresa un código de invitación"
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateInvitationCode(code.trim());
      
      if (result.valid && result.data) {
        toast({
          title: "Código válido",
          description: `Bienvenido a ${result.data.institution_name}`
        });
        onValidCode(code.trim(), result.data.institution_name);
      } else {
        toast({
          variant: "destructive",
          title: "Código inválido",
          description: result.message
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo validar el código"
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Acceso a H Social</CardTitle>
        <CardDescription>
          Ingresa tu código de invitación para acceder a la beta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invitation-code">Código de invitación</Label>
          <Input
            id="invitation-code"
            type="text"
            placeholder="Ej: SENA2024"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={20}
          />
        </div>
        
        <Button 
          onClick={handleValidate}
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? "Validando..." : "Continuar"}
        </Button>

        {onSkip && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="text-sm text-muted-foreground"
            >
              Tengo email institucional
            </Button>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg text-sm">
          <h4 className="font-medium mb-2">¿No tienes código?</h4>
          <p className="text-muted-foreground">
            Los códigos son distribuidos por embajadores en tu institución educativa. 
            También puedes registrarte con tu email institucional si tu institución está autorizada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}