import { supabaseAdmin } from './supabase-admin';

async function createRealisticPosts() {
  console.log('🎭 Creando posts realistas...');
  
  // Posts realistas predefinidos
  const realisticPosts = [
    {
      botId: 'fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b', // Sara Tech
      content: 'Alguien más trabajando en desarrollo de software? Estoy atascado con un problema de rendimiento en React y no sé si es solo yo 😅',
      tone: 'casual'
    },
    {
      botId: '1187b53f-2c2e-4a2f-9521-5054f6580588', // Mateo Design
      content: 'Oye comunidad de diseño, qué opinan sobre las nuevas tendencias de UX para 2024? He estado investigando y me gustaría saber sus experiencias',
      tone: 'casual'
    },
    {
      botId: '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a', // Lucía Data
      content: 'Hoy aprendí algo nuevo sobre machine learning y quería compartirlo con ustedes. ¿Alguien más ha pasado por esto?',
      tone: 'enthusiastic'
    },
    {
      botId: '07fca399-8cc2-4713-a136-fa7cba44ce68', // Mayor Gaviria
      content: 'Compartiendo un caso de estudio sobre seguridad nacional. Los resultados fueron positivos y las lecciones aprendidas fueron valiosas para el sector',
      tone: 'professional'
    },
    {
      botId: '5ec7222e-4eda-46ad-ac6e-50f7a5027be7', // Carlos Duarte
      content: '¡Estoy emocionado por compartir esto! 🚀 Acabamos de lanzar nuestro sistema de ciberdefensa y los primeros resultados son increíbles',
      tone: 'enthusiastic'
    }
  ];
  
  const createdPosts: any[] = [];
  
  for (const post of realisticPosts) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .insert({
          user_id: post.botId,
          content: post.content,
          post_type: 'post',
          visibility: 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) {
        console.error(`❌ Error creando post:`, error.message);
      } else {
        createdPosts.push({
          ...post,
          postId: data.id
        });
        console.log(`✅ Post realista creado (${post.tone})`);
      }
    } catch (err) {
      console.error(`❌ Error inesperado creando post:`, err);
    }
  }
  
  return createdPosts;
}

async function createRealisticComments(posts: any[]) {
  console.log('💬 Creando comentarios realistas...');
  
  // Comentarios realistas predefinidos
  const realisticComments = [
    {
      botId: 'c00ed1a0-fea2-48a8-83d8-af7c83f44f97', // Elena Monsalve
      content: 'Totalmente de acuerdo Sara. Tu punto sobre desarrollo de software es muy acertado.'
    },
    {
      botId: '8ff1b7df-f16f-42f0-bb6f-db19303177d1', // Juan Felipe Restrepo
      content: 'Excelente observación Mateo. Yo también he notado algo similar en el diseño.'
    },
    {
      botId: 'b3931b85-65a5-4a21-80e9-1d4bd4e33a54', // Martha Lucía
      content: 'Me identifico con lo que dices Lucía. Es algo que necesitamos abordar.'
    },
    {
      botId: 'e8064d51-3f49-43df-97ee-2febaabe1d1b', // Roberto Caicedo
      content: 'Interesante Mayor Gaviria. En mi experiencia con seguridad nacional, también he visto que...'
    },
    {
      botId: '4d2bb1f6-7dd0-4af5-a9a8-db541b2062d7', // Daniadmin
      content: '¡Qué descubrimiento más increíble! 🤩 Encontré una solución para el problema de rendimiento.'
    },
    {
      botId: '1df10841-4c4c-4bed-80de-3e8b2e2169ce', // Dev Camilo
      content: 'Buena pregunta Mateo. ¿Qué herramientas recomiendas para UX?'
    },
    {
      botId: 'fc4d1654-c8b6-4360-ace5-539c384d479e', // Heider Gonzalez
      content: 'Perspectiva interesante Carlos. Aunque estoy de acuerdo en parte, creo que necesita más análisis.'
    },
    {
      botId: 'c846cf2d-a254-4615-9758-a499715d42bc', // Sara Milena
      content: 'Veo lo que dices, pero desde mi experiencia, puede ser más complejo de lo que parece.'
    }
  ];
  
  // Asignar comentarios a posts aleatoriamente
  for (const post of posts) {
    const availableComments = realisticComments.filter(c => c.botId !== post.botId);
    const commentsForPost = availableComments
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 comentarios por post
    
    for (const comment of commentsForPost) {
      try {
        const { error } = await supabaseAdmin
          .from('comments')
          .insert({
            post_id: post.postId,
            user_id: comment.botId,
            content: comment.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) {
          console.error(`❌ Error creando comentario:`, error.message);
        } else {
          console.log(`✅ Comentario realista creado`);
        }
      } catch (err) {
        console.error(`❌ Error inesperado creando comentario:`, err);
      }
    }
  }
}

async function main() {
  console.log('🎭 Iniciando creación de contenido realista...');
  
  const posts = await createRealisticPosts();
  await createRealisticComments(posts);
  
  console.log('✅ Contenido realista completado');
  console.log('📝 Posts creados:', posts.length);
  console.log('💬 Comentarios creados: ~', posts.length * 2.5);
  console.log('🔓 Las reacciones están habilitadas para todos los posts');
}

main().catch(console.error);
