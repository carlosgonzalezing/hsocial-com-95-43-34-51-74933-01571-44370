
import { supabase } from "@/integrations/supabase/client";

/**
 * Ejecuta consultas SQL directamente en Supabase
 * @param query Consulta SQL a ejecutar
 */
export async function executeSql(query: string) {
  try {
    // Using a type assertion to work with the existing types
    // @ts-ignore - Ignoring type check for RPC function call
    const { data, error } = await supabase.rpc('execute_sql', { query });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error ejecutando SQL:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Configura las restricciones de clave foránea para habilitar eliminación en cascada
 */
export async function setupCascadeDeleteConstraints() {
  const tables = ['posts', 'comments', 'reactions', 'friendships', 'messages', 'notifications', 'hidden_posts'];
  
  try {
    for (const table of tables) {
      const query = `
        ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${table}_user_id_fkey;
        ALTER TABLE ${table} ADD CONSTRAINT ${table}_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
      `;
      
      await executeSql(query);
    }
    
    return { success: true, message: "Restricciones de eliminación en cascada configuradas correctamente" };
  } catch (error) {
    console.error("Error configurando restricciones:", error);
    return { 
      success: false, 
      message: "Error configurando restricciones", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Elimina todos los perfiles excepto uno específico
 * @param keepUserId ID del usuario que se desea conservar
 */
export async function deleteAllProfilesExcept(keepUserId: string) {
  try {
    // Verificar que el usuario existe
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', keepUserId)
      .single();
    
    if (userCheckError || !userExists) {
      throw new Error(`El usuario con ID ${keepUserId} no existe`);
    }

    // Eliminar todos los perfiles excepto el especificado
    const query = `DELETE FROM profiles WHERE id != '${keepUserId}'`;
    return await executeSql(query);
  } catch (error) {
    console.error("Error al eliminar perfiles:", error);
    return { 
      success: false, 
      message: "Error al eliminar perfiles", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Elimina todos los perfiles excepto los especificados
 * @param keepUserIds Array de IDs de usuarios que se desean conservar
 */
export async function deleteAllProfilesExceptMultiple(keepUserIds: string[]) {
  try {
    if (!keepUserIds.length) {
      return { success: false, message: "No se proporcionaron IDs para conservar" };
    }

    // Verificar que todos los usuarios existen
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .in('id', keepUserIds);
    
    if (userCheckError) {
      throw new Error(`Error verificando usuarios: ${userCheckError.message}`);
    }

    if (!existingUsers || existingUsers.length !== keepUserIds.length) {
      const foundIds = existingUsers?.map(u => u.id) || [];
      const missingIds = keepUserIds.filter(id => !foundIds.includes(id));
      throw new Error(`Los siguientes usuarios no existen: ${missingIds.join(', ')}`);
    }

    // Eliminar todos los perfiles excepto los especificados
    const ids = keepUserIds.map(id => `'${id}'`).join(',');
    const query = `DELETE FROM profiles WHERE id NOT IN (${ids})`;
    return await executeSql(query);
  } catch (error) {
    console.error("Error al eliminar perfiles:", error);
    return { 
      success: false, 
      message: "Error al eliminar perfiles", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Elimina perfiles específicos por su ID
 * @param profileIds Array de IDs de perfiles a eliminar
 */
export async function deleteSpecificProfiles(profileIds: string[]) {
  try {
    if (!profileIds.length) {
      return { success: false, message: "No se proporcionaron IDs para eliminar" };
    }
    
    const ids = profileIds.map(id => `'${id}'`).join(',');
    const query = `DELETE FROM profiles WHERE id IN (${ids})`;
    return await executeSql(query);
  } catch (error) {
    console.error("Error al eliminar perfiles específicos:", error);
    return { 
      success: false, 
      message: "Error al eliminar perfiles específicos", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Elimina todas las publicaciones de un usuario específico
 * @param userId ID del usuario cuyas publicaciones se desean eliminar
 */
export async function deleteAllPostsFromUser(userId: string) {
  try {
    // Verificar que el usuario existe
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userCheckError || !userExists) {
      throw new Error(`El usuario con ID ${userId} no existe`);
    }

    // Eliminar todas las publicaciones del usuario especificado
    const query = `DELETE FROM posts WHERE user_id = '${userId}'`;
    return await executeSql(query);
  } catch (error) {
    console.error("Error al eliminar publicaciones:", error);
    return { 
      success: false, 
      message: "Error al eliminar publicaciones", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Elimina publicaciones específicas por su ID
 * @param postIds Array de IDs de publicaciones a eliminar
 */
export async function deleteSpecificPosts(postIds: string[]) {
  try {
    if (!postIds.length) {
      return { success: false, message: "No se proporcionaron IDs de publicaciones para eliminar" };
    }
    
    const ids = postIds.map(id => `'${id}'`).join(',');
    const query = `DELETE FROM posts WHERE id IN (${ids})`;
    return await executeSql(query);
  } catch (error) {
    console.error("Error al eliminar publicaciones específicas:", error);
    return { 
      success: false, 
      message: "Error al eliminar publicaciones específicas", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * NOTA IMPORTANTE:
 * 
 * Para utilizar estas funciones, primero debes crear la función RPC 'execute_sql' en Supabase:
 * 
 * 1. Ve a la sección SQL del panel de Supabase
 * 2. Ejecuta la siguiente consulta:
 * 
 * CREATE OR REPLACE FUNCTION execute_sql(query text)
 * RETURNS JSONB
 * LANGUAGE plpgsql
 * SECURITY DEFINER
 * AS $$
 * DECLARE
 *   result JSONB;
 * BEGIN
 *   EXECUTE query;
 *   result := '{"message": "Query executed successfully"}'::JSONB;
 *   RETURN result;
 * EXCEPTION WHEN OTHERS THEN
 *   result := jsonb_build_object('error', SQLERRM);
 *   RETURN result;
 * END;
 * $$;
 * 
 * 3. Asegúrate de configurar los permisos adecuados para esta función
 */

