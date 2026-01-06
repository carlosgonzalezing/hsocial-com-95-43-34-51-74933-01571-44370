import { supabaseAdmin } from './supabase-admin';

async function updateProfiles() {
  console.log('🔧 Actualizando perfiles con datos reales...');
  
  const bots = [
    {
      id: 'fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b',
      profile: {
        username: 'Sara Tech',
        bio: 'Apasionada por IA y desarrollo de software. Siempre aprendiendo algo nuevo. 🚀',
        career: 'Ingeniería de Software',
        institution_name: 'Universidad Nacional',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
      }
    },
    {
      id: '1187b53f-2c2e-4a2f-9521-5054f6580588',
      profile: {
        username: 'Mateo Design',
        bio: 'Diseñador UX/UI con foco en accesibilidad. Creando experiencias digitales inclusivas. 🎨♿',
        career: 'Diseño Gráfico',
        institution_name: 'Instituto de Diseño',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateo',
      }
    },
    {
      id: '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a',
      profile: {
        username: 'Lucía Data',
        bio: 'Data Scientist en formación. Amante de los datos, el café y los gatos. ☕🐱📊',
        career: 'Ciencia de Datos',
        institution_name: 'Universidad Técnica',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia',
      }
    }
  ];

  for (const bot of bots) {
    try {
      console.log(`📝 Actualizando perfil: ${bot.profile.username}`);

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          ...bot.profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bot.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${bot.profile.username}:`, updateError);
      } else {
        console.log(`✅ Perfil actualizado: ${bot.profile.username}`);
      }

    } catch (err) {
      console.error(`❌ Error procesando ${bot.profile.username}:`, err);
    }
    console.log('---');
  }

  console.log('✅ Actualización completada');
}

updateProfiles().catch(console.error);
