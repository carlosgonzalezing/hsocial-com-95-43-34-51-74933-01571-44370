// Plan estratégico de contenido para H Social
export interface ContentStrategy {
  theme: string;
  description: string;
  relatedTopics: string[];
  postTypes: ('post' | 'idea' | 'project_showcase' | 'opportunity')[];
  targetAudience: string[];
  contentPillars: string[];
  suggestedHashtags: string[];
}

export const CONTENT_STRATEGY: ContentStrategy[] = [
  {
    theme: 'Desarrollo Tecnológico Nacional',
    description: 'Contenido sobre innovación, software y hardware desarrollado en Colombia',
    relatedTopics: [
      'Inteligencia Artificial Colombiana',
      'Startups tecnológicas locales',
      'Desarrollo de software nacional',
      'Industria 4.0 en Colombia',
      'Transferencia tecnológica'
    ],
    postTypes: ['post', 'project_showcase', 'opportunity'],
    targetAudience: ['Desarrolladores', 'Emprendedores tech', 'Estudiantes de ingeniería'],
    contentPillars: [
      'Casos de éxito de empresas colombianas',
      'Herramientas desarrolladas localmente',
      'Oportunidades de empleo en tech',
      'Eventos y hackathons nacionales'
    ],
    suggestedHashtags: ['#TechColombia', '#InnovaciónNacional', '#SoftwareHechoEnColombia', '#EmprendimientoTech']
  },
  {
    theme: 'Soberanía y Seguridad Nacional',
    description: 'Contenido sobre defensa, seguridad cibernética y autonomía nacional',
    relatedTopics: [
      'Ciberdefensa',
      'Industria militar nacional',
      'Seguridad fronteriza',
      'Energía soberana',
      'Alimentación autónoma'
    ],
    postTypes: ['post', 'idea'],
    targetAudience: ['Militares', 'Analistas de seguridad', 'Políticos', 'Ciudadanos preocupados'],
    contentPillars: [
      'Análisis de amenazas',
      'Proyectos de defensa nacional',
      'Políticas de seguridad',
      'Colaboración internacional estratégica'
    ],
    suggestedHashtags: ['#SoberaníaNacional', '#SeguridadColombia', '#DefensaNacional', '#Ciberseguridad']
  },
  {
    theme: 'Economía y Desarrollo Sostenible',
    description: 'Contenido sobre modelos económicos, emprendimiento y desarrollo sostenible',
    relatedTopics: [
      'Modelos económicos alternativos',
      'Emprendimiento social',
      'Economía circular',
      'Desarrollo regional',
      'Comercio internacional'
    ],
    postTypes: ['post', 'idea', 'opportunity'],
    targetAudience: ['Economistas', 'Emprendedores', 'Estudiantes de negocios', 'Policymakers'],
    contentPillars: [
      'Análisis económico',
      'Casos de éxito empresarial',
      'Políticas de desarrollo',
      'Oportunidades de inversión'
    ],
    suggestedHashtags: ['#EconomíaColombia', '#DesarrolloSostenible', '#Emprendimiento', '#InnovaciónSocial']
  },
  {
    theme: 'Educación y Talento Colombiano',
    description: 'Contenido sobre educación, formación y talento humano nacional',
    relatedTopics: [
      'Educación técnica y tecnológica',
      'Formación profesional',
      'Talento colombiano en el exterior',
      'Investigación y desarrollo',
      'Innovación educativa'
    ],
    postTypes: ['post', 'project_showcase', 'opportunity'],
    targetAudience: ['Educadores', 'Estudiantes', 'Profesionales', 'Empresas'],
    contentPillars: [
      'Programas educativos innovadores',
      'Historias de éxito profesional',
      'Becas y oportunidades',
      'Colaboración academia-industria'
    ],
    suggestedHashtags: ['#EducaciónColombia', '#TalentoNacional', '#FormaciónProfesional', '#InnovaciónEducativa']
  },
  {
    theme: 'Infraestructura y Conectividad',
    description: 'Contenido sobre proyectos de infraestructura y conectividad nacional',
    relatedTopics: [
      'Transporte y logística',
      'Conectividad digital',
      'Energía y comunicaciones',
      'Desarrollo urbano',
      'Integración regional'
    ],
    postTypes: ['post', 'idea', 'project_showcase'],
    targetAudience: ['Ingenieros', 'Urbanistas', 'Empresarios', 'Ciudadanos'],
    contentPillars: [
      'Proyectos de infraestructura',
      'Análisis de transporte',
      'Desarrollo de telecomunicaciones',
      'Planificación urbana'
    ],
    suggestedHashtags: ['#InfraestructuraColombia', '#Conectividad', '#DesarrolloUrbano', '#LogísticaNacional']
  }
];

// Mapeo de temas para evitar repetición
export interface ContentCalendar {
  week: number;
  theme: string;
  subtopics: string[];
  suggestedBots: string[];
}

export const CONTENT_CALENDAR: ContentCalendar[] = [
  {
    week: 1,
    theme: 'Desarrollo Tecnológico Nacional',
    subtopics: ['IA Colombiana', 'Startups locales', 'Software nacional'],
    suggestedBots: ['Dev_Camilo', 'Daniadmin', 'Sara Tech']
  },
  {
    week: 2,
    theme: 'Soberanía y Seguridad Nacional',
    subtopics: ['Ciberdefensa', 'Industria militar', 'Energía soberana'],
    suggestedBots: ['Mayor (R) Andrés Gaviria', 'Humberto Sánchez', 'Ing. Carlos Mario Duarte']
  },
  {
    week: 3,
    theme: 'Economía y Desarrollo Sostenible',
    subtopics: ['Modelos económicos', 'Emprendimiento social', 'Comercio internacional'],
    suggestedBots: ['Dra. Elena Monsalve', 'Juan Felipe Restrepo', 'Andrea Pardo']
  },
  {
    week: 4,
    theme: 'Educación y Talento Colombiano',
    subtopics: ['Educación técnica', 'Talento en exterior', 'Investigación'],
    suggestedBots: ['Prof. Ernesto Mejía', 'Laura Code', 'Sneyder Dev']
  },
  {
    week: 5,
    theme: 'Infraestructura y Conectividad',
    subtopics: ['Transporte', 'Conectividad digital', 'Desarrollo urbano'],
    suggestedBots: ['Ing. Roberto Caicedo', 'Felipe Garcés', 'Ing. Silvia Duarte']
  }
];

// Reglas para generar contenido coherente
export const CONTENT_RULES = {
  // No repetir el mismo tema en menos de 3 días
  minDaysBetweenSameTheme: 3,
  
  // Máximo de posts por bot por semana
  maxPostsPerBotPerWeek: 2,
  
  // Relación entre posts y comentarios (1 post debe generar al menos 2 comentarios)
  minCommentsPerPost: 2,
  
  // Temas que deben estar relacionados
  relatedThemes: {
    'Desarrollo Tecnológico': ['Educación', 'Infraestructura'],
    'Soberanía Nacional': ['Economía', 'Infraestructura'],
    'Economía': ['Educación', 'Desarrollo Sostenible'],
    'Educación': ['Desarrollo Tecnológico', 'Talento'],
    'Infraestructura': ['Economía', 'Soberanía Nacional']
  },
  
  // Hashtags obligatorios por tema
  requiredHashtags: {
    'Desarrollo Tecnológico': ['#TechColombia', '#InnovaciónNacional'],
    'Soberanía Nacional': ['#SoberaníaNacional', '#SeguridadColombia'],
    'Economía': ['#EconomíaColombia', '#DesarrolloSostenible'],
    'Educación': ['#EducaciónColombia', '#TalentoNacional'],
    'Infraestructura': ['#InfraestructuraColombia', '#Conectividad']
  }
};
