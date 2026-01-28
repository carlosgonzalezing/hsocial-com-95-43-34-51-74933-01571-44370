import { supabaseAdmin } from './supabase-admin';
import { ContentGenerator, SmartPost, SmartComment } from './content-generator';

interface BotUser {
  id: string;
  username: string;
  email: string;
}

class SmartContentScheduler {
  private contentGenerator: ContentGenerator;
  private bots: BotUser[] = [];
  
  constructor() {
    this.contentGenerator = new ContentGenerator();
  }
  
  async initialize() {
    console.log('🔧 Inicializando scheduler de contenido inteligente...');
    await this.loadBots();
  }
  
  private async loadBots() {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    
    this.bots = users.users
      .filter(user => user.user_metadata?.is_bot === true)
      .map(user => ({
        id: user.id,
        username: user.user_metadata?.username || 'Unknown',
        email: user.email || ''
      }));
    
    console.log(`🤖 ${this.bots.length} bots cargados`);
  }
  
  async generateDailyContent() {
    console.log('📅 Generando contenido diario...');
    
    // Generar posts para bots seleccionados
    const postsToCreate: SmartPost[] = [];
    const selectedBots = this.selectBotsForToday();
    
    for (const bot of selectedBots) {
      const post = this.contentGenerator.generateSmartPost(bot.username, bot.id);
      if (post) {
        postsToCreate.push(post);
      }
    }
    
    // Crear posts en la base de datos
    const createdPosts = await this.createPosts(postsToCreate);
    
    // Generar y crear comentarios para cada post
    for (const post of createdPosts) {
      const comments = this.contentGenerator.generateSmartComment(post, this.bots);
      await this.createComments(post, comments);
    }
    
    console.log(`✅ ${createdPosts.length} posts y comentarios creados`);
  }
  
  private selectBotsForToday(): BotUser[] {
    // Seleccionar bots aleatoriamente pero asegurando variedad de temas
    const dailyBotsCount = Math.min(3, this.bots.length); // 3 posts por día
    const shuffled = [...this.bots].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, dailyBotsCount);
  }
  
  private async createPosts(posts: SmartPost[]): Promise<SmartPost[]> {
    const createdPosts: SmartPost[] = [];
    
    for (const post of posts) {
      try {
        const { data, error } = await supabaseAdmin
          .from('posts')
          .insert({
            user_id: post.botId,
            content: post.content,
            post_type: post.postType,
            visibility: 'public',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        
        if (error) {
          console.error(`❌ Error creando post de ${post.botName}:`, error.message);
        } else {
          post.postId = data.id;
          createdPosts.push(post);
          console.log(`✅ Post creado: ${post.botName} - ${post.theme}`);
        }
      } catch (err) {
        console.error(`❌ Error inesperado creando post de ${post.botName}:`, err);
      }
    }
    
    return createdPosts;
  }
  
  private async createComments(post: SmartPost, comments: SmartComment[]) {
    for (const comment of comments) {
      try {
        const { error } = await supabaseAdmin
          .from('comments')
          .insert({
            post_id: post.postId!,
            user_id: comment.botId,
            content: comment.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) {
          console.error(`❌ Error creando comentario de ${comment.botName}:`, error.message);
        } else {
          console.log(`✅ Comentario creado: ${comment.botName} -> ${post.botName}`);
        }
      } catch (err) {
        console.error(`❌ Error inesperado creando comentario de ${comment.botName}:`, err);
      }
    }
  }
  
  async generateWeeklyPlan() {
    console.log('📋 Generando plan semanal de contenido...');
    
    const plan = {
      week: this.getWeekNumber(),
      dailyPosts: [] as Array<{
        day: string;
        bots: string[];
        themes: string[];
      }>
    };
    
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    
    for (const day of days) {
      const selectedBots = this.selectBotsForToday();
      const themes = selectedBots.map(bot => {
        const post = this.contentGenerator.generateSmartPost(bot.username, bot.id);
        return post?.theme || 'General';
      });
      
      plan.dailyPosts.push({
        day,
        bots: selectedBots.map(b => b.username),
        themes: themes.filter(t => t !== 'General')
      });
    }
    
    console.log('📅 Plan semanal:');
    plan.dailyPosts.forEach(day => {
      console.log(`${day.day}: ${day.bots.join(', ')} - Temas: ${day.themes.join(', ')}`);
    });
    
    return plan;
  }
  
  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }
  
  async getContentStatistics() {
    console.log('📊 Generando estadísticas de contenido...');
    
    // Posts por tema
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('content, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    const themeCount: Record<string, number> = {};
    const botPostCount: Record<string, number> = {};
    
    posts?.forEach(post => {
      const theme = this.detectTheme(post.content || '');
      themeCount[theme] = (themeCount[theme] || 0) + 1;
      
      // Obtener nombre del bot (esto requeriría un join o consulta adicional)
      botPostCount['bot'] = (botPostCount['bot'] || 0) + 1;
    });
    
    console.log('📈 Posts por tema:');
    Object.entries(themeCount).forEach(([theme, count]) => {
      console.log(`  ${theme}: ${count}`);
    });
    
    console.log('🤖 Posts por bot:');
    Object.entries(botPostCount).forEach(([bot, count]) => {
      console.log(`  ${bot}: ${count}`);
    });
    
    return { themeCount, botPostCount };
  }
  
  private detectTheme(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('tecnología') || lowerContent.includes('software') || lowerContent.includes('ia')) {
      return 'Desarrollo Tecnológico';
    }
    if (lowerContent.includes('soberanía') || lowerContent.includes('seguridad') || lowerContent.includes('defensa')) {
      return 'Soberanía Nacional';
    }
    if (lowerContent.includes('economía') || lowerContent.includes('emprendimiento') || lowerContent.includes('desarrollo')) {
      return 'Economía';
    }
    if (lowerContent.includes('educación') || lowerContent.includes('talento') || lowerContent.includes('formación')) {
      return 'Educación';
    }
    if (lowerContent.includes('infraestructura') || lowerContent.includes('conectividad') || lowerContent.includes('transporte')) {
      return 'Infraestructura';
    }
    
    return 'General';
  }
}

// Función principal para ejecutar el scheduler
async function runSmartScheduler() {
  const scheduler = new SmartContentScheduler();
  await scheduler.initialize();
  
  // Generar plan semanal
  await scheduler.generateWeeklyPlan();
  
  // Generar contenido diario
  await scheduler.generateDailyContent();
  
  // Mostrar estadísticas
  await scheduler.getContentStatistics();
}

// Exportar para uso en otros scripts
export { SmartContentScheduler };

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runSmartScheduler().catch(console.error);
}
