import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  status: string;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export default function Companies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("companies")
        .select("id, name, slug, description, logo_url, website_url, status")
        .eq("status", "active")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as CompanyRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => String(c.name || "").toLowerCase().includes(q));
  }, [companies, searchQuery]);

  const openCreate = () => {
    setName("");
    setDescription("");
    setWebsiteUrl("");
    setCreateOpen(true);
  };

  const createCompany = async () => {
    if (creating) return;
    const cleanName = name.trim();
    if (cleanName.length < 2) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const slug = slugify(cleanName);
      if (!slug) throw new Error("Nombre inválido");

      const { data: company, error: companyError } = await (supabase as any)
        .from("companies")
        .insert({
          name: cleanName,
          slug,
          description: description.trim() ? description.trim() : null,
          website_url: websiteUrl.trim() ? websiteUrl.trim() : null,
          created_by: user.id,
          status: "active",
        })
        .select("id")
        .single();

      if (companyError) throw companyError;

      const { error: memberError } = await (supabase as any)
        .from("company_members")
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      queryClient.invalidateQueries({ queryKey: ["companies"], exact: true });

      toast({
        title: "Empresa creada",
        description: "Tu empresa se creó correctamente.",
      });
      setCreateOpen(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo crear la empresa",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <FullScreenPageLayout title="Empresas">
      <div className="container px-2 sm:px-4 max-w-5xl pt-4 pb-10 space-y-4">
        <div className="sticky top-0 z-10 bg-background pb-3">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Crea tu marca y publica como empresa</p>
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Crear
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar empresas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-lg bg-muted border-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">No hay empresas para mostrar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((c) => (
              <Link key={c.id} to={`/companies/${c.slug || c.id}`} className="block">
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4 flex gap-3 items-start">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={c.logo_url || undefined} />
                      <AvatarFallback>{(c.name || "E").slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{c.name}</p>
                      {c.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                      )}
                      {c.website_url && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{c.website_url}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear empresa</DialogTitle>
              <DialogDescription>
                Crea una página de empresa para publicar y representar tu marca.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Nombre</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la empresa" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Descripción (opcional)</p>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué hace la empresa?" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Sitio web (opcional)</p>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button onClick={createCompany} disabled={creating || name.trim().length < 2}>
                {creating ? "Creando..." : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FullScreenPageLayout>
  );
}
