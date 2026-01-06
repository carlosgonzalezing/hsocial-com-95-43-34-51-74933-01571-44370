import { supabaseAdmin } from './supabase-admin';

interface RealisticPost {
  botId: string;
  botName: string;
  content: string;
  tone: 'casual' | 'professional' | 'enthusiastic' | 'thoughtful';
  context: string;
}

class RealisticContentGenerator {
  private realisticTemplates = {
    casual: [
      "Alguien más trabajando en {project}? Estoy atascado con {problem} y no sé si es solo yo 😅",
      "Oye {community}, qué opinan de {topic}? He estado investigando y me gustaría saber sus experiencias",
      "Hoy aprendí algo nuevo sobre {subject} y quería compartirlo con ustedes. ¿Alguien más ha pasado por esto?",
      "Tengo una duda sobre {topic}. ¿Es mejor {option1} o {option2}? Estoy evaluando para mi proyecto",
      "Después de mucho intentarlo, finalmente logré {achievement}. Les comparto lo que funcionó para mí 🎉"
    ],
    professional: [
      "Compartiendo un caso de estudio sobre {topic}. Los resultados fueron {result} y las lecciones aprendidas fueron valiosas para el sector",
      "Análisis reciente sobre {trend} muestra {insight}. Considero que esto impactará directamente nuestra industria",
      "Presentando nuestra solución para {problem}. Después de {time} de desarrollo, los resultados preliminares son prometedores",
      "Reflexión sobre {topic}: La experiencia en {context} nos ha enseñado la importancia de {lesson}",
      "Nuestro equipo ha completado {project}. Los datos muestran {metrics} y abren nuevas oportunidades en {field}"
    ],
    enthusiastic: [
      "¡Estoy emocionado por compartir esto! 🚀 Acabamos de lanzar {project} y los primeros resultados son increíbles",
      "¡No puedo creer que finalmente lo logramos! 🎉 Después de {time} trabajando en {project}, hoy es el gran día",
      "¡Qué descubrimiento más increíble! 🤩 Encontré {solution} para {problem} y creo que puede ayudar a muchos",
      "¡Atención {community}! 📢 Tenemos una oportunidad única con {opportunity}. Los primeros en unirse tendrán {benefit}",
      "¡Esto es revolucionario! 🔥 La forma en que {technology} está cambiando {industry} es simplemente espectacular"
    ],
    thoughtful: [
      "He estado pensando mucho sobre {topic} últimamente. ¿Realmente estamos abordando el problema desde la perspectiva correcta?",
      "La experiencia con {project} me hizo reflexionar sobre {insight}. A veces la solución más simple es la más efectiva",
      "Observando las tendencias en {industry}, me pregunto si estamos preparados para {challenge}. Es algo que deberíamos discutir",
      "Después de años trabajando en {field}, he llegado a la conclusión de que {wisdom}. Espero que les sea útil",
      "El éxito de {case} no fue casualidad. Fue el resultado de {factors}. Creo que podemos replicar este modelo"
    ]
  };

  private contexts = {
    tecnologia: [
      "desarrollo de software", "inteligencia artificial", "ciberseguridad", "blockchain", "cloud computing",
      "aplicaciones móviles", "análisis de datos", "machine learning", "devops", "arquitectura de sistemas"
    ],
    economia: [
      "modelos de negocio", "emprendimiento", "inversión", "mercados emergentes", "economía digital",
      "finanzas sostenibles", "comercio internacional", "política económica", "desarrollo regional", "innovación financiera"
    ],
    educacion: [
      "formación técnica", "educación superior", "capacitación laboral", "aprendizaje online", "desarrollo de talento",
      "investigación aplicada", "educación STEM", "competencias digitales", "formación profesional", "innovación educativa"
    ],
    infraestructura: [
      "transporte público", "conectividad digital", "energías renovables", "desarrollo urbano", "logística",
      "telecomunicaciones", "infraestructura vial", "servicios públicos", "desarrollo territorial", "conectividad rural"
    ],
    soberania: [
      "seguridad nacional", "defensa cibernética", "industria local", "autonomía tecnológica", "seguridad alimentaria",
      "política exterior", "defensa territorial", "soberanía económica", "seguridad energética", "desarrollo soberano"
    ]
  };

  generateRealisticPost(botName: string, botId: string): RealisticPost | null {
    const tones: Array<'casual' | 'professional' | 'enthusiastic' | 'thoughtful'> = 
      ['casual', 'professional', 'enthusiastic', 'thoughtful'];
    
    const selectedTone = tones[Math.floor(Math.random() * tones.length)];
    const templates = this.realisticTemplates[selectedTone];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Seleccionar contexto aleatorio
    const contextKeys = Object.keys(this.contexts);
    const selectedContext = contextKeys[Math.floor(Math.random() * contextKeys.length)];
    const contextItems = this.contexts[selectedContext as keyof typeof this.contexts];
    const selectedContextItem = contextItems[Math.floor(Math.random() * contextItems.length)];
    
    // Generar contenido realista
    const content = template
      .replace('{project}', selectedContextItem)
      .replace('{problem}', `un problema con ${selectedContextItem}`)
      .replace('{topic}', selectedContextItem)
      .replace('{subject}', selectedContextItem)
      .replace('{community}`, `la comunidad de ${selectedContextItem}`)
      .replace('{achievement}', `resolver un desafío con ${selectedContextItem}`)
      .replace('{trend}', `la tendencia en ${selectedContextItem}`)
      .replace('{insight}`, `un insight importante sobre ${selectedContextItem}`)
      .replace('{time}`, `${Math.floor(Math.random() * 12) + 1} meses`)
      .replace('{result}`, `resultados positivos`)
      .replace('{lesson}`, `una lección valiosa`)
      .replace('{context}`, `el contexto actual`)
      .replace('{field}`, `el campo de ${selectedContextItem}`)
      .replace('{metrics}`, `métricas prometedoras`)
      .replace('{solution}`, `una solución innovadora`)
      .replace('{technology}`, `la tecnología actual`)
      .replace('{industry}`, `la industria`)
      .replace('{challenge}`, `los desafíos futuros`)
      .replace('{wisdom}`, `una sabiduría importante`)
      .replace('{case}`, `un caso relevante`)
      .replace('{factors}`, `factores clave`)
      .replace('{option1}`, `la opción tradicional`)
      .replace('{option2}`, `la opción innovadora`)
      .replace('{opportunity}`, `una oportunidad única`)
      .replace('{benefit}`, `beneficios exclusivos`);

    return {
      botId,
      botName,
      content,
      tone: selectedTone,
      context: selectedContext
    };
  }

  generateRealisticComment(post: RealisticPost, availableBots: any[]): any[] {
    const comments: any[] = [];
    const eligibleBots = availableBots.filter(bot => bot.id !== post.botId);
    
    // Generar 2-3 comentarios realistas
    const commentCount = Math.min(2 + Math.floor(Math.random() * 2), eligibleBots.length);
    
    for (let i = 0; i < commentCount; i++) {
      const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
      const commentType = Math.random();
      
      let content = '';
      
      if (commentType < 0.3) {
        // Acuerdo simple
        const agreements = [
          `Totalmente de acuerdo ${post.botName.split(' ')[0]}. Tu punto sobre ${post.context} es muy acertado.`,
          `Excelente observación ${post.botName.split(' ')[0]}. Yo también he notado algo similar.`,
          `Me identifico con lo que dices ${post.botName.split(' ')[0]}. Es algo que necesitamos abordar.`,
          `Buena perspectiva ${post.botName.split(' ')[0]]. Gracias por compartir esto.`
        ];
        content = agreements[Math.floor(Math.random() * agreements.length)];
      } else if (commentType < 0.6) {
        // Adición de experiencia
        const experiences = [
          `Interesante ${post.botName.split(' ')[0]}. En mi experiencia con ${post.context}, también he visto que...`,
          `Tu post me hace pensar ${post.botName.split(' ')[0]}. Algo similar me pasó cuando trabajaba en ${post.context}...`,
          `Buen punto ${post.botName.split(' ')[0]}. Quisiera agregar que desde mi perspectiva en ${post.context}...`,
          `Relacionado con lo que dices ${post.botName.split(' ')[0]}, una vez tuvimos una situación similar con ${post.context}...`
        ];
        content = experiences[Math.floor(Math.random() * experiences.length)];
      } else if (commentType < 0.8) {
        // Pregunta relevante
        const questions = [
          `${post.botName.split(' ')[0]}, ¿cómo manejas el aspecto de ${post.context} en tu proyecto?`,
          `Buena pregunta ${post.botName.split(' ')[0]}. ¿Qué herramientas recomiendas para ${post.context}?`,
          `${post.botName.split(' ')[0]}, ¿has considerado el impacto de ${post.context} en el largo plazo?`,
          `Curioso ${post.botName.split(' ')[0]}. ¿Qué aprendizajes te llevas de esta experiencia con ${post.context}?`
        ];
        content = questions[Math.floor(Math.random() * questions.length)];
      } else {
        // Contra-punto respetuoso
        const counterpoints = [
          `Entiendo tu punto ${post.botName.split(' ')[0]}, pero ¿has considerado que ${post.context} también tiene sus desafíos?`,
          `Perspectiva interesante ${post.botName.split(' ')[0]}. Aunque estoy de acuerdo en parte, creo que ${post.context} necesita más análisis.`,
          `Veo lo que dices ${post.botName.split(' ')[0]}, pero desde mi experiencia, ${post.context} puede ser más complejo de lo que parece.`,
          `Buena reflexión ${post.botName.split(' ')[0]}. Sin embargo, creo que deberíamos también considerar otros factores en ${post.context}.`
        ];
        content = counterpoints[Math.floor(Math.random() * counterpoints.length)];
      }
      
      comments.push({
        botId: bot.id,
        botName: bot.username,
        content
      });
    }
    
    return comments;
  }
}

async function createRealisticContent() {
  console.log('🎭 Creando contenido realista...');
  
  const generator = new RealisticContentGenerator();
  
  // Obtener bots disponibles
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const bots = users.users
    .filter(user => user.user_metadata?.is_bot === true)
    .map(user => ({
      id: user.id,
      username: user.user_metadata?.username || 'Unknown',
      email: user.email || ''
    }));
  
  console.log(`🤖 ${bots.length} bots disponibles`);
  
  // Crear 5 posts realistas
  const selectedBots = bots.slice(0, 5);
  const createdPosts: any[] = [];
  
  for (const bot of selectedBots) {
    const realisticPost = generator.generateRealisticPost(bot.username, bot.id);
    
    if (realisticPost) {
      try {
        const { data, error } = await supabaseAdmin
          .from('posts')
          .insert({
            user_id: realisticPost.botId,
            content: realisticPost.content,
            post_type: 'post',
            visibility: 'public',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        
        if (error) {
          console.error(`❌ Error creando post de ${realisticPost.botName}:`, error.message);
        } else {
          createdPosts.push({
            ...realisticPost,
            postId: data.id
          });
          console.log(`✅ Post realista creado: ${realisticPost.botName} (${realisticPost.tone})`);
        }
      } catch (err) {
        console.error(`❌ Error inesperado creando post de ${realisticPost.botName}:`, err);
      }
    }
  }
  
  // Crear comentarios realistas
  for (const post of createdPosts) {
    const comments = generator.generateRealisticComment(post, bots);
    
    for (const comment of comments) {
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
          console.error(`❌ Error creando comentario de ${comment.botName}:`, error.message);
        } else {
          console.log(`✅ Comentario realista creado: ${comment.botName} -> ${post.botName}`);
        }
      } catch (err) {
        console.error(`❌ Error inesperado creando comentario de ${comment.botName}:`, err);
      }
    }
  }
  
  console.log('✅ Contenido realista completado');
}

createRealisticContent().catch(console.error);
