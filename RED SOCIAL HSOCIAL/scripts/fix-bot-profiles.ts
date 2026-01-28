import { supabaseAdmin } from './supabase-admin';

async function fixExistingProfiles() {
  console.log('🔧 Actualizando perfiles de bots existentes...');
  
  // IDs de los usuarios creados (del log anterior)
  const bots = [
    {
      email: 'sara.bot@hsocial.local',
      profile: {
        username: 'Sara Tech',
        bio: 'Apasionada por IA y desarrollo de software. Siempre aprendiendo algo nuevo. 🚀',
        career: 'Ingeniería de Software',
        academic_role: 'student', // Valor corregido
        institution_name: 'Universidad Nacional',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
      }
    },
    {
      email: 'mateo.bot@hsocial.local',
      profile: {
        username: 'Mateo Design',
        bio: 'Diseñador UX/UI con foco en accesibilidad. Creando experiencias digitales inclusivas. 🎨♿',
        career: 'Diseño Gráfico',
        academic_role: 'graduate', // Valor corregido
        institution_name: 'Instituto de Diseño',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateo',
      }
    },
    {
      email: 'lucia.bot@hsocial.local',
      profile: {
        username: 'Lucía Data',
        bio: 'Data Scientist en formación. Amante de los datos, el café y los gatos. ☕🐱📊',
        career: 'Ciencia de Datos',
        academic_role: 'student', // Valor corregido
        institution_name: 'Universidad Técnica',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia',
      }
    }
  ];

  for (const bot of bots) {
    try {
      // 1) Obtener el user ID desde auth users
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error(`❌ Error listando usuarios:`, listError);
        continue;
      }

      const user = users.users.find(u => u.email === bot.email);
      if (!user) {
        console.error(`❌ Usuario no encontrado: ${bot.email}`);
        continue;
      }

      console.log(`📝 Actualizando perfil para ${bot.email} (ID: ${user.id})`);

      // 2) Crear/actualizar perfil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          ...bot.profile,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error(`❌ Error actualizando perfil ${bot.email}:`, profileError);
      } else {
        console.log(`✅ Perfil actualizado: ${bot.email}`);
      }

      // 3) Crear posts (si no existen)
      const posts = [
        {
          content: 'Justo terminé mi primer proyecto con React + TypeScript. La curva de aprendizaje vale la pena! ¿Alguien más empezando con TS? #React #TypeScript',
          post_type: 'post',
          visibility: 'public' as const,
        },
        {
          content: 'Busco colaboradores para un proyecto open source de chatbot educativo. Si les interesa la educación + IA, envíenme DM! 🤖📚',
          post_type: 'idea',
          visibility: 'public' as const,
        }
      ];

      for (const post of posts) {
        const { error: postError } = await supabaseAdmin.from('posts').insert({
          user_id: user.id,
          content: post.content,
          post_type: post.post_type || 'post',
          visibility: post.visibility || 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (postError) {
          // Ignorar error si el post ya existe
          if (!postError.message?.includes('duplicate')) {
            console.error(`❌ Error creando post para ${bot.email}:`, postError);
          }
        } else {
          console.log(`✅ Post creado: ${bot.email}`);
        }
      }

    } catch (err) {
      console.error(`❌ Error procesando ${bot.email}:`, err);
    }
    console.log('---');
  }

  console.log('✅ Actualización completada');
}

fixExistingProfiles().catch(console.error);
