import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/use-premium";
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Crown, ExternalLink, Mail } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Summary = {
  days: number;
  profile_views: number;
  project_views: number;
  project_click_demo: number;
  project_click_contact: number;
};

type DailyRow = {
  day: string;
  profile_views: number;
  project_views: number;
  project_click_demo: number;
  project_click_contact: number;
};

type TopProject = {
  post_id: string;
  title: string;
  views: number;
  demo_clicks: number;
  contact_clicks: number;
};

export default function Analytics() {
  const navigate = useNavigate();
  const { isPremium, isLoading: isPremiumLoading } = usePremium();
  const [days, setDays] = useState(7);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["analytics-summary", days],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_my_analytics_summary", {
        p_days: days,
      });
      if (error) throw error;
      return data as Summary;
    },
    enabled: !isPremiumLoading && isPremium,
  });

  const { data: daily, isLoading: dailyLoading } = useQuery({
    queryKey: ["analytics-daily", days],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_my_analytics_daily", {
        p_days: days,
      });
      if (error) throw error;
      return (data || []) as DailyRow[];
    },
    enabled: !isPremiumLoading && isPremium,
  });

  const { data: topProjects, isLoading: topLoading } = useQuery({
    queryKey: ["analytics-top-projects", days],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_my_top_projects", {
        p_days: days,
        p_limit: 10,
      });
      if (error) throw error;
      return (data || []) as TopProject[];
    },
    enabled: !isPremiumLoading && isPremium,
  });

  const chartData = useMemo(() => {
    return (daily || []).map((row) => ({
      ...row,
      dayLabel: format(new Date(row.day), "d MMM", { locale: es }),
    }));
  }, [daily]);

  const isLoading = isPremiumLoading || summaryLoading || dailyLoading || topLoading;

  return (
    <FullScreenPageLayout title="Analytics Pro">
      <div className="container px-2 sm:px-4 max-w-5xl pt-6 pb-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crown className="h-3.5 w-3.5" />
              Premium Pro
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              Últimos {days} días
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={days === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(7)}
            >
              7 días
            </Button>
            <Button
              type="button"
              variant={days === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(30)}
              disabled={!isPremium}
            >
              30 días
            </Button>
            <Button
              type="button"
              variant={days === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(90)}
              disabled={!isPremium}
            >
              90 días
            </Button>
          </div>
        </div>

        {!isPremiumLoading && !isPremium ? (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Desbloquea Analytics Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Analytics Pro te muestra métricas reales de alcance y leads: vistas de perfil/proyectos y clics de alto valor.
              </p>
              <Button onClick={() => navigate("/pricing")}>
                Ver Premium Pro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Vistas de perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.profile_views ?? 0}</div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Vistas de proyectos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.project_views ?? 0}</div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clicks a Demo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.project_click_demo ?? 0}</div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clicks a Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.project_click_contact ?? 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle>Actividad</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Cargando...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayLabel" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="profile_views" name="Perfil" stroke="#2563eb" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="project_views" name="Proyectos" stroke="#16a34a" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="project_click_demo" name="Demo" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="project_click_contact" name="Contacto" stroke="#a855f7" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle>Top proyectos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">Cargando...</div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-3">Proyecto</th>
                          <th className="py-2 pr-3">Vistas</th>
                          <th className="py-2 pr-3">Demo</th>
                          <th className="py-2 pr-3">Contacto</th>
                          <th className="py-2">CTR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(topProjects || []).map((p) => {
                          const clicks = (p.demo_clicks || 0) + (p.contact_clicks || 0);
                          const ctr = p.views ? Math.round((clicks / p.views) * 100) : 0;

                          return (
                            <tr key={p.post_id} className="border-t border-border/60">
                              <td className="py-3 pr-3 font-medium">{p.title}</td>
                              <td className="py-3 pr-3">{p.views}</td>
                              <td className="py-3 pr-3">
                                <span className="inline-flex items-center gap-1">
                                  <ExternalLink className="h-4 w-4" />
                                  {p.demo_clicks}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {p.contact_clicks}
                                </span>
                              </td>
                              <td className="py-3">{ctr}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </FullScreenPageLayout>
  );
}
