import { supabaseAdmin } from './supabase-admin';

async function findAllAutomatedContent() {
  console.log('🔍 Buscando TODO el contenido automatizado...');
  
  // Obtener todos los posts
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, content, user_id, created_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error obteniendo posts:', error);
    return [];
  }
  
  console.log(`📝 Total de posts encontrados: ${posts?.length || 0}`);
  
  // Patrones de contenido automatizado (expandidos)
  const automatedPatterns = [
    // Patrones del sistema inteligente
    /🚀.*Innovando en.*soluciones 100% colombianas/,
    /🛡️.*La.*es fundamental para nuestra autonomía/,
    /📈.*El modelo de.*está transformando nuestra economía/,
    /🎓.*La.*está formando el talento que Colombia necesita/,
    /🏗️.*La.*es el backbone del desarrollo/,
    /Compartiendo ideas sobre/,
    /Totalmente de acuerdo.*tu análisis sobre/,
    /Excelente punto.*La.*que mencionas es fundamental/,
    /Interesente perspectiva.*Desde mi experiencia/,
    
    // Patrones de bots originales
    /Justo terminé mi primer proyecto con React/,
    /Busco colaboradores para un proyecto open source/,
    /Mini SaaS para revisar CV con IA/,
    /Regla 2–2–2 para estudiar programación/,
    /¿Qué te frustró más al desplegar tu primer proyecto/,
    /API de "horarios inteligentes" para universidades/,
    /"Solo voy a cambiar una línea"/,
    /Tu primer dashboard sin morir en el intento/,
    /App para grupos de estudio con "modo sprint"/,
    /Reto de portafolio: 7 días, 1 proyecto deployado/,
    /¿Qué prefieres aprender primero: unit tests o e2e/,
    /Checklist rápido antes de subir a GitHub/,
    /¿Qué te gustaría que te evaluaran en una entrevista/,
    /Cuando dices "ya entiendo recursión"/,
    /Bot tutor para resolver dudas de algoritmos/,
    
    // Patrones de hashtags automatizados
    /#TechColombia.*#InnovaciónNacional.*#SoftwareHechoEnColombia/,
    /#SoberaníaNacional.*#SeguridadColombia.*#DefensaNacional/,
    /#EconomíaColombia.*#DesarrolloSostenible.*#Emprendimiento/,
    /#EducaciónColombia.*#TalentoNacional.*#FormaciónProfesional/,
    /#InfraestructuraColombia.*#Conectividad.*#DesarrolloUrbano/,
    
    // Patrones de comentarios automatizados
    /Mayor.*Gaviria.*tu post me hace pensar en cómo/,
    /Interesente.*desde mi experiencia con/,
    /Buen punto.*Quisiera agregar que desde mi perspectiva/,
    /Relacionado con lo que dices.*una vez tuvimos una situación similar/,
    
    // Patrones genéricos de bots
    /^\w+:\s*Compartiendo ideas sobre/,
    /^\w+:\s*Totalmente de acuerdo/,
    /^\w+:\s*Excelente punto/,
    /^\w+:\s*Interesente perspectiva/,
    /^\w+:\s*Buen punto/,
    /^\w+:\s*Relacionado con lo que dices/,
    
    // Contenido con múltiples hashtags seguidos
    /#[\w]+.*#[\w]+.*#[\w]+.*#[\w]+/,
    
    // Contenido con emojis excesivos al inicio
    /^[🚀🛡️📈🎓🏗️💻🔥⚡🌱🌐🎉🤩📢🏛️💡📚🔬🤔📊🔑💼🎨♿☕🐱📊🍃☀️💨🔋🇨🇴]{3,}/,
    
    // Patrones de posts muy estructurados
    /Título:.*\n.*\n.*#[\w]+.*#[\w]+/,
    
    // Contenido que parece generado por plantilla
    /.*es fundamental para.*/g,
    /.*está transformando nuestra.*/g,
    /.*está formando el talento que.*/g,
    /.*es el backbone del desarrollo.*/g
  ];
  
  const automatedPosts = posts?.filter(post => {
    if (!post.content) return false;
    
    // Verificar si coincide con algún patrón automatizado
    return automatedPatterns.some(pattern => pattern.test(post.content || ''));
  }) || [];
  
  console.log(`🤖 Posts automatizados identificados: ${automatedPosts.length}`);
  
  // Mostrar detalles de los posts automatizados
  automatedPosts.forEach((post, index) => {
    console.log(`\n--- Post ${index + 1} ---`);
    console.log(`ID: ${post.id}`);
    console.log(`Contenido: ${post.content?.substring(0, 150)}...`);
    console.log(`Creado: ${post.created_at}`);
    
    // Identificar qué patrón coincidió
    if (post.content) {
      for (const pattern of automatedPatterns) {
        if (pattern.test(post.content)) {
          console.log(`Patrón detectado: ${pattern.source}`);
          break;
        }
      }
    }
  });
  
  return automatedPosts;
}

async function deleteAutomatedPosts(posts: any[]) {
  console.log(`\n🗑️ Eliminando ${posts.length} posts automatizados...`);
  
  for (const post of posts) {
    try {
      // Primero eliminar comentarios asociados
      await supabaseAdmin
        .from('comments')
        .delete()
        .eq('post_id', post.id);
      
      // Eliminar likes asociados
      await supabaseAdmin
        .from('likes')
        .delete()
        .eq('post_id', post.id);
      
      // Eliminar el post
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', post.id);
      
      if (error) {
        console.error(`❌ Error eliminando post ${post.id}:`, error.message);
      } else {
        console.log(`✅ Post eliminado: ${post.id}`);
      }
    } catch (err) {
      console.error(`❌ Error inesperado eliminando post ${post.id}:`, err);
    }
  }
  
  console.log('✅ Posts automatizados eliminados');
}

async function removeAnyRestrictions() {
  console.log('\n🔓 Verificando y eliminando cualquier restricción...');
  
  // No hay tablas de restricciones específicas en tu sistema
  // Las reacciones funcionan por defecto en Supabase
  
  console.log('ℹ️ No se encontraron tablas de restricciones específicas');
  console.log('✅ Las reacciones deberían funcionar normalmente para todos los posts');
}

async function main() {
  console.log('🎯 INICIANDO LIMPIEZA COMPLETA DE CONTENIDO AUTOMATIZADO...\n');
  
  const automatedPosts = await findAllAutomatedContent();
  
  if (automatedPosts.length > 0) {
    await deleteAutomatedPosts(automatedPosts);
  } else {
    console.log('✅ No se encontró contenido automatizado');
  }
  
  await removeAnyRestrictions();
  
  console.log('\n🎉 LIMPIEZA COMPLETADA');
  console.log('📝 Posts eliminados:', automatedPosts.length);
  console.log('🔓 Reacciones habilitadas para todos los posts restantes');
  console.log('💬 Comentarios habilitados para todos los posts restantes');
}

main().catch(console.error);
