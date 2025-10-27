
import { supabase } from "@/integrations/supabase/client";

// Dar un corazón a un perfil
export async function giveHeartToProfile(profileId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // No permitir dar corazones a su propio perfil
    if (user.id === profileId) {
      throw new Error("No puedes dar corazones a tu propio perfil");
    }

    const { data, error } = await supabase
      .from('profile_hearts')
      .insert({
        profile_id: profileId,
        giver_id: user.id
      })
      .select('id')
      .single();

    if (error) {
      // Si ya dio un corazón, eliminar el corazón (toggle)
      if (error.code === '23505') { // Código de error de restricción única
        const { error: deleteError } = await supabase
          .from('profile_hearts')
          .delete()
          .match({ profile_id: profileId, giver_id: user.id });
        
        if (deleteError) throw deleteError;
        return { heart: null, removed: true };
      }
      throw error;
    }

    // Crear notificación de corazón recibido
    await supabase
      .from('notifications')
      .insert({
        type: 'profile_heart_received',
        sender_id: user.id,
        receiver_id: profileId,
        message: 'te ha enviado un corazón ❤️'
      });

    return { heart: data, removed: false };
  } catch (error) {
    console.error("Error al dar/quitar corazón:", error);
    throw error;
  }
}

// Verificar si el usuario actual ha dado corazón a un perfil
export async function hasGivenHeartToProfile(profileId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profile_hearts')
      .select('id')
      .eq('profile_id', profileId)
      .eq('giver_id', user.id)
      .maybeSingle();

    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error("Error al verificar corazón:", error);
    return false;
  }
}

// Contar corazones de un perfil
export async function countProfileHearts(profileId: string) {
  try {
    const { count, error } = await supabase
      .from('profile_hearts')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error al contar corazones:", error);
    return 0;
  }
}

// Contar corazones totales (perfil + engagement)
export async function countTotalHearts(userId: string) {
  try {
    const { count: profileCount, error: profileError } = await supabase
      .from('profile_hearts')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId);

    if (profileError) throw profileError;

    const { data: engagementData, error: engagementError } = await supabase
      .from('engagement_hearts')
      .select('hearts_received')
      .eq('user_id', userId);

    if (engagementError) throw engagementError;

    const engagementSum = (engagementData || []).reduce((sum, row) => sum + (row.hearts_received || 0), 0);

    return (profileCount || 0) + engagementSum;
  } catch (error) {
    console.error("Error al contar corazones totales:", error);
    return 0;
  }
}