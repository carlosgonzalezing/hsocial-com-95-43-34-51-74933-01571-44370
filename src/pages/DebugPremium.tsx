import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DebugPremium() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Verificar si es premium
        const { data: premiumData } = await (supabase as any).rpc("is_user_premium");
        setIsPremium(Boolean(premiumData));
        
        // Verificar suscripción
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setSubscription(subData);
      }
    };

    checkUser();
  }, []);

  const activatePremium = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan: 'premium_pro',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
          provider: 'mercadopago'
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      } else {
        toast({
          title: "¡Premium activado!",
          description: "Tu cuenta Premium Pro ha sido activada por 30 días."
        });
        
        // Recargar datos
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Estado Premium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>User ID:</strong> {userId || "Cargando..."}
          </div>
          
          <div>
            <strong>Estado Premium:</strong> {isPremium ? "✅ Activo" : "❌ Inactivo"}
          </div>
          
          <div>
            <strong>Suscripción:</strong>
            {subscription ? (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
                {JSON.stringify(subscription, null, 2)}
              </pre>
            ) : (
              "No se encontró suscripción"
            )}
          </div>
          
          {!isPremium && userId && (
            <Button onClick={activatePremium} className="mt-4">
              Activar Premium Manualmente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
