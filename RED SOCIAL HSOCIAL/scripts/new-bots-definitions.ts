import { supabaseAdmin } from './supabase-admin';

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

export const NEW_BOTS: BotDefinition[] = [
  {
    username: 'mayor_gaviria',
    email: 'andres.gaviria.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Mayor (R) Andrés Gaviria',
      bio: 'Estrategia y Defensa Nacional. Experiencia en seguridad marítima y protección de soberanía. ⚓🇨🇴',
      career: 'Ciencias Militares',
      academic_role: undefined,
      institution_name: 'Escuela Superior de Guerra',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gaviria',
    },
    posts: [
      {
        content: '🛡️ Fortalecimiento de la Flota de Submarinos ⚓🇨🇴\n\nLa protección de nuestras dos costas no es negociable. Propongo modernizar nuestra flota con tecnología de propulsión silenciosa desarrollada en colaboración con astilleros locales. Una Armada fuerte es garantía de soberanía sobre nuestros recursos marinos. 🌊🛥️\n\n#Soberanía #ArmadaColombia #DefensaNacional',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'carlos_mario_duarte',
    email: 'carlos.duarte.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Ing. Carlos Mario Duarte',
      bio: 'Ingeniería Mecatrónica. Especialista en ciberdefensa y protección de infraestructura crítica. 🦅💻',
      career: 'Ingeniería Mecatrónica',
      academic_role: undefined,
      institution_name: 'Universidad Nacional',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlosduarte',
    },
    posts: [
      {
        content: '🛡️ Escudo de Ciberdefensa "Cóndor" 🦅💻\n\nInspirado en el modelo de Israel 🇮🇱, Colombia necesita un domo digital que proteja nuestras represas y centrales eléctricas de ataques externos. No más vulnerabilidades en la infraestructura crítica. La guerra del futuro es de bits, no de balas. 🛡️⚡\n\n#CyberSecurity #TecnologíaMilitar #ColombiaProtegida',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'elena_monsalve',
    email: 'elena.monsalve.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Dra. Elena Monsalve',
      bio: 'Economía y Desarrollo. Experta en modelos económicos internacionales y desarrollo portuario. 📈🇨🇴',
      career: 'Economía',
      academic_role: undefined,
      institution_name: 'Universidad de los Andes',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    },
    posts: [
      {
        content: '📈 El "Milagro de Singapur" en el Caribe 🇸🇬➡️🇨🇴\n\nSingapur se volvió potencia siendo un puerto eficiente. Si convertimos a Barranquilla y Buenaventura en Zonas Económicas Especiales con 0% de burocracia para exportadores, el peso colombiano se fortalecerá por pura demanda de servicios logísticos. 🚢💰\n\n#Economía #Prosperidad #LogísticaGlobal',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'juan_felipe_restrepo',
    email: 'juan.restrepo.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Juan Felipe Restrepo',
      bio: 'Administración Pública. Especialista en políticas de empleo y desarrollo PYME. 💼🇨🇴',
      career: 'Administración Pública',
      academic_role: undefined,
      institution_name: 'Universidad Externado',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juanfelipe',
    },
    posts: [
      {
        content: '💼 Incentivo al "Primer Empleador" 💼🚀\n\nIdea: El Estado asume el 50% de las prestaciones sociales de cualquier joven menor de 25 años contratado por una PYME. Menos carga para el empresario, más experiencia para el joven. ¡Ganamos todos! 🇨🇴🤝\n\n#EmpleoJoven #Pymes #CrecimientoEconómico',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'martha_lucia_beltran',
    email: 'martha.beltran.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Dra. Martha Lucía Beltrán',
      bio: 'Ciencias Políticas. Experta en democracia digital y transparencia electoral. 🗳️🇨🇴',
      career: 'Ciencias Políticas',
      academic_role: undefined,
      institution_name: 'Universidad del Rosario',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martha',
    },
    posts: [
      {
        content: '🗳️ Voto Digital con Blockchain 🗳️🔗\n\nPara eliminar cualquier sombra de duda en las elecciones, Colombia debería ser pionera en el voto electrónico mediante cadena de bloques. Transparencia total, resultados en tiempo real y ahorro de miles de millones en papelería. 🇨🇴✨\n\n#DemocraciaDigital #Blockchain #Transparencia',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'roberto_caicedo',
    email: 'roberto.caicedo.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Ing. Roberto Caicedo',
      bio: 'Ingeniería Civil. Especialista en infraestructura de transporte y logística. 🚂🇨🇴',
      career: 'Ingeniería Civil',
      academic_role: undefined,
      institution_name: 'Universidad del Valle',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto',
    },
    posts: [
      {
        content: '🚂 Autopistas Ferroviarias de Carga 🚂🛤️\n\nNo podemos depender solo de camiones. Reactivar el ferrocarril central conectando el interior con los puertos reduciría el costo de los alimentos en un 20%. Infraestructura de primer mundo para un país que produce comida. 🌽📦\n\n#TrenesParaColombia #Infraestructura #Agro',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'daniadmin',
    email: 'daniela.admin.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Daniadmin',
      bio: 'Desarrollador Fullstack. Humor técnico y realidades del mundo dev. 🏛️💻',
      career: 'Ingeniería de Sistemas',
      academic_role: undefined,
      institution_name: 'Universidad Tecnológica',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniadmin',
    },
    posts: [
      {
        content: '🏛️ El "Deploy" en la administración pública 🏛️💾\n\nActualizar un sistema en el Estado es como tratar de arreglar un bug en producción mientras el servidor está en llamas 🔥 y la documentación está escrita en piedra. ¡Necesitamos un refactor institucional ya! 😅💻\n\n#MemeDev #Estado40 #Programación',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'dev_camilo',
    email: 'camilo.dev.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Dev_Camilo',
      bio: 'Ingeniero de Software. Apasionado por la ingeniería de requisitos y desarrollo ágil. 👨‍💻🇨🇴',
      career: 'Ingeniería de Software',
      academic_role: undefined,
      institution_name: 'Universidad Javeriana',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=camilodev',
    },
    posts: [
      {
        content: '📋 La lógica de los requisitos 📋🤯\n\nCliente: "Quiero una app que solucione la pobreza". Yo: "Señor, esto es un formulario de contacto". A veces la solución no es más código, es mejor definición de procesos. 👨‍💻⚙️\n\n#SoftwareEngineering #RealidadDev #ColombiaTech',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'heider_gonzalez',
    email: 'heider.gonzalez.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Heider Gonzalez',
      bio: 'Analista de Datos. Especialista en métricas de exportación y análisis de mercado. 📊🇨🇴',
      career: 'Análisis de Datos',
      academic_role: undefined,
      institution_name: 'Universidad de Antioquia',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=heider',
    },
    posts: [
      {
        content: '📊 ¡Récord de exportación de servicios Tech! 📊🇨🇴\n\nEste trimestre, Colombia superó sus metas de exportación de software y servicios de arquitectura. El talento colombiano está construyendo las ciudades del futuro en todo el mundo. ¡Orgullo nacional! 🌟🚀\n\n#OrgulloColombiano #ExportaciónTalento #HaciaElFuturo',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
  {
    username: 'sara_milena_osorio',
    email: 'sara.osorio.bot@hsocial.local',
    password: 'BotPassword123!',
    profile: {
      username: 'Sara Milena Osorio',
      bio: 'Derecho Internacional. Especialista en energías renovables y derecho ambiental. 🍃🇨🇴',
      career: 'Derecho Internacional',
      academic_role: undefined,
      institution_name: 'Universidad del Norte',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saramilena',
    },
    posts: [
      {
        content: '🍃 Colombia como Hub de Energía Limpia 🍃☀️\n\nSiguiendo el ejemplo de Chile 🇨🇱, el desierto de la Guajira tiene el potencial de exportar Hidrógeno Verde a toda Europa. Estamos sentados sobre una mina de oro verde. ¡Es hora de explotar el viento y el sol! 💨🔋\n\n#EnergíasRenovables #HidrógenoVerde #ColombiaPotencia',
        post_type: 'post',
        visibility: 'public',
      },
    ],
  },
];
