import { supabaseAdmin } from './supabase-admin';

async function createProfilesWithNullRole() {
  console.log('🔧 Creando perfiles con academic_role = null...');
  
  const bots = [
    {
      email: 'sara.bot@hsocial.local',
      profile: {
        username: 'Sara Tech',
        bio: 'Apasionada por IA y desarrollo de software. Siempre aprendiendo algo nuevo. 🚀',
        career: 'Ingeniería de Software',
        academic_role: null, // NULL como los usuarios existentes
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
        academic_role: null, // NULL como los usuarios existentes
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
        academic_role: null, // NULL como los usuarios existentes
        institution_name: 'Universidad Técnica',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia',
      }
    }
  ];

  for (const bot of bots) {
    try {
      // Obtener user ID
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.users.find(u => u.email === bot.email);
      
      if (!user) {
        console.error(`❌ Usuario no encontrado: ${bot.email}`);
        continue;
      }

      console.log(`📝 Creando perfil para ${bot.email} (ID: ${user.id})`);

      // Crear perfil con academic_role = null
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          ...bot.profile,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error(`❌ Error creando perfil ${bot.email}:`, profileError);
      } else {
        console.log(`✅ Perfil creado: ${bot.email}`);
      }

    } catch (err) {
      console.error(`❌ Error procesando ${bot.email}:`, err);
    }
    console.log('---');
  }

  console.log('✅ Proceso completado');
}

createProfilesWithNullRole().catch(console.error);
