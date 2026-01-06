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

// Nuevo bot sobre soberanía
export const SOBERANIA_BOT: BotDefinition = {
  username: 'humberto_sanchez',
  email: 'humberto.sanchez.bot@hsocial.local',
  password: 'BotPassword123!',
  profile: {
    username: 'Humberto Sánchez',
    bio: 'Abogado especialista en Derecho Internacional. Defensor de la soberanía nacional y la institucionalidad democrática. 🛡️🇨🇴',
    career: 'Derecho',
    academic_role: undefined,
    institution_name: 'Universidad Externado de Colombia',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=humberto',
  },
  posts: [
    {
      content: '🛡️ Soberanía Nacional: Un límite infranqueable 🛡️🇨🇴\n\nLa solicitud de intervención extranjera para deponer a un mandatario democráticamente electo no es "libertad de expresión", es una afrenta directa a nuestra Constitución. Pedir que potencias externas violen nuestro suelo es, técnicamente, una invitación a la pérdida de soberanía. El Código Penal debería ser contundente ante quienes promueven la traición a la patria disfrazada de opinión. 🏛️📜\n\n#DerechoNacional #Soberanía #ColombiaSeRespeta🇨🇴',
      post_type: 'post',
      visibility: 'public',
    },
  ],
};

// Comentarios para el post de soberanía
export const SOBERANIA_COMMENTS = [
  {
    author: 'lucia_mendivelso',
    content: "La autodeterminación de los pueblos es un principio sagrado en el Derecho Internacional. Ninguna crisis interna justifica hipotecar nuestra independencia 🇨🇴. La institucionalidad debe defenderse desde adentro. 🏛️🛡️",
    author_profile: {
      username: 'Lucía Mendivelso',
      bio: 'Ciencias Políticas y Relaciones Internacionales. Experta en soberanía y autodeterminación. 🌍',
      career: 'Ciencias Políticas',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia_mendivelso'
    }
  },
  {
    author: 'mayor_gaviria',
    content: "Absolutamente de acuerdo. Quien invita a una fuerza extranjera a actuar en territorio nacional está vulnerando la seguridad del Estado. La soberanía de Colombia 🇨🇴 no es una moneda de cambio para intereses partidistas. 🦅🪖",
    author_profile: {
      username: 'Mayor (R) Andrés Gaviria',
      bio: 'Estrategia y Defensa Nacional. Experto en seguridad marítima y protección de soberanía. ⚓',
      career: 'Ciencias Militares',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gaviria'
    }
  },
  {
    author: 'felipe_garces',
    content: "La verdadera libertad reside en nuestra capacidad de resolver problemas propios con tecnología e industria nacional, no esperando 'salvadores' externos que vulneren nuestra bandera 🇨🇴. ¡Soberanía ante todo! ⚙️✊",
    author_profile: {
      username: 'Felipe Garcés',
      bio: 'Ingeniería Mecatrónica. Desarrollo tecnológico y soberanía industrial. ⚙️',
      career: 'Ingeniería Mecatrónica',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=felipe_garces'
    }
  }
];
