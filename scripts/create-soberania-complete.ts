import { supabaseAdmin } from './supabase-admin';

async function createSoberaniaPost() {
  console.log('📝 Creando post de soberanía manualmente...');
  
  const userId = 'f9f9c385-2bab-47de-b44a-ef3374e92f7b'; // ID de Humberto Sánchez
  
  const postContent = '🛡️ Soberanía Nacional: Un límite infranqueable 🛡️🇨🇴\n\nLa solicitud de intervención extranjera para deponer a un mandatario democráticamente electo no es "libertad de expresión", es una afrenta directa a nuestra Constitución. Pedir que potencias externas violen nuestro suelo es, técnicamente, una invitación a la pérdida de soberanía. El Código Penal debería ser contundente ante quienes promueven la traición a la patria disfrazada de opinión. 🏛️📜\n\n#DerechoNacional #Soberanía #ColombiaSeRespeta🇨🇴';

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      user_id: userId,
      content: postContent,
      post_type: 'post',
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Error creando post:', error);
    return null;
  }

  console.log(`✅ Post creado con ID: ${data.id}`);
  return data.id;
}

async function createComments(postId: string) {
  console.log('💬 Creando comentarios...');
  
  // Obtener todos los usuarios
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

  console.log('✅ Todos los comentarios creados');
}

async function main() {
  const postId = await createSoberaniaPost();
  
  if (postId) {
    await createComments(postId);
    console.log('🎉 Post y comentarios de soberanía completados');
  }
}

main().catch(console.error);
