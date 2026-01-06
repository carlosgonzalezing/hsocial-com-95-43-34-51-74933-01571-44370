import { supabaseAdmin } from './supabase-admin';
import { NEW_BOTS } from './new-bots-definitions';

async function createNewBots() {
  console.log('🌱 Creando 10 nuevos bots patriotas...');
  
  for (const bot of NEW_BOTS) {
    try {
      // 1) Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: bot.email,
        password: bot.password,
        email_confirm: true,
        user_metadata: {
          username: bot.username,
          is_bot: true,
        },
      });

      if (authError) {
        console.error(`❌ Error creando auth user ${bot.username}:`, authError);
        continue;
      }

      const userId = authData.user.id;
      console.log(`✅ Usuario auth creado: ${bot.username} (${userId})`);

      // 2) Crear perfil en tabla profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          ...bot.profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error(`❌ Error creando profile ${bot.username}:`, profileError);
        continue;
      }

      console.log(`✅ Perfil creado: ${bot.username}`);

      // 3) Crear posts
      for (const post of bot.posts) {
        const { error: postError } = await supabaseAdmin.from('posts').insert({
          user_id: userId,
          content: post.content,
          post_type: post.post_type || 'post',
          visibility: post.visibility || 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (postError) {
          console.error(`❌ Error creando post para ${bot.username}:`, postError);
        } else {
          console.log(`✅ Post creado: ${bot.username}`);
        }
      }

      console.log(`🎉 Bot ${bot.username} creado completamente`);
      console.log('---');
      
    } catch (err) {
      console.error(`❌ Error inesperado con bot ${bot.username}:`, err);
    }
  }

  console.log('✅ Seed de nuevos bots completado');
}

createNewBots().catch(console.error);
