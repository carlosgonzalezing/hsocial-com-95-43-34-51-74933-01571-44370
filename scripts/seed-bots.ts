import { supabaseAdmin } from './supabase-admin';
import { BOTS } from './bot-definitions';

async function createBot(bot: typeof BOTS[0]) {
  try {
    // 1) Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: bot.email,
      password: bot.password,
      email_confirm: true,
      user_metadata: {
        username: bot.username,
        is_bot: true, // Flag para identificar bots
      },
    });

    if (authError) {
      console.error(`❌ Error creando auth user ${bot.username}:`, authError);
      return null;
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
      return null;
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
        console.log(`✅ Post creado: ${bot.username} - "${post.content.slice(0, 50)}..."`);
      }
    }

    return userId;
  } catch (err) {
    console.error(`❌ Error inesperado con bot ${bot.username}:`, err);
    return null;
  }
}

async function seedBots() {
  console.log('🌱 Iniciando seed de bots...');
  
  for (const bot of BOTS) {
    const userId = await createBot(bot);
    if (userId) {
      console.log(`🎉 Bot ${bot.username} creado completamente (ID: ${userId})`);
    }
    console.log('---');
  }

  console.log('✅ Seed completado');
}

// Ejecutar siempre
seedBots().catch(console.error);

export { seedBots };
