import { supabaseAdmin } from './supabase-admin';

async function checkStatus() {
  console.log('🔍 Verificando estado final...');
  
  // Ver posts
  const { data: posts, error: postError } = await supabaseAdmin
    .from('posts')
    .select('content, user_id')
    .in('user_id', ['fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b', '1187b53f-2c2e-4a2f-9521-5054f6580588', '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a']);
  
  console.log('📝 Posts creados:', posts?.length || 0);
  posts?.forEach(post => console.log('- ' + post.content.substring(0, 50) + '...'));
  
  // Ver perfiles
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, username, bio, career')
    .in('id', ['fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b', '1187b53f-2c2e-4a2f-9521-5054f6580588', '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a']);
  
  console.log('\n👤 Perfiles encontrados:', profiles?.length || 0);
  profiles?.forEach(p => {
    console.log(`- ${p.username || 'SIN NOMBRE'}: ${p.bio ? '✅ con bio' : '❌ sin bio'} - ${p.career || 'sin carrera'}`);
  });
  
  return { posts: posts?.length || 0, profiles: profiles?.length || 0 };
}

checkStatus().catch(console.error);
