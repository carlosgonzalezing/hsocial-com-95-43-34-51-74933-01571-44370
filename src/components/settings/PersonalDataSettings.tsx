import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PersonalDataSettings() {
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Adjust the profile load to relax typing and safely access fields:
  const loadPersonalData = async (userId: string) => {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('birth_date')
      .eq('id' as any, userId as any)
      .maybeSingle();
    if (error) {
      console.error('Error loading personal data:', error);
      return null;
    }
    const birthDate = (data as any)?.birth_date as string | null | undefined;
    return birthDate ?? null;
  };

  useEffect(() => {
    const fetchPersonalData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const loadedBirthDate = await loadPersonalData(user.id);
          setBirthDate(loadedBirthDate);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load personal data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalData();
  }, [toast]);

  const updateBirthDate = async (newBirthDate: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const { error } = await (supabase as any)
        .from("profiles")
        .update({ birth_date: newBirthDate } as any)
        .eq("id" as any, user.id as any);

      if (error) throw error;

      setBirthDate(newBirthDate);
      toast({
        title: "Success",
        description: "Birth date updated successfully.",
      });
    } catch (error) {
      console.error("Error updating birth date:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update birth date.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const newBirthDate = new FormData(form).get("birthDate") as string;
    await updateBirthDate(newBirthDate);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Datos Personales</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
          <Input
            type="date"
            id="birthDate"
            name="birthDate"
            value={birthDate || ""}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
