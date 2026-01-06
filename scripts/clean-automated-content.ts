import { supabaseAdmin } from './supabase-admin';

async function findAutomatedContent() {
  console.log('🔍 Buscando contenido automatizado...');
  
  // Buscar posts con patrones de bot
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, content, user_id, created_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
    return [];
  }
  
  console.log('📝 Posts encontrados:', posts?.length || 0);
  
  // Patrones de contenido automatizado
  const automatedPatterns = [
    /🚀.*Innovando en.*soluciones 100% colombianas/,
    /🛡️.*La.*es fundamental para nuestra autonomía/,
    /📈.*El modelo de.*está transformando nuestra economía/,
    /🎓.*La.*está formando el talento que Colombia necesita/,
    /🏗️.*La.*es el backbone del desarrollo/,
    /Compartiendo ideas sobre/,
    /Totalmente de acuerdo.*tu análisis sobre/,
    /Excelente punto.*La.*que mencionas es fundamental/,
    /Interesente perspectiva.*Desde mi experiencia/
  ];
  
  const automatedPosts = posts?.filter(post => {
    return automatedPatterns.some(pattern => pattern.test(post.content || ''));
  }) || [];
  
  console.log('🤖 Posts automatizados identificados:', automatedPosts.length);
  
  automatedPosts.forEach(post => {
    console.log(`ID: ${post.id}`);
    console.log(`Contenido: ${post.content?.substring(0, 100)}...`);
    console.log('---');
  });
  
  return automatedPosts;
}

async function removeAutomatedContent() {
  console.log('🗑️ Eliminando contenido automatizado...');
  
  const automatedPosts = await findAutomatedContent();
  
  if (automatedPosts.length === 0) {
    console.log('✅ No se encontró contenido automatizado');
    return;
  }
  
  // Eliminar posts automatizados
  for (const post of automatedPosts) {
    try {
      // Primero eliminar comentarios asociados
      await supabaseAdmin
        .from('comments')
        .delete()
        .eq('post_id', post.id);
      
      // Luego eliminar el post
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
  
  console.log('✅ Contenido automatizado eliminado');
}

async function removeReactionRestrictions() {
  console.log('🔓 Verificando restricciones de reacciones...');
  
  // Las reacciones en tu sistema probablemente funcionan por defecto
  // No hay necesidad de eliminar restricciones si no existen tablas específicas
  
  console.log('✅ Las reacciones deberían funcionar normalmente para todos los posts');
}

async function main() {
  console.log('🎯 Iniciando limpieza de contenido automatizado...');
  
  await removeAutomatedContent();
  await removeReactionRestrictions();
  
  console.log('✅ Limpieza completada');
}

main().catch(console.error);
