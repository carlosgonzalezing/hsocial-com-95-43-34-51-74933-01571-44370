export interface BotDefinition {
  username: string;
  email: string;
  password: string;
  profile: {
    username: string;
    bio: string;
    career: string;
    academic_role?: string;
    institution_name?: string;
    avatar_url?: string;
  };
  posts: {
    content: string;
    post_type?: 'post' | 'idea' | 'project_showcase' | 'opportunity';
    visibility?: 'public' | 'friends' | 'private' | 'incognito';
  }[];
}

export const BOTS: BotDefinition[] = [
  {
    username: 'tech_sara',
    email: 'sara.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Sara Tech',
      bio: 'Apasionada por IA y desarrollo de software. Siempre aprendiendo algo nuevo. 🚀',
      career: 'Ingeniería de Software',
      academic_role: 'student',
      institution_name: 'Universidad Nacional',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
    },
    posts: [
      {
        content: 'Justo terminé mi primer proyecto con React + TypeScript. La curva de aprendizaje vale la pena! ¿Alguien más empezando con TS? #React #TypeScript',
        post_type: 'post',
        visibility: 'public',
      },
      {
        content: 'Busco colaboradores para un proyecto open source de chatbot educativo. Si les interesa la educación + IA, envíenme DM! 🤖📚',
        post_type: 'idea',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'design_mateo',
    email: 'mateo.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Mateo Design',
      bio: 'Diseñador UX/UI con foco en accesibilidad. Creando experiencias digitales inclusivas. 🎨♿',
      career: 'Diseño Gráfico',
      academic_role: 'graduate',
      institution_name: 'Instituto de Diseño',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateo',
    },
    posts: [
      {
        content: 'Nuevo artículo: "Guía de colores para personas con daltonismo en interfaces web". Espero les sirva! 🎨♿ #UX #Accesibilidad',
        post_type: 'post',
        visibility: 'public',
      },
      {
        content: 'Comparto mi portfolio con proyectos de universidad y freelances. Cualquier feedback es bienvenido! 👇',
        post_type: 'project_showcase',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'data_lucia',
    email: 'lucia.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Lucía Data',
      bio: 'Data Scientist en formación. Amante de los datos, el café y los gatos. ☕🐱📊',
      career: 'Ciencia de Datos',
      academic_role: 'student',
      institution_name: 'Universidad Técnica',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia',
    },
    posts: [
      {
        content: 'Análisis de datos de encuesta estudiantil con Python y Plotly. Los resultados son interesantes: 68% preiere clases híbridas. 📊 #DataScience #Python',
        post_type: 'post',
        visibility: 'public',
      },
      {
        content: 'Busco dataset para practicar NLP en español. Alguna recomendación? Ya probé con noticias y tweets. 🤖📝',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
];
