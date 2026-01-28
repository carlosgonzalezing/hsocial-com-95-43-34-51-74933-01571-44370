import { supabaseAdmin } from './supabase-admin';
import { ContentGenerator, SmartPost, SmartComment } from './content-generator';

async function testContentGeneration() {
  console.log('🧪 Probando generación de contenido inteligente...');
  
  const generator = new ContentGenerator();
  
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
  
  // Generar posts de prueba
  const testPosts: SmartPost[] = [];
  const selectedBots = bots.slice(0, 3); // 3 bots para prueba
  
  for (const bot of selectedBots) {
    const post = generator.generateSmartPost(bot.username, bot.id);
    if (post) {
      testPosts.push(post);
      console.log(`📝 Post generado para ${bot.username}:`);
      console.log(`   Tema: ${post.theme}`);
      console.log(`   Contenido: ${post.content.substring(0, 100)}...`);
      console.log(`   Hashtags: ${post.hashtags.join(', ')}`);
      console.log('---');
    }
  }
  
  // Generar comentarios de prueba
  if (testPosts.length > 0) {
    const testPost = testPosts[0];
    const comments = generator.generateSmartComment(testPost, bots);
    
    console.log(`💬 Comentarios generados para ${testPost.botName}:`);
    comments.forEach((comment, index) => {
      console.log(`   ${index + 1}. ${comment.botName}: ${comment.content}`);
    });
  }
  
  console.log('✅ Prueba completada');
}

testContentGeneration().catch(console.error);
