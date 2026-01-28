import { supabaseAdmin } from './supabase-admin';

async function addRemainingComments() {
  console.log('💬 Agregando comentarios restantes...');
  
  const postId = '96d654c9-affe-48b6-8baf-5211de79e8c6'; // ID del post de soberanía
  
  // IDs de los usuarios recién creados
  const userIds = {
    'Lucía Mendivelso': 'bbd52b20-2e33-497a-bc85-0a8a48c27c15',
    'Mayor (R) Andrés Gaviria': '97c718c6-93b8-4b16-871f-a3cf098c47ac'
  };

  const remainingComments = [
    {
      author: 'Lucía Mendivelso',
      user_id: userIds['Lucía Mendivelso'],
      content: "La autodeterminación de los pueblos es un principio sagrado en el Derecho Internacional. Ninguna crisis interna justifica hipotecar nuestra independencia 🇨🇴. La institucionalidad debe defenderse desde adentro. 🏛️🛡️"
    },
    {
      author: 'Mayor (R) Andrés Gaviria',
      user_id: userIds['Mayor (R) Andrés Gaviria'],
      content: "Absolutamente de acuerdo. Quien invita a una fuerza extranjera a actuar en territorio nacional está vulnerando la seguridad del Estado. La soberanía de Colombia 🇨🇴 no es una moneda de cambio para intereses partidistas. 🦅🪖"
    }
  ];

  for (const comment of remainingComments) {
    const { error: commentError } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        user_id: comment.user_id,
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

  console.log('✅ Comentarios restantes agregados');
}

addRemainingComments().catch(console.error);
