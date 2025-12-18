import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { academicRoles } from "@/data/institutions";

interface UserInfoFieldsProps {
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  institutionName: string;
  setInstitutionName: (institutionName: string) => void;
  academicRole: string;
  setAcademicRole: (academicRole: string) => void;
  loading: boolean;
}

export function UserInfoFields({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  gender,
  setGender,
  institutionName,
  setInstitutionName,
  academicRole,
  setAcademicRole,
  loading
}: UserInfoFieldsProps) {

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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="register-email"
          name="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>
      
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <Input
          id="register-password"
          name="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="institution" className="block text-sm font-medium mb-1">
          Institución Educativa *
        </label>
        <Input
          id="institution"
          name="institution"
          type="text"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          placeholder="Escribe el nombre de tu institución"
          required
          disabled={loading}
          autoComplete="organization"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ejemplo: Universidad Nacional, SENA, Colegio San Patricio, etc.
        </p>
      </div>

      <div>
        <label htmlFor="academic-role" className="block text-sm font-medium mb-1">
          Rol Académico
        </label>
        <Select value={academicRole} onValueChange={setAcademicRole} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu rol (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {academicRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium mb-1">
          Sexo
        </label>
        <Select value={gender} onValueChange={setGender} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu sexo (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masculino">Masculino</SelectItem>
            <SelectItem value="femenino">Femenino</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
            <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}