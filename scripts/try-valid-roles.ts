import { supabaseAdmin } from './supabase-admin';

async function createProfilesWithValidRoles() {
  console.log('🔧 Creando perfiles con valores válidos...');
  
  const bots = [
    {
      email: 'sara.bot@hsocial.local',
      profile: {
        username: 'Sara Tech',
        bio: 'Apasionada por IA y desarrollo de software. Siempre aprendiendo algo nuevo. 🚀',
        career: 'Ingeniería de Software',
        academic_role: 'student', // Intentaremos valores comunes
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
        academic_role: 'graduate',
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
        academic_role: 'student',
        institution_name: 'Universidad Técnica',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia',
      }
    }
  ];

  // Valores comunes para intentar
  const possibleRoles = ['student', 'graduate', 'alumni', 'faculty', 'staff', 'other', null];

  for (const bot of bots) {
    try {
      // Obtener user ID
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.users.find(u => u.email === bot.email);
      
      if (!user) {
        console.error(`❌ Usuario no encontrado: ${bot.email}`);
        continue;
      }

      console.log(`📝 Intentando crear perfil para ${bot.email} (ID: ${user.id})`);

      // Intentar con diferentes valores de academic_role
      let profileCreated = false;
      
      for (const role of possibleRoles) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            ...bot.profile,
            academic_role: role,
            updated_at: new Date().toISOString(),
          });

        if (!profileError) {
          console.log(`✅ Perfil creado con academic_role="${role}": ${bot.email}`);
          profileCreated = true;
          break;
        } else {
          console.log(`❌ Fallo con academic_role="${role}": ${profileError.message?.substring(0, 50)}...`);
        }
      }

      if (!profileCreated) {
        console.error(`❌ No se pudo crear perfil para ${bot.email} con ningún valor`);
      }

    } catch (err) {
      console.error(`❌ Error procesando ${bot.email}:`, err);
    }
    console.log('---');
  }

  console.log('✅ Proceso completado');
}

createProfilesWithValidRoles().catch(console.error);
