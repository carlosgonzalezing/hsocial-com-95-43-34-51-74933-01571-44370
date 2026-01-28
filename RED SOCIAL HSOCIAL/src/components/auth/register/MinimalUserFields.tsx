import { Input } from "@/components/ui/input";

interface MinimalUserFieldsProps {
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
}

export function MinimalUserFields({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  loading
}: MinimalUserFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Nombre de usuario
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="tu_nombre_usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          required
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Correo electrónico
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          autoComplete="new-password"
          minLength={6}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Mínimo 6 caracteres
        </p>
      </div>
    </>
  );
}
