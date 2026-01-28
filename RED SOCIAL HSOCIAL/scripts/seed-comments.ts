import { supabaseAdmin } from './supabase-admin';
import { DEFENSE_COMMENTS, ECONOMY_COMMENTS, TECH_COMMENTS, FUTURE_COMMENTS } from './comments-definitions';

async function createCommentAuthors() {
  console.log('👥 Creando autores de comentarios...');
  
  const allCommentAuthors = [
    ...DEFENSE_COMMENTS.flatMap(pc => pc.comments.map(c => c.author_profile)),
    ...ECONOMY_COMMENTS.flatMap(ec => ec.comments.map(c => c.author_profile)),
    ...TECH_COMMENTS.flatMap(tc => tc.comments.map(c => c.author_profile)),
    ...FUTURE_COMMENTS.flatMap(fc => fc.comments.map(c => c.author_profile))
  ];

  // Eliminar duplicados por username
  const uniqueAuthors = allCommentAuthors.filter((author, index, self) =>
    index === self.findIndex(a => a.username === author.username)
  );

  for (const author of uniqueAuthors) {
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

  console.log('✅ Autores de comentarios creados');
}

async function createComments() {
  console.log('💬 Creando comentarios...');
  
  // Obtener todos los posts para encontrar IDs
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id, content')
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('❌ Error obteniendo posts:', postsError);
    return;
  }

  // Obtener todos los usuarios para mapear usernames a IDs
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const usernameToId = new Map();
  users.users.forEach(user => {
    const username = user.user_metadata?.username;
    if (username) {
      usernameToId.set(username, user.id);
    }
  });

  // Función para encontrar post por contenido parcial
  function findPostId(content: string): string | null {
    if (!posts) return null;
    const post = posts.find(p => 
      p.content && (
        p.content.includes(content.substring(0, 30)) ||
        content.includes(p.content.substring(0, 30))
      )
    );
    return post?.id || null;
  }

  // Comentarios de defensa
  for (const postComment of DEFENSE_COMMENTS) {
    const postId = findPostId('Fortalecimiento de la Flota de Submarinos');
    if (!postId) continue;

    for (const comment of postComment.comments) {
      const authorId = usernameToId.get(comment.author);
      if (!authorId) continue;

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
  }

  // Comentarios de economía
  for (const postComment of ECONOMY_COMMENTS) {
    const postId = findPostId('Milagro de Singapur');
    if (!postId) continue;

    for (const comment of postComment.comments) {
      const authorId = usernameToId.get(comment.author);
      if (!authorId) continue;

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
  }

  // Comentarios de tecnología
  for (const postComment of TECH_COMMENTS) {
    const postId = findPostId('Deploy en la administración pública');
    if (!postId) continue;

    for (const comment of postComment.comments) {
      const authorId = usernameToId.get(comment.author);
      if (!authorId) continue;

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
  }

  // Comentarios de futuro
  for (const postComment of FUTURE_COMMENTS) {
    const postId = findPostId('Colombia como Hub de Energía Limpia');
    if (!postId) continue;

    for (const comment of postComment.comments) {
      const authorId = usernameToId.get(comment.author);
      if (!authorId) continue;

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
  }

  console.log('✅ Comentarios creados');
}

async function seedComments() {
  console.log('🌱 Iniciando seed de comentarios...');
  
  await createCommentAuthors();
  await createComments();
  
  console.log('✅ Seed de comentarios completado');
}

seedComments().catch(console.error);
