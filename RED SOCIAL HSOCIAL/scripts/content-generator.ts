import { supabaseAdmin } from './supabase-admin';
import { CONTENT_STRATEGY, CONTENT_CALENDAR, CONTENT_RULES } from './content-strategy';

export interface SmartPost {
  botId: string;
  botName: string;
  content: string;
  theme: string;
  relatedTopics: string[];
  hashtags: string[];
  postType: 'post' | 'idea' | 'project_showcase' | 'opportunity';
  targetComments: number;
  postId?: string; // Se asigna después de crear el post
}

export interface SmartComment {
  postId: string;
  botId: string;
  botName: string;
  content: string;
  relationToPost: 'agreement' | 'expansion' | 'question' | 'counterpoint';
}

class ContentGenerator {
  private usedThemes: string[] = [];
  private recentPosts: Map<string, Date> = new Map();
  
  constructor() {
    this.loadRecentContent();
  }
  
  private async loadRecentContent() {
    // Cargar posts recientes para evitar repetición
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('content, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    
    posts?.forEach(post => {
      const theme = this.detectTheme(post.content || '');
      this.recentPosts.set(theme, new Date(post.created_at));
    });
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
  
  private canPostTheme(theme: string): boolean {
    const lastPost = this.recentPosts.get(theme);
    if (!lastPost) return true;
    
    const daysSinceLastPost = Math.floor((Date.now() - lastPost.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastPost >= CONTENT_RULES.minDaysBetweenSameTheme;
  }
  
  generateSmartPost(botName: string, botId: string): SmartPost | null {
    // Encontrar temas disponibles
    const availableThemes = CONTENT_STRATEGY.filter(strategy => 
      this.canPostTheme(strategy.theme)
    );
    
    if (availableThemes.length === 0) {
      console.log(`⚠️ No hay temas disponibles para ${botName}`);
      return null;
    }
    
    // Seleccionar tema aleatorio de los disponibles
    const selectedStrategy = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    
    // Generar contenido basado en el tema
    const content = this.generateContentForTheme(selectedStrategy, botName);
    
    const post: SmartPost = {
      botId,
      botName,
      content,
      theme: selectedStrategy.theme,
      relatedTopics: this.selectRelatedTopics(selectedStrategy.relatedTopics),
      hashtags: [...selectedStrategy.suggestedHashtags],
      postType: this.selectPostType(selectedStrategy.postTypes),
      targetComments: CONTENT_RULES.minCommentsPerPost
    };
    
    // Actualizar registro
    this.recentPosts.set(selectedStrategy.theme, new Date());
    
    return post;
  }
  
  private generateContentForTheme(strategy: any, botName: string): string {
    const templates = this.getTemplatesForTheme(strategy.theme);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Personalizar template con datos del bot
    return template
      .replace('{botName}', botName)
      .replace('{relatedTopic}', strategy.relatedTopics[Math.floor(Math.random() * strategy.relatedTopics.length)])
      .replace('{targetAudience}', strategy.targetAudience[Math.floor(Math.random() * strategy.targetAudience.length)])
      .replace('{contentPillar}', strategy.contentPillars[Math.floor(Math.random() * strategy.contentPillars.length)]);
  }
  
  private getTemplatesForTheme(theme: string): string[] {
    const templates: Record<string, string[]> = {
      'Desarrollo Tecnológico': [
        '🚀 {botName}: Innovando en {relatedTopic} con soluciones 100% colombianas. El talento nacional está demostrando que podemos competir a nivel mundial. {contentPillar} #TechColombia #InnovaciónNacional',
        '💡 {botName}: ¿Sabías que Colombia está desarrollando {relatedTopic}? Es hora de apostarle al talento local y dejar de depender de soluciones extranjeras. {contentPillar} #SoftwareHechoEnColombia',
        '🔥 {botName}: Nuevo proyecto en {relatedTopic} que está revolucionando el sector. Esto es solo el comienzo de lo que nuestro talento puede lograr. {contentPillar} #EmprendimientoTech'
      ],
      'Soberanía Nacional': [
        '🛡️ {botName}: La {relatedTopic} es fundamental para nuestra autonomía. No podemos seguir dependiendo de otros para nuestra seguridad y desarrollo. {contentPillar} #SoberaníaNacional #SeguridadColombia',
        '🇨🇴 {botName}: Es momento de fortalecer nuestra {relatedTopic}. La soberanía no se negocia, se construye con trabajo y visión de futuro. {contentPillar} #DefensaNacional',
        '⚡ {botName}: La {relatedTopic} es clave para el desarrollo del país. Invertir en capacidades propias es invertir en nuestro futuro. {contentPillar} #Ciberseguridad'
      ],
      'Economía': [
        '📈 {botName}: El modelo de {relatedTopic} está transformando nuestra economía. Es hora de repensar cómo generamos riqueza de forma sostenible. {contentPillar} #EconomíaColombia #DesarrolloSostenible',
        '💼 {botName}: El {relatedTopic} está creando oportunidades para miles de colombianos. Este es el camino hacia un desarrollo más inclusivo. {contentPillar} #Emprendimiento',
        '🌱 {botName}: La {relatedTopic} demuestra que podemos crecer sin destruir nuestro futuro. Economía y sostenibilidad deben ir de la mano. {contentPillar} #InnovaciónSocial'
      ],
      'Educación': [
        '🎓 {botName}: La {relatedTopic} está formando el talento que Colombia necesita. Invertir en educación es invertir en soberanía intelectual. {contentPillar} #EducaciónColombia #TalentoNacional',
        '📚 {botName}: El {relatedTopic} está abriendo puertas para nuevos profesionales. Colombia necesita más programas así para competir globalmente. {contentPillar} #FormaciónProfesional',
        '🔬 {botName}: La {relatedTopic} está posicionando a Colombia como referente regional. Es hora de valorar y potenciar nuestro talento. {contentPillar} #InnovaciónEducativa'
      ],
      'Infraestructura': [
        '🏗️ {botName}: La {relatedTopic} es el backbone del desarrollo. Sin infraestructura adecuada, no podemos alcanzar nuestro potencial. {contentPillar} #InfraestructuraColombia #Conectividad',
        '🚄 {botName}: El proyecto de {relatedTopic} está cambiando la forma en que nos conectamos. Esto es desarrollo real que beneficia a todos. {contentPillar} #DesarrolloUrbano',
        '🌐 {botName}: La {relatedTopic} es fundamental para la competitividad. Necesitamos más proyectos así para integrar el país. {contentPillar} #LogísticaNacional'
      ]
    };
    
    return templates[theme] || ['{botName}: Compartiendo ideas sobre {relatedTopic}. {contentPillar}'];
  }
  
  private selectRelatedTopics(topics: string[]): string[] {
    const count = Math.min(2, topics.length);
    return topics.slice(0, count);
  }
  
  private selectPostType(types: string[]): any {
    return types[Math.floor(Math.random() * types.length)];
  }
  
  generateSmartComment(post: SmartPost, availableBots: any[]): SmartComment[] {
    const comments: SmartComment[] = [];
    const commentCount = Math.min(post.targetComments, availableBots.length);
    
    // Seleccionar bots que no sean el autor del post
    const eligibleBots = availableBots.filter(bot => bot.id !== post.botId);
    
    for (let i = 0; i < commentCount; i++) {
      const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
      const relationType = this.selectCommentRelationType();
      const content = this.generateCommentContent(post, bot.username, relationType);
      
      comments.push({
        postId: '', // Se asignará después de crear el post
        botId: bot.id,
        botName: bot.username,
        content,
        relationToPost: relationType
      });
    }
    
    return comments;
  }
  
  private selectCommentRelationType(): 'agreement' | 'expansion' | 'question' | 'counterpoint' {
    const types: ('agreement' | 'expansion' | 'question' | 'counterpoint')[] = ['agreement', 'expansion', 'question'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private generateCommentContent(post: SmartPost, botName: string, relationType: string): string {
    const templates: Record<string, string[]> = {
      agreement: [
        `Totalmente de acuerdo ${post.botName}. ${post.relatedTopics[0]} es crucial para el desarrollo del país. 🇨🇴`,
        `Excelente punto ${post.botName}. La {relatedTopic} que mencionas es fundamental. ¡Gracias por compartir! 👏`,
        `Comparto tu visión ${post.botName}. Colombia necesita más gente pensando así sobre estos temas.`
      ],
      expansion: [
        `${post.botName}, tu análisis sobre ${post.relatedTopics[0]} es muy acertado. Quisiera agregar que también debemos considerar...`,
        `Interesante perspectiva ${post.botName}. Desde mi experiencia, ${post.relatedTopics[0]} también implica...`,
        `${post.botName}, tu post me hace pensar en cómo ${post.relatedTopics[0]} se conecta con otros temas importantes...`
      ],
      question: [
        `${post.botName}, ¿cómo crees que podemos implementar ${post.relatedTopics[0]} a nivel nacional? 🤔`,
        `Muy bueno ${post.botName}. ¿Qué opinas sobre los desafíos que enfrenta ${post.relatedTopics[0]} actualmente?`,
        `${post.botName}, ¿cuál crees que es el primer paso para avanzar en ${post.relatedTopics[0]}?`
      ]
    };
    
    const templateList = templates[relationType] || templates.agreement;
    const template = templateList[Math.floor(Math.random() * templateList.length)];
    
    return template.replace('{relatedTopic}', post.relatedTopics[0]);
  }
}

export { ContentGenerator };
