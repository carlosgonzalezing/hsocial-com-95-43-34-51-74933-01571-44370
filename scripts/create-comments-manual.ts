import { supabaseAdmin } from './supabase-admin';

// IDs de los posts principales (IDs reales obtenidos)
const POST_IDS = {
  submarinos: '5e68a4ed-4744-4c6e-a1c6-0c02417f91a3', // Post de submarinos
  singapur: '318b8dbe-dd0a-45eb-93f4-00f16a13814a',   // Post de Singapur
  deploy: '3be6cd4a-9a25-404c-b091-66325acb1f17',       // Post de deploy
  energia: '57193813-2e3b-44e9-940f-ca62d9df950f'      // Post de energía (más reciente sobre energía)
};

// IDs de los usuarios comentaristas (IDs reales obtenidos)
const USER_IDS = {
  fabio_giraldo: 'a07c1f54-035c-4ced-b191-309033a2bb75',      // Dr. Fabio Giraldo
  felipe_jaramillo: '6336a72e-cb45-48d5-823f-48dfae04fb42', // Economista Felipe Jaramillo
  andrea_pardo: '5d227b6f-e1d0-488d-a3cd-fa96372b69dd',        // Andrea Pardo
  sneyder_dev: 'd162e335-ee8e-4b2f-bd4c-c57c18ec4684',         // Sneyder Dev
  laura_code: '56764672-ed4d-4b30-99c4-9b49f1ea28f6',           // Laura Code
  kevin_hacker: 'ID_KEVIN HACKER',       // Kevin Hacker no se creó
  silvia_duarte: 'e4be4089-770a-4b19-b82b-3b55da1087cd'      // Ing. Silvia Duarte
};

async function createCommentsManual() {
  console.log('💬 Creando comentarios manualmente...');

  const comments = [
    // Comentarios para post de submarinos
    {
      post_id: POST_IDS.submarinos,
      user_id: USER_IDS.fabio_giraldo,
      content: "El modelo de drones de Israel es el camino. Debemos pasar de ser compradores de tecnología a ser desarrolladores soberanos. 🦅💻"
    },
    
    // Comentarios para post de Singapur
    {
      post_id: POST_IDS.singapur,
      user_id: USER_IDS.felipe_jaramillo,
      content: "El modelo de Singapur 🇸🇬 es replicable si mejoramos la seguridad jurídica. Barranquilla tiene todo el potencial para ser ese Hub. 🚢💰"
    },
    {
      post_id: POST_IDS.singapur,
      user_id: USER_IDS.andrea_pardo,
      content: "La idea del incentivo al primer empleador cambiaría las reglas del juego para las startups. ¡Necesitamos esto en la legislación ya! 💼🚀"
    },
    
    // Comentarios para post de deploy
    {
      post_id: POST_IDS.deploy,
      user_id: USER_IDS.sneyder_dev,
      content: "Lo del refactor institucional es real. 😂 El Estado necesita menos burocracia y más automatización con procesos claros. 🏛️💾"
    },
    {
      post_id: POST_IDS.deploy,
      user_id: USER_IDS.laura_code,
      content: "¡No hagas deploy en viernes! 😅 Pero fuera de bromas, la transformación digital de Colombia debe basarse en datos abiertos y transparencia. 👨‍💻⚙️"
    },
    
    // Comentarios para post de energía
    {
      post_id: POST_IDS.energia,
      user_id: USER_IDS.silvia_duarte,
      content: "El Hidrógeno Verde 🍃 es el futuro de la Guajira. Podemos ser los principales exportadores de energía limpia para el mundo. 💨🔋"
    }
  ];

  for (const comment of comments) {
    try {
      const { error } = await supabaseAdmin
        .from('comments')
        .insert({
          post_id: comment.post_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error(`❌ Error creando comentario:`, error.message);
      } else {
        console.log(`✅ Comentario creado`);
      }
    } catch (err) {
      console.error(`❌ Error inesperado:`, err);
    }
  }

  console.log('✅ Comentarios creados manualmente');
}

// Para obtener los IDs reales, ejecuta esta función primero
async function getRealIds() {
  console.log('🔍 Obteniendo IDs reales...');
  
  // Obtener posts recientes
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id, content')
    .order('created_at', { ascending: false })
    .limit(20);

  if (postsError) {
    console.error('❌ Error obteniendo posts:', postsError);
    return;
  }

  console.log('📝 Posts recientes:');
  posts?.forEach(post => {
    const preview = post.content?.substring(0, 50) + '...';
    console.log(`ID: ${post.id} - ${preview}`);
    
    // Identificar posts por contenido
    if (post.content?.includes('Submarinos')) {
      POST_IDS.submarinos = post.id;
    } else if (post.content?.includes('Singapur')) {
      POST_IDS.singapur = post.id;
    } else if (post.content?.includes('Deploy')) {
      POST_IDS.deploy = post.id;
    } else if (post.content?.includes('Energía Limpia')) {
      POST_IDS.energia = post.id;
    }
  });

  // Obtener usuarios
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  
  console.log('\n👥 Usuarios comentaristas:');
  users.users.forEach(user => {
    const username = user.user_metadata?.username;
    if (username && ['Fabio Giraldo', 'Economista Felipe Jaramillo', 'Andrea Pardo', 'Sneyder Dev', 'Laura Code', 'Ing. Silvia Duarte'].some(name => username.includes(name))) {
      console.log(`ID: ${user.id} - ${username}`);
      
      if (username.includes('Fabio')) USER_IDS.fabio_giraldo = user.id;
      if (username.includes('Felipe')) USER_IDS.felipe_jaramillo = user.id;
      if (username.includes('Andrea')) USER_IDS.andrea_pardo = user.id;
      if (username.includes('Sneyder')) USER_IDS.sneyder_dev = user.id;
      if (username.includes('Laura')) USER_IDS.laura_code = user.id;
      if (username.includes('Silvia')) USER_IDS.silvia_duarte = user.id;
    }
  });

  console.log('\n📋 IDs para usar en comentarios:');
  console.log('POST_IDS:', POST_IDS);
  console.log('USER_IDS:', USER_IDS);
}

// Ejecutar según el argumento
if (process.argv.includes('--get-ids')) {
  getRealIds().catch(console.error);
} else {
  createCommentsManual().catch(console.error);
}
