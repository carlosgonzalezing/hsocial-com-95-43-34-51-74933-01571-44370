
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username } = await req.json();

    // Log the request for debugging
    console.log("Received request:", { email, username });

    // Verificar que se reciban los datos correctos
    if (!email || !username) {
      console.error("Missing required fields:", { email, username });
      return new Response(
        JSON.stringify({ error: "Email y username son requeridos" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Enviando correo a ${email} para el usuario ${username}`);

    // Generar el enlace de verificación usando Supabase Auth
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: 'temporary-password-for-link', // Required for signup link generation
      options: {
        redirectTo: `${new URL(req.url).origin}/auth?verified=true`
      }
    });

    if (linkError) {
      console.error("Error generando enlace de verificación:", linkError);
      throw linkError;
    }

    const verificationLink = linkData.properties?.action_link;
    
    if (!verificationLink) {
      throw new Error("No se pudo generar el enlace de verificación");
    }

    console.log("Enlace de verificación generado exitosamente");

    const { data, error } = await resend.emails.send({
      from: "H1Z <onboarding@resend.dev>",
      to: [email],
      subject: "Confirma tu registro en H1Z",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">¡Hola ${username}!</h1>
            </div>
            
            <div style="color: #666; font-size: 16px; line-height: 1.6;">
              <p>¡Bienvenido a H1Z! Para activar completamente tu cuenta y acceder a todas las funciones de nuestra red social estudiantil, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; background-color: #4a6cf7; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">✉️ Verificar mi cuenta y continuar</a>
              </div>
              
              <p style="text-align: center; font-size: 14px; color: #888; margin: 10px 0;">
                Después de hacer clic en el enlace, serás redirigido automáticamente al inicio de sesión.
              </p>
              
              <!-- Sección de beneficios -->
              <div style="background-color: #f5f8ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h2 style="color: #4a6cf7; margin-top: 0; font-size: 18px;">Beneficios de verificar tu cuenta</h2>
                <ul style="padding-left: 20px; color: #555;">
                  <li style="margin-bottom: 10px;">Acceso completo a todas las funcionalidades de la plataforma</li>
                  <li style="margin-bottom: 10px;">Conecta con estudiantes de tu misma carrera y semestre</li>
                  <li style="margin-bottom: 10px;">Comparte recursos educativos y experiencias académicas</li>
                  <li style="margin-bottom: 10px;">Recibe notificaciones sobre eventos y actividades relevantes</li>
                  <li style="margin-bottom: 10px;">Perfil verificado que genera mayor confianza en la comunidad</li>
                </ul>
              </div>
              
              <!-- Sección de preguntas frecuentes -->
              <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 25px;">
                <h2 style="color: #333; font-size: 18px;">Preguntas frecuentes</h2>
                
                <div style="margin-bottom: 15px;">
                  <p style="font-weight: bold; margin-bottom: 5px; color: #444;">¿Qué pasa si no verifico mi cuenta?</p>
                  <p style="margin-top: 0;">Las funcionalidades de tu cuenta estarán limitadas hasta que completes la verificación.</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <p style="font-weight: bold; margin-bottom: 5px; color: #444;">¿Cuánto tiempo tengo para verificar mi cuenta?</p>
                  <p style="margin-top: 0;">El enlace de verificación es válido por 7 días. Después de este período, deberás solicitar uno nuevo.</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <p style="font-weight: bold; margin-bottom: 5px; color: #444;">¿No recibiste el correo de verificación?</p>
                  <p style="margin-top: 0;">Revisa tu carpeta de spam o solicita un nuevo enlace de verificación desde tu perfil.</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <p style="font-weight: bold; margin-bottom: 5px; color: #444;">¿Necesitas ayuda adicional?</p>
                  <p style="margin-top: 0;">Contacta a nuestro equipo de soporte en <a href="mailto:soporte@h1z.com" style="color: #4a6cf7; text-decoration: none;">soporte@h1z.com</a></p>
                </div>
              </div>
              
              <p>Si no has sido tú quien realizó este registro, por favor ignora este mensaje.</p>
              
              <p>¡Te esperamos en la Red Social H1Z!</p>
              
              <p style="margin-bottom: 0;">Atentamente,<br>El equipo de H1Z</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 14px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error al enviar correo:", error);
      throw error;
    }

    console.log("Correo enviado exitosamente:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error en la función:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
