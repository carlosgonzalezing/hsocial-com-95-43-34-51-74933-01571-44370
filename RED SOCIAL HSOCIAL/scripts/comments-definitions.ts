import { supabaseAdmin } from './supabase-admin';

// Comentarios para los posts de defensa y seguridad
export const DEFENSE_COMMENTS = [
  {
    post_author: 'mayor_gaviria',
    comments: [
      {
        author: 'capitan_suarez',
        content: "Excelente propuesta. La modernización de submarinos no solo protege el lecho marino, sino que fortalece nuestra posición geoestratégica en el Caribe. ⚓🇨🇴",
        author_profile: {
          username: 'Capitán R. Suárez',
          bio: 'Especialista en Táctica Naval y operaciones marítimas. ⚓',
          career: 'Ciencias Navales',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suarez'
        }
      },
      {
        author: 'martha_lucia_cyber',
        content: "Totalmente de acuerdo con el 'Escudo Cóndor'. Proteger la infraestructura crítica es más barato que reconstruirla tras un ataque. ¡Gran visión! 🛡️⚡",
        author_profile: {
          username: 'Ing. Martha Lucía',
          bio: 'Ciberseguridad y protección de infraestructura crítica. 🛡️',
          career: 'Ingeniería de Sistemas',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marthacyber'
        }
      },
      {
        author: 'fabio_giraldo',
        content: "El modelo de drones de Israel es el camino. Debemos pasar de ser compradores de tecnología a ser desarrolladores soberanos. 🦅💻",
        author_profile: {
          username: 'Dr. Fabio Giraldo',
          bio: 'Analista Internacional y experto en defensa. 🌍',
          career: 'Relaciones Internacionales',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fabio'
        }
      }
    ]
  }
];

// Comentarios para los posts de economía y empleo
export const ECONOMY_COMMENTS = [
  {
    post_author: 'elena_monsalve',
    comments: [
      {
        author: 'felipe_jaramillo',
        content: "El modelo de Singapur 🇸🇬 es replicable si mejoramos la seguridad jurídica. Barranquilla tiene todo el potencial para ser ese Hub. 🚢💰",
        author_profile: {
          username: 'Economista Felipe Jaramillo',
          bio: 'Consultor Financiero y experto en modelos económicos. 💼',
          career: 'Economía',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=felipe'
        }
      },
      {
        author: 'andrea_pardo',
        content: "La idea del incentivo al primer empleador cambiaría las reglas del juego para las startups. ¡Necesitamos esto en la legislación ya! 💼🚀",
        author_profile: {
          username: 'Andrea Pardo',
          bio: 'Emprendedora Tech y apasionada por la innovación. 🚀',
          career: 'Administración de Empresas',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrea'
        }
      },
      {
        author: 'alberto_saenz',
        content: "Invertir en ferrocarriles 🚂 es la única forma de bajar el costo de vida de forma estructural. Menos fletes, más competitividad. 🛤️🇨🇴",
        author_profile: {
          username: 'Dr. Alberto Sáenz',
          bio: 'Macroeconomía y políticas públicas. 📊',
          career: 'Economía',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alberto'
        }
      }
    ]
  }
];

// Comentarios para los posts de tecnología y programación
export const TECH_COMMENTS = [
  {
    post_author: 'daniadmin',
    comments: [
      {
        author: 'sneyder_dev',
        content: "Lo del refactor institucional es real. 😂 El Estado necesita menos burocracia y más automatización con procesos claros. 🏛️💾",
        author_profile: {
          username: 'Sneyder Dev',
          bio: 'Backend Engineer especialista en optimización. ⚙️',
          career: 'Ingeniería de Software',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneyder'
        }
      },
      {
        author: 'laura_code',
        content: "¡No hagas deploy en viernes! 😅 Pero fuera de bromas, la transformación digital de Colombia debe basarse en datos abiertos y transparencia. 👨‍💻⚙️",
        author_profile: {
          username: 'Laura Code',
          bio: 'Arquitecta de Datos y analista de sistemas. 📊',
          career: 'Ingeniería de Sistemas',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura'
        }
      },
      {
        author: 'kevin_hacker',
        content: "Blockchain para las votaciones 🗳️🔗 es la solución definitiva contra el fraude. Es hora de actualizar nuestra democracia. 🇨🇴✨",
        author_profile: {
          username: 'Kevin Hacker',
          bio: 'Seguridad Informática y experto en blockchain. 🔐',
          career: 'Seguridad Informática',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin'
        }
      }
    ]
  }
];

// Comentarios para los posts de historia y futuro
export const FUTURE_COMMENTS = [
  {
    post_author: 'sara_milena_osorio',
    comments: [
      {
        author: 'ernesto_mejia',
        content: "Recordar el Ferrocarril de Antioquia nos muestra que el atraso actual es falta de voluntad, no de capacidad. ¡Gran post! 🚂📜",
        author_profile: {
          username: 'Prof. Ernesto Mejía',
          bio: 'Historiador y experto en infraestructura histórica. 📚',
          career: 'Historia',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ernesto'
        }
      },
      {
        author: 'silvia_duarte',
        content: "El Hidrógeno Verde 🍃 es el futuro de la Guajira. Podemos ser los principales exportadores de energía limpia para el mundo. 💨🔋",
        author_profile: {
          username: 'Ing. Silvia Duarte',
          bio: 'Energías Renovables y sostenibilidad ambiental. 🌱',
          career: 'Ingeniería Ambiental',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=silvia'
        }
      },
      {
        author: 'hernan_gonzalez',
        content: "Este es el tipo de debate que necesita el país. Menos polarización y más propuestas técnicas de desarrollo. 🇨🇴🚀",
        author_profile: {
          username: 'H. González',
          bio: 'Gestión Pública y desarrollo territorial. 🏛️',
          career: 'Administración Pública',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hernan'
        }
      }
    ]
  }
];
