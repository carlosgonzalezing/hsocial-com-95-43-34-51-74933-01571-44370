import { supabaseAdmin } from './supabase-admin';
import { SOBERANIA_BOT, SOBERANIA_COMMENTS } from './soberania-bot';

async function createSoberaniaBot() {
  console.log('🛡️ Creando bot de soberanía...');
  
  try {
    // 1) Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: SOBERANIA_BOT.email,
      password: SOBERANIA_BOT.password,
      email_confirm: true,
      user_metadata: {
        username: SOBERANIA_BOT.username,
        is_bot: true,
      },
    });

    if (authError) {
      console.error(`❌ Error creando auth user ${SOBERANIA_BOT.username}:`, authError);
      return;
    }

    const userId = authData.user.id;
    console.log(`✅ Usuario auth creado: ${SOBERANIA_BOT.username} (${userId})`);

    // 2) Crear perfil en tabla profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        ...SOBERANIA_BOT.profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error(`❌ Error creando profile ${SOBERANIA_BOT.username}:`, profileError);
      return;
    }

    console.log(`✅ Perfil creado: ${SOBERANIA_BOT.username}`);

    // 3) Crear posts
    for (const post of SOBERANIA_BOT.posts) {
      const { error: postError } = await supabaseAdmin.from('posts').insert({
        user_id: userId,
        content: post.content,
        post_type: post.post_type || 'post',
        visibility: post.visibility || 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (postError) {
        console.error(`❌ Error creando post para ${SOBERANIA_BOT.username}:`, postError);
      } else {
        console.log(`✅ Post creado: ${SOBERANIA_BOT.username}`);
      }
    }

    console.log(`🎉 Bot ${SOBERANIA_BOT.username} creado completamente`);
    return userId;
    
  } catch (err) {
    console.error(`❌ Error inesperado con bot ${SOBERANIA_BOT.username}:`, err);
    return null;
  }
}

async function createCommentAuthors() {
  console.log('👥 Creando autores de comentarios de soberanía...');
  
  const authors = SOBERANIA_COMMENTS.map(c => c.author_profile);

  for (const author of authors) {
    try {
      // Crear usuario auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${author.username.toLowerCase().replace(/\s+/g, '.')}@hsocial.local`,
        password: 'BotPassword123!',
        email_confirm: true,
        user_metadata: {
          username: author.username,
          is_bot: true,
        },
      });

      if (authError) {
        console.error(`❌ Error creando autor ${author.username}:`, authError.message);
        continue;
      }

      const userId = authData.user.id;
      console.log(`✅ Autor creado: ${author.username} (${userId})`);

      // Crear perfil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          username: author.username,
          bio: author.bio,
          career: author.career,
          avatar_url: author.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error(`❌ Error creando perfil de ${author.username}:`, profileError.message);
      } else {
        console.log(`✅ Perfil de autor creado: ${author.username}`);
      }

    } catch (err) {
      console.error(`❌ Error creando autor ${author.username}:`, err);
    }
    console.log('---');
  }

  console.log('✅ Autores de comentarios de soberanía creados');
}

async function createSoberaniaComments(botUserId: string) {
  console.log('💬 Creando comentarios de soberanía...');
  
  // Obtener el post más reciente del bot de soberanía
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('user_id', botUserId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (postsError || !posts || posts.length === 0) {
    console.error('❌ No se encontró el post del bot de soberanía');
    return;
  }

  const postId = posts[0].id;
  console.log(`📝 Post encontrado: ${postId}`);

  // Obtener todos los usuarios para mapear usernames a IDs
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const usernameToId = new Map();
  users.users.forEach(user => {
    const username = user.user_metadata?.username;
    if (username) {
      usernameToId.set(username, user.id);
    }
  });

  // Crear comentarios
  for (const comment of SOBERANIA_COMMENTS) {
    const authorId = usernameToId.get(comment.author);
    if (!authorId) {
      console.error(`❌ No se encontró ID para ${comment.author}`);
      continue;
    }

    const { error: commentError } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        user_id: authorId,
        content: comment.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (commentError) {
      console.error(`❌ Error creando comentario de ${comment.author}:`, commentError.message);
    } else {
      console.log(`✅ Comentario creado: ${comment.author}`);
    }
  }

  console.log('✅ Comentarios de soberanía creados');
}

async function seedSoberania() {
  console.log('🛡️ Iniciando seed de bot de soberanía...');
  
  const botUserId = await createSoberaniaBot();
  
  if (botUserId) {
    await createCommentAuthors();
    await createSoberaniaComments(botUserId);
  }
  
  console.log('✅ Seed de soberanía completado');
}

seedSoberania().catch(console.error);
