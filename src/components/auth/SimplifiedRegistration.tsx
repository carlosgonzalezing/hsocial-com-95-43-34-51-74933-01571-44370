import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { MinimalUserFields } from "./register/MinimalUserFields";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "./register/useRegister";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SimplifiedRegistrationProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sendVerificationEmail: (email: string, username: string) => Promise<any>;
}

export function SimplifiedRegistration({ 
  loading, 
  setLoading, 
  sendVerificationEmail 
}: SimplifiedRegistrationProps) {
  const [acceptsPolicy, setAcceptsPolicy] = useState(false);

  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    accountType,
    setAccountType,
    personStatus,
    setPersonStatus,
    companyName,
    setCompanyName,
    handleRegister
  } = useRegister(setLoading, sendVerificationEmail);

  return (
    <div className="space-y-6">
      {/* Social Auth - Prominente */}
      <SocialAuthButtons 
        loading={loading} 
        setLoading={setLoading}
        mode="register"
      />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O crea una cuenta con email
          </span>
        </div>
      </div>

      {/* Formulario Simple - Solo 3 campos */}
      <form onSubmit={handleRegister} className="space-y-4">
        <MinimalUserFields
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de cuenta
          </label>
          <Select
            value={accountType}
            onValueChange={(v) => setAccountType(v as 'person' | 'company')}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="person">Persona</SelectItem>
              <SelectItem value="company">Empresa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {accountType === 'person' ? (
          <div>
            <label className="block text-sm font-medium mb-1">
              Eres...
            </label>
            <Select
              value={personStatus}
              onValueChange={(v) => setPersonStatus(v as any)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Estudiante</SelectItem>
                <SelectItem value="professional">Profesional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre de la empresa
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
              required
              placeholder="Nombre de tu empresa"
              autoComplete="organization"
            />
          </div>
        )}

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox 
            id="policy-checkbox"
            checked={acceptsPolicy}
            onCheckedChange={(checked) => setAcceptsPolicy(checked === true)}
            required
          />
          <label htmlFor="policy-checkbox" className="text-sm text-muted-foreground leading-tight cursor-pointer">
            Acepto la{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Política de Privacidad
            </a>
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 font-semibold" 
          disabled={
            loading ||
            !acceptsPolicy ||
            !email ||
            !password ||
            !username ||
            (accountType === 'person' && !personStatus) ||
            (accountType === 'company' && !companyName)
          }
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Después del registro podrás completar tu perfil académico
        </p>
      </form>
    </div>
  );
}
