import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const { data, error, count } = await supabase
  .from('posts')
  .select('id, content, is_demo, demo_readonly', { count: 'exact' })
  .eq('is_demo', true)
  .limit(5);

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log('✅ Posts demo encontrados:', count);
console.log('\nPrimeros 5 posts:');
data?.forEach((p, i) => {
  console.log(`${i+1}. ${p.content.substring(0, 60)}...`);
  console.log(`   ID: ${p.id}`);
  console.log(`   is_demo: ${p.is_demo}, demo_readonly: ${p.demo_readonly}\n`);
});
