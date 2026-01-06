import { supabaseAdmin } from './supabase-admin';
import { BOTS } from './bot-definitions';

async function resetBots() {
  console.log('🧹 Reset de bots...');
  
  for (const bot of BOTS) {
    // 1) Borrar posts del bot
    const { error: postsError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('user_id', (await supabaseAdmin.auth.admin.listUsers()).data.users.find(u => u.email === bot.email)?.id);

    if (postsError) {
      console.error(`❌ Error borrando posts de ${bot.username}:`, postsError);
    }

    // 2) Borrar perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('username', bot.profile.username);

    if (profileError) {
      console.error(`❌ Error borrando profile de ${bot.username}:`, profileError);
    }

    // 3) Borrar usuario auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      (await supabaseAdmin.auth.admin.listUsers()).data.users.find(u => u.email === bot.email)?.id || ''
    );

    if (authError) {
      console.error(`❌ Error borrando auth user ${bot.username}:`, authError);
    }

    console.log(`🗑️ Bot ${bot.username} eliminado`);
  }

  console.log('✅ Reset completado');
}

// Si se pasa --reset, borra; si no, crea
if (process.argv.includes('--reset')) {
  resetBots().catch(console.error);
} else {
  const { seedBots } = await import('./seed-bots');
  seedBots().catch(console.error);
}
