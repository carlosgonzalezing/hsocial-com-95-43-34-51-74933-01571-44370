import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useRegister(setLoading: (loading: boolean) => void, sendVerificationEmail: (email: string, username: string) => Promise<any>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState("");
  const [gender, setGender] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [academicRole, setAcademicRole] = useState("");
  const { toast } = useToast();


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Registro simplificado - solo campos básicos
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            career: career || null,
            semester: semester || null,
            gender: gender || null,
            institution_name: institutionName || null,
            academic_role: academicRole || null,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;

      // Actualizar perfil con datos disponibles
      if (data.user) {
        const { error: profileError } = await (supabase as any).from('profiles').upsert({
          id: data.user.id,
          username,
          career: career || null,
          semester: semester || null,
          gender: gender || null,
          institution_name: institutionName || null,
          academic_role: academicRole || null,
        });
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }

      toast({
        title: "¡Bienvenido a H Social!",
        description: "Tu cuenta ha sido creada exitosamente. Completa tu perfil para obtener una mejor experiencia.",
      });
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    career,
    setCareer,
    semester,
    setSemester,
    gender,
    setGender,
    institutionName,
    setInstitutionName,
    academicRole,
    setAcademicRole,
    handleRegister
  };
}
