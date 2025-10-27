import { Project } from '@/types/project';

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-project-1',
    title: 'H Chat - Plataforma de Mensajería Universitaria',
    description: 'H Chat es una plataforma de comunicación moderna que revoluciona la forma en que estudiantes, profesores y personal administrativo interactúan. Con características avanzadas como cifrado de extremo a extremo, grupos de estudio inteligentes, canales por materia, videollamadas HD y un sistema de compartir archivos con control de versiones, H Chat se convierte en el centro de comunicación de cualquier campus universitario.',
    short_description: 'Sistema de mensajería instantánea diseñado para conectar comunidades universitarias en tiempo real.',
    objectives: 'Facilitar la comunicación entre estudiantes y profesores. Crear un espacio seguro para compartir recursos académicos. Implementar herramientas de colaboración en tiempo real.',
    category: 'Redes Sociales',
    status: 'active',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'TypeScript', 'Redis'],
    tags: ['chat', 'mensajería', 'colaboración'],
    image_url: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=500&fit=crop',
    author_id: 'demo-user-1',
    author: {
      id: 'demo-user-1',
      username: 'Carlos Mendoza',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    },
    professor: 'Dr. Ana García',
    duration: '6 meses',
    created_at: '2024-09-15T10:00:00Z',
    updated_at: '2024-09-15T10:00:00Z',
    likes_count: 245,
    comments_count: 67,
    views_count: 3420,
    seeking_collaborators: true,
    is_open_source: true,
    github_url: 'https://github.com/carlosmendoza/h-chat',
    demo_url: 'https://h-chat-demo.vercel.app',
    documentation_url: 'https://h-chat-docs.vercel.app',
    team_members: ['María López', 'Juan Pérez', 'Sofia Torres'],
    contact_email: 'carlos.mendoza@universidad.edu',
    linkedin_url: 'https://linkedin.com/in/carlosmendoza',
    additional_links: [
      { title: 'Presentación del proyecto', url: 'https://slides.com/h-chat' },
      { title: 'Video demo', url: 'https://youtube.com/watch?v=demo' }
    ]
  },
  {
    id: 'demo-project-2',
    title: 'EcoTrack - Monitor Ambiental Inteligente',
    description: 'EcoTrack es un sistema integral de monitoreo ambiental que utiliza sensores IoT distribuidos por el campus para medir calidad del aire, niveles de ruido, temperatura, humedad y consumo energético. Los datos se visualizan en tiempo real mediante dashboards interactivos y algoritmos de ML predicen tendencias ambientales para ayudar a la universidad a tomar decisiones sostenibles.',
    short_description: 'Aplicación IoT para monitorear y analizar la calidad ambiental del campus universitario.',
    objectives: 'Monitorear la calidad ambiental del campus en tiempo real. Generar reportes automatizados para la administración. Predecir patrones de consumo energético.',
    category: 'IoT',
    status: 'active',
    technologies: ['Python', 'TensorFlow', 'Arduino', 'React', 'PostgreSQL', 'MQTT'],
    tags: ['iot', 'medio ambiente', 'machine learning'],
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=500&fit=crop',
    author_id: 'demo-user-2',
    author: {
      id: 'demo-user-2',
      username: 'Laura Rodríguez',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura'
    },
    professor: 'Ing. Roberto Silva',
    duration: '8 meses',
    created_at: '2024-08-20T14:00:00Z',
    updated_at: '2024-09-20T09:00:00Z',
    likes_count: 189,
    comments_count: 43,
    views_count: 2150,
    seeking_collaborators: false,
    is_open_source: true,
    github_url: 'https://github.com/laurarodriguez/ecotrack',
    demo_url: 'https://ecotrack-dashboard.herokuapp.com',
    documentation_url: 'https://ecotrack.readthedocs.io',
    team_members: ['Diego Martínez', 'Camila Ruiz'],
    contact_email: 'laura.rodriguez@instituto.edu',
    linkedin_url: 'https://linkedin.com/in/laurarodriguez',
    additional_links: [
      { title: 'Paper académico', url: 'https://arxiv.org/ecotrack' },
      { title: 'Manual de instalación', url: 'https://docs.ecotrack.io/install' }
    ]
  },
  {
    id: 'demo-project-3',
    title: 'StudyBuddy AI - Asistente de Estudio Personal',
    description: 'StudyBuddy AI es un compañero de estudio impulsado por inteligencia artificial que se adapta a tu estilo de aprendizaje. Genera resúmenes automáticos de lecturas, crea flashcards inteligentes, responde preguntas sobre el material de estudio, programa sesiones óptimas basadas en tu rendimiento y conecta con otros estudiantes para grupos de estudio colaborativos.',
    short_description: 'Asistente inteligente que personaliza tu experiencia de aprendizaje usando IA generativa.',
    objectives: 'Personalizar la experiencia de aprendizaje de cada estudiante. Reducir el tiempo de estudio aumentando la eficiencia. Fomentar la colaboración entre estudiantes.',
    category: 'Educación',
    status: 'development',
    technologies: ['Next.js', 'OpenAI', 'Prisma', 'Supabase', 'Tailwind CSS', 'TypeScript'],
    tags: ['ia', 'educación', 'productividad'],
    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop',
    author_id: 'demo-user-3',
    author: {
      id: 'demo-user-3',
      username: 'Miguel Santos',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel'
    },
    professor: 'Dra. Patricia Morales',
    duration: '4 meses',
    created_at: '2024-09-28T08:00:00Z',
    updated_at: '2024-09-28T16:00:00Z',
    likes_count: 312,
    comments_count: 89,
    views_count: 4890,
    seeking_collaborators: true,
    is_open_source: false,
    github_url: 'https://github.com/miguelsantos/studybuddy-ai',
    demo_url: 'https://studybuddy-ai-beta.vercel.app',
    documentation_url: 'https://studybuddy.notion.site',
    team_members: ['Andrea Vargas', 'Pablo Castro', 'Valentina Mora'],
    contact_email: 'miguel.santos@ciencias.edu',
    linkedin_url: 'https://linkedin.com/in/miguelsantos',
    additional_links: [
      { title: 'Roadmap del proyecto', url: 'https://studybuddy.notion.site/roadmap' },
      { title: 'Blog de desarrollo', url: 'https://dev.to/studybuddy' }
    ]
  },
  {
    id: 'demo-project-4',
    title: 'FitConnect - Red Social Deportiva Universitaria',
    description: 'FitConnect es una red social diseñada para la comunidad universitaria que facilita la organización de actividades deportivas. Los estudiantes pueden crear eventos deportivos, encontrar compañeros de entrenamiento, reservar instalaciones del campus, seguir sus estadísticas personales y participar en desafíos universitarios. Incluye integración con wearables y un sistema de gamificación para motivar la actividad física.',
    short_description: 'Plataforma que conecta estudiantes para practicar deportes y mantener un estilo de vida activo.',
    objectives: 'Promover un estilo de vida saludable en el campus. Facilitar la organización de eventos deportivos. Crear una comunidad deportiva activa.',
    category: 'Redes Sociales',
    status: 'planning',
    technologies: ['React Native', 'Firebase', 'Express', 'Google Maps API', 'Chart.js'],
    tags: ['fitness', 'social', 'salud'],
    image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=500&fit=crop',
    author_id: 'demo-user-4',
    author: {
      id: 'demo-user-4',
      username: 'Isabella Herrera',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella'
    },
    professor: 'Prof. Andrés Ramírez',
    duration: '5 meses',
    created_at: '2024-10-05T11:00:00Z',
    updated_at: '2024-10-05T13:00:00Z',
    likes_count: 156,
    comments_count: 34,
    views_count: 1780,
    seeking_collaborators: true,
    is_open_source: true,
    github_url: 'https://github.com/isabellaherrera/fitconnect',
    demo_url: '',
    documentation_url: 'https://fitconnect-docs.notion.site',
    team_members: ['Tomás Gutiérrez', 'Fernanda Jiménez'],
    contact_email: 'isabella.herrera@deporte.edu',
    linkedin_url: 'https://linkedin.com/in/isabellaherrera',
    additional_links: [
      { title: 'Propuesta inicial', url: 'https://docs.google.com/fitconnect' },
      { title: 'Mockups del diseño', url: 'https://figma.com/fitconnect' }
    ]
  }
];

export function getDemoProjects(): Project[] {
  return DEMO_PROJECTS;
}
