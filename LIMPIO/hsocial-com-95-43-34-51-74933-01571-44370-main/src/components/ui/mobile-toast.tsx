import { toast as originalToast } from "@/hooks/use-toast";

interface MobileToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  position?: "top" | "bottom";
}

export function mobileToast({
  title,
  description,
  variant = "default",
  duration = 4000,
  position = "bottom"
}: MobileToastOptions) {
  return originalToast({
    title,
    description,
    variant,
    duration
  });
}

// Predefined mobile-friendly toasts
export const mobileToasts = {
  success: (message: string) => mobileToast({
    title: "¡Éxito!",
    description: message,
    variant: "default"
  }),
  
  error: (message: string) => mobileToast({
    title: "Error",
    description: message,
    variant: "destructive",
    duration: 5000
  }),
  
  loading: (message: string = "Cargando...") => mobileToast({
    title: message,
    duration: 0 // Persistent until dismissed
  }),
  
  postCreated: () => mobileToast({
    title: "¡Publicación creada!",
    description: "Tu contenido se ha compartido exitosamente",
    variant: "default"
  }),
  
  uploadProgress: (progress: number) => mobileToast({
    title: `Subiendo... ${progress}%`,
    duration: 1000
  }),
  
  networkError: () => mobileToast({
    title: "Sin conexión",
    description: "Verifica tu conexión a internet e intenta de nuevo",
    variant: "destructive",
    duration: 6000
  }),
  
  validationError: (field: string) => mobileToast({
    title: "Campo requerido",
    description: `Por favor completa: ${field}`,
    variant: "destructive",
    duration: 3000
  })
};