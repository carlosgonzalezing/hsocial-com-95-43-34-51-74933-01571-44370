import { supabaseAdmin } from './supabase-admin';

async function checkSpecialUser() {
  console.log('🔍 Verificando usuario especial...');
  
  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', 'a12b715b-588a-41eb-bc09-5739bb579894')
    .single();
  
  if (error) {
    console.error('❌ Error:', error);
    return null;
  }
  
  console.log('👤 Usuario encontrado:');
  console.log('ID:', user.id);
  console.log('Username:', user.username);
  console.log('Bio:', user.bio);
  console.log('Career:', user.career);
  
  return user;
}

async function grantSpecialPermissions() {
  console.log('🔓 Otorgando permisos especiales...');
  
  // Agregar metadata especial al usuario
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById('a12b715b-588a-41eb-bc09-5739bb579894');
  
  if (authError) {
    console.error('❌ Error obteniendo usuario auth:', authError);
    return;
  }
  
  // Actualizar metadata con permisos especiales
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    'a12b715b-588a-41eb-bc09-5739bb579894',
    {
      user_metadata: {
        ...authUser.user.user_metadata,
        special_permissions: true,
        unlimited_posts: true,
        bypass_email_restrictions: true,
        content_admin: true
      }
    }
  );
  
  if (updateError) {
    console.error('❌ Error actualizando permisos:', updateError);
  } else {
    console.log('✅ Permisos especiales otorgados');
  }
}

async function main() {
  const user = await checkSpecialUser();
  
  if (user) {
    await grantSpecialPermissions();
  }
}

main().catch(console.error);
