import { deleteAllProfilesExceptMultiple } from "@/lib/api/database-cleanup";

/**
 * Limpia la base de datos manteniendo solo las cuentas especificadas
 */
export async function cleanupDatabaseKeepAccounts() {
  const keepUserIds = [
    'a12b715b-588a-41eb-bc09-5739bb579894', // Heider Gonzalez ⭐
    '500fe1e1-5e31-44d7-93d0-74a0141d51dd'  // test_user_21
  ];
  
  console.log('🧹 Iniciando limpieza de la base de datos...');
  console.log(`📋 Manteniendo ${keepUserIds.length} cuentas`);
  
  try {
    const result = await deleteAllProfilesExceptMultiple(keepUserIds);
    
    if (result.success) {
      console.log('✅ Base de datos limpiada exitosamente');
      console.log('👥 Cuentas conservadas:', keepUserIds);
    } else {
      console.error('❌ Error limpiando la base de datos:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error en la limpieza:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Función para ejecutar desde la consola del navegador
(window as any).cleanupDatabase = cleanupDatabaseKeepAccounts;