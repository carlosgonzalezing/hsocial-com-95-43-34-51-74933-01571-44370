
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordInput } from "./password/PasswordInput";
import { PasswordResetDialog } from "./PasswordResetDialog";
import { SocialAuthButtons } from "./SocialAuthButtons";

interface LoginFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function LoginForm({ loading, setLoading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const openResetDialog = () => {
    setResetOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Social Auth Buttons */}
        <SocialAuthButtons 
          loading={loading} 
          setLoading={setLoading}
          mode="login"
        />

        <form onSubmit={handleLogin} className="space-y-4" id="login-form" name="login-form">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="login-email"
              name="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              className="px-0 h-auto font-normal text-sm"
              onClick={openResetDialog}
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cargando..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>

      <PasswordResetDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        email={email}
      />
    </>
  );
}
