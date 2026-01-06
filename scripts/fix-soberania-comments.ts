import { supabaseAdmin } from './supabase-admin';

async function findHumbertoPost() {
  console.log('🔍 Buscando post de Humberto Sánchez...');
  
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, content')
    .eq('user_id', 'f9f9c385-2bab-47de-b44a-ef3374e92f7b')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Posts de Humberto Sánchez:');
  posts?.forEach(post => {
    console.log(`ID: ${post.id}`);
    console.log(`Content: ${post.content?.substring(0, 100)}...`);
    console.log('---');
  });
  
  return posts?.[0]?.id;
}

async function createSoberaniaComments() {
  console.log('💬 Creando comentarios para post de soberanía...');
  
  const postId = await findHumbertoPost();
  
  if (!postId) {
    console.error('❌ No se encontró el post de Humberto Sánchez');
    return;
  }
  
  console.log(`📝 Post encontrado: ${postId}`);

  // Obtener todos los usuarios para encontrar los comentaristas
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  
  const comments = [
    {
      author: 'Lucía Mendivelso',
      content: "La autodeterminación de los pueblos es un principio sagrado en el Derecho Internacional. Ninguna crisis interna justifica hipotecar nuestra independencia 🇨🇴. La institucionalidad debe defenderse desde adentro. 🏛️🛡️"
    },
    {
      author: 'Mayor (R) Andrés Gaviria',
      content: "Absolutamente de acuerdo. Quien invita a una fuerza extranjera a actuar en territorio nacional está vulnerando la seguridad del Estado. La soberanía de Colombia 🇨🇴 no es una moneda de cambio para intereses partidistas. 🦅🪖"
    },
    {
      author: 'Felipe Garcés',
      content: "La verdadera libertad reside en nuestra capacidad de resolver problemas propios con tecnología e industria nacional, no esperando 'salvadores' externos que vulneren nuestra bandera 🇨🇴. ¡Soberanía ante todo! ⚙️✊"
    }
  ];

  for (const comment of comments) {
    const user = users.users.find(u => 
      u.user_metadata?.username?.includes(comment.author.split(' ')[0])
    );
    
    if (!user) {
      console.error(`❌ No se encontró usuario para ${comment.author}`);
      continue;
    }

    const { error: commentError } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
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

createSoberaniaComments().catch(console.error);
