import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ShieldCheck } from "lucide-react";
import { PremiumWaitlistModal } from "@/components/premium/PremiumWaitlistModal";

export default function Pricing() {
  return (
    <FullScreenPageLayout title="Premium Pro">
      <div className="container px-2 sm:px-4 max-w-4xl pt-6 pb-12 space-y-6">
        <Card className="border-border/60">
          <CardContent className="p-6 sm:p-10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Lanzamiento universitario (Barranquilla)</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Garantía 7 días
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Haz que tu perfil y tus proyectos se vean serios.
                </h1>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                  Premium Pro te da verificación universitaria, mayor visibilidad y un portafolio profesional
                  para conseguir colaboradores más rápido.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <PremiumWaitlistModal>
                  <Button size="lg" className="sm:w-auto">
                    Activar Premium Pro
                  </Button>
                </PremiumWaitlistModal>
                <Button asChild variant="outline" size="lg" className="sm:w-auto">
                  <a href="#incluye">Ver qué incluye</a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                COP $14.900/mes • Pago seguro con MercadoPago • Cancela cuando quieras
              </p>
            </div>
          </CardContent>
        </Card>

        <Card id="incluye" className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Premium Pro</CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <div className="text-3xl font-bold">COP $14.900</div>
                <div className="text-sm text-muted-foreground">por mes</div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Sin contrato. Garantía de reembolso 7 días.
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[ 
                    "Badge de verificación universitaria",
                    "Más visibilidad en búsqueda y recomendados",
                    "Proyectos fijados para destacar lo mejor",
                    "Portafolio Pro (secciones extra + enlaces)",
                    "Métricas básicas (vistas de perfil/proyectos)",
                    "Soporte prioritario",
                  ].map((text) => (
                    <div key={text} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary" />
                      <p className="text-sm">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <PremiumWaitlistModal>
                    <Button size="lg" className="w-full sm:w-auto">
                      Empezar ahora
                    </Button>
                  </PremiumWaitlistModal>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pago seguro con MercadoPago • Cancela cuando quieras
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Preguntas frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div>
              <p className="text-sm font-medium">¿Puedo cancelar cuando quiera?</p>
              <p className="text-sm text-muted-foreground">
                Sí. Puedes cancelar en cualquier momento desde tu cuenta.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">¿Cómo funciona la garantía de 7 días?</p>
              <p className="text-sm text-muted-foreground">
                Si no te convence, pides el reembolso dentro de los primeros 7 días.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">¿Cómo obtengo la verificación universitaria?</p>
              <p className="text-sm text-muted-foreground">
                Verificación por correo institucional o revisión según disponibilidad.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">¿Qué medio de pago usan?</p>
              <p className="text-sm text-muted-foreground">MercadoPago (pago seguro).</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">Activa Premium Pro y haz que tu perfil se vea profesional.</p>
              <p className="text-sm text-muted-foreground">Destácate en tu universidad. Cancela cuando quieras.</p>
            </div>
            <PremiumWaitlistModal>
              <Button size="lg">Activar Premium Pro</Button>
            </PremiumWaitlistModal>
          </CardContent>
        </Card>
      </div>
    </FullScreenPageLayout>
  );
}
