import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Feed } from "@/components/feed/Feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Users } from "lucide-react";

export default function GroupDetail() {
  const { slugOrId } = useParams();
  const { toast } = useToast();
  const [joining, setJoining] = useState(false);

  const slugOrIdSafe = useMemo(() => (slugOrId ?? "").trim(), [slugOrId]);

  const { data: groupRows, isLoading: groupLoading } = useQuery({
    queryKey: ["group-detail", slugOrIdSafe],
    enabled: !!slugOrIdSafe,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_group_by_slug_or_id", {
        slug_or_id_param: slugOrIdSafe,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  const group = groupRows?.[0];

  const handleRequestJoin = async () => {
    if (!group?.id) return;
    setJoining(true);
    try {
      const { data, error } = await supabase.rpc("request_to_join_group", {
        group_id_param: group.id,
      });
      if (error) throw error;

      const success = (data as any)?.success;
      const message = (data as any)?.message;
      const err = (data as any)?.error;

      if (success) {
        toast({
          title: "Solicitud enviada",
          description: message || "Tu solicitud fue enviada al equipo del grupo.",
        });
      } else {
        toast({
          title: "No se pudo enviar",
          description: err || "Intenta nuevamente.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Ocurrió un error.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (groupLoading) {
    return (
      <FullScreenPageLayout title="Grupo">
        <div className="container px-2 sm:px-4 max-w-5xl pt-4">
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
        </div>
      </FullScreenPageLayout>
    );
  }

  if (!group) {
    return (
      <FullScreenPageLayout title="Grupo">
        <div className="container px-2 sm:px-4 max-w-5xl pt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Grupo no encontrado o no tienes acceso.</p>
            </CardContent>
          </Card>
        </div>
      </FullScreenPageLayout>
    );
  }

  return (
    <FullScreenPageLayout title={group.name || "Grupo"}>
      <div className="container px-2 sm:px-4 max-w-5xl pt-4 pb-10 space-y-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={group.avatar_url || undefined} />
                <AvatarFallback>
                  {(group.name || "G").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold truncate">{group.name}</h2>
                  {group.type && (
                    <Badge variant="secondary" className="text-xs">
                      {String(group.type).toUpperCase()}
                    </Badge>
                  )}
                  {group.is_private && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Privado
                    </Badge>
                  )}
                </div>

                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {group.member_count ?? 0} miembros
                  </Badge>
                  {group.category && (
                    <Badge variant="outline" className="text-xs">
                      {group.category}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <Button onClick={handleRequestJoin} disabled={joining}>
                  {joining ? "Enviando..." : "Solicitar unirme"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold mb-3">Publicaciones</h3>
            <Feed groupId={group.id} />
          </CardContent>
        </Card>
      </div>
    </FullScreenPageLayout>
  );
}
