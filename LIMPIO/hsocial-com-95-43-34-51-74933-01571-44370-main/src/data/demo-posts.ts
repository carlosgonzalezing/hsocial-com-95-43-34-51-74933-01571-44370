import { Post } from "@/types/post";

/**
 * Posts de demostración para mostrar ejemplos visuales en el feed
 * Estos posts NO están en la base de datos, son solo para demostración
 */
export const DEMO_POSTS: Post[] = [
  // IDEA 1: App de tutorias
  {
    id: "demo-idea-1",
    content: "Busco compañeros para desarrollar una plataforma que conecte estudiantes que necesitan ayuda con tutores. ¡Únete si te interesa!",
    user_id: "demo-user-1",
    visibility: "public",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    post_type: "idea",
    profiles: {
      id: "demo-user-1",
      username: "María Rodríguez",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
    },
    idea: {
      title: "📚 Plataforma de Tutorías entre Estudiantes",
      description: "Una app que conecte estudiantes que necesitan ayuda en materias específicas con otros estudiantes que dominan esos temas. Sistema de puntos y recompensas para los tutores.",
      participants: [
        {
          user_id: "demo-user-1",
          username: "María Rodríguez",
          profession: "Desarrollo Frontend",
          joined_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
        },
        {
          user_id: "demo-user-2",
          username: "Carlos Méndez",
          profession: "Diseño UI/UX",
          joined_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
        }
      ],
      needed_roles: [
        {
          title: "Desarrollador Backend",
          description: "Necesitamos alguien con experiencia en Node.js y bases de datos",
          commitment_level: "medium" as const
        }
      ],
      project_phase: "ideation" as const,
      collaboration_type: "remote" as const
    },
    reactions_count: 12,
    comments_count: 5
  },
  
  // IDEA 2: Red social sostenible
  {
    id: "demo-idea-2",
    content: "¿Y si creamos una red social que incentive hábitos sostenibles? Cada acción eco-friendly suma puntos. 🌱",
    user_id: "demo-user-3",
    visibility: "public",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    post_type: "idea",
    profiles: {
      id: "demo-user-3",
      username: "Ana Martínez",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
    },
    idea: {
      title: "🌿 EcoConnect - Red Social Sostenible",
      description: "Una plataforma donde los usuarios ganan puntos por acciones sostenibles verificadas (reciclaje, transporte público, consumo local). Los puntos se canjean por descuentos en comercios eco-friendly.",
      participants: [
        {
          user_id: "demo-user-3",
          username: "Ana Martínez",
          profession: "Product Manager",
          joined_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
        }
      ],
      needed_roles: [
        {
          title: "Desarrollador Mobile",
          description: "React Native o Flutter para crear la app móvil",
          commitment_level: "high" as const
        },
        {
          title: "Marketing Digital",
          description: "Estrategia de lanzamiento y crecimiento",
          commitment_level: "low" as const
        }
      ],
      project_phase: "planning" as const,
      collaboration_type: "hybrid" as const
    },
    reactions_count: 24,
    comments_count: 8
  },

  // IDEA 3: Marketplace universitario
  {
    id: "demo-idea-3",
    content: "Necesito ayuda para crear un marketplace donde estudiantes puedan comprar/vender apuntes, libros y recursos académicos de segunda mano.",
    user_id: "demo-user-4",
    visibility: "public",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 horas atrás
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    post_type: "idea",
    profiles: {
      id: "demo-user-4",
      username: "Diego Salazar",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego"
    },
    idea: {
      title: "📖 UniMarket - Marketplace Universitario",
      description: "Plataforma para comprar y vender recursos académicos entre estudiantes: libros, apuntes, calculadoras, material de laboratorio. Con sistema de valoraciones y chat integrado.",
      participants: [
        {
          user_id: "demo-user-4",
          username: "Diego Salazar",
          profession: "Desarrollo Web",
          joined_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego"
        },
        {
          user_id: "demo-user-5",
          username: "Laura Gómez",
          profession: "Desarrollo Backend",
          joined_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura"
        },
        {
          user_id: "demo-user-6",
          username: "Pedro Ruiz",
          profession: "QA Testing",
          joined_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
        }
      ],
      needed_roles: [
        {
          title: "Diseñador UX",
          description: "Crear wireframes y prototipos de la interfaz",
          commitment_level: "medium" as const
        }
      ],
      project_phase: "execution" as const,
      collaboration_type: "remote" as const
    },
    reactions_count: 18,
    comments_count: 12
  },

  // POST NORMAL 1
  {
    id: "demo-post-1",
    content: "¡Acabo de terminar mi primer proyecto en React! 🎉 Fue un desafío pero aprendí muchísimo. ¿Alguien más está aprendiendo desarrollo web?",
    user_id: "demo-user-7",
    visibility: "public",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    post_type: "regular",
    profiles: {
      id: "demo-user-7",
      username: "Sofía Herrera",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia"
    },
    reactions_count: 35,
    comments_count: 14
  },

  // POST NORMAL 2
  {
    id: "demo-post-2",
    content: "Tips para estudiar mejor en época de exámenes:\n\n1. Técnica Pomodoro (25 min estudio, 5 min descanso)\n2. Hacer resúmenes con tus propias palabras\n3. Estudiar en grupo para explicar conceptos\n4. Dormir bien (nada de trasnochadas)\n5. Descansos activos (caminar, estirar)\n\n¿Cuál es tu técnica favorita? 📚",
    user_id: "demo-user-8",
    visibility: "public",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    post_type: "regular",
    profiles: {
      id: "demo-user-8",
      username: "Andrés Castro",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
    },
    reactions_count: 42,
    comments_count: 23
  }
];

// Función helper para obtener posts de demo mezclados con posts reales
export function getDemoPostsForFeed(realPosts: Post[]): Post[] {
  // Si hay menos de 3 posts reales, agregar posts de demo
  if (realPosts.length < 3) {
    return [...DEMO_POSTS.slice(0, 5), ...realPosts];
  }
  
  // Si hay posts reales, insertar algunos posts de demo entre ellos
  const result: Post[] = [];
  const demoPostsToInsert = DEMO_POSTS.slice(0, 3);
  let demoIndex = 0;
  
  realPosts.forEach((post, index) => {
    result.push(post);
    
    // Insertar un post de demo cada 3 posts reales
    if ((index + 1) % 3 === 0 && demoIndex < demoPostsToInsert.length) {
      result.push(demoPostsToInsert[demoIndex]);
      demoIndex++;
    }
  });
  
  return result;
}
