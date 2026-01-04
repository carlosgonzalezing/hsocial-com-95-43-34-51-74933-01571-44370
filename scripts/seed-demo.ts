import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

function loadEnvFromFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8');

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore
  }
}

const cwd = process.cwd();
loadEnvFromFile(path.join(cwd, 'supabase', '.env.local'));
loadEnvFromFile(path.join(cwd, 'supabase', '.env'));
loadEnvFromFile(path.join(cwd, '.env.local'));
loadEnvFromFile(path.join(cwd, '.env'));

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtMatch = rawServiceKey?.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
const SUPABASE_SERVICE_ROLE_KEY = (jwtMatch?.[0] ?? rawServiceKey)?.replace(/\s+/g, '');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ' +
      'Set them in your shell before running.'
  );
}

const REQUIRED_SUPABASE_URL: string = SUPABASE_URL;
const REQUIRED_SUPABASE_SERVICE_ROLE_KEY: string = SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(REQUIRED_SUPABASE_URL, REQUIRED_SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type BotSpec = {
  email: string;
  username: string;
  avatar_url?: string;
  career?: string;
  bot_label?: string;
  bot_style?: string;
};

type AuthAdminUser = {
  id: string;
  email?: string;
};

async function authAdminRequest<T>(pathname: string, init: RequestInit): Promise<T> {
  const url = `${REQUIRED_SUPABASE_URL}/auth/v1${pathname}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: REQUIRED_SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${REQUIRED_SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as any) : null;
  if (!res.ok) {
    const msg = data?.msg ?? data?.message ?? text ?? `HTTP ${res.status}`;
    const err = new Error(`Auth admin request failed (${res.status}): ${msg}`);
    (err as any).status = res.status;
    (err as any).body = data;
    throw err;
  }
  return data as T;
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const data = await authAdminRequest<{ users: AuthAdminUser[] }>(
    '/admin/users?page=1&per_page=1000',
    { method: 'GET' }
  );

  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user?.id ?? null;
}

async function ensureAuthUserAndBotProfile(bot: BotSpec): Promise<string> {
  const existingId = await findUserIdByEmail(bot.email);
  let userId = existingId;

  if (!userId) {
    const password = `Demo-${randomUUID()}-${randomUUID()}`;
    try {
      const data = await authAdminRequest<{ user: AuthAdminUser }>(
        '/admin/users',
        {
          method: 'POST',
          body: JSON.stringify({
            email: bot.email,
            password,
            email_confirm: true,
            user_metadata: {
              username: bot.username,
              avatar_url: bot.avatar_url,
              career: bot.career,
              academic_role: 'Cuenta de la Comunidad',
            },
          }),
        }
      );
      userId = data.user.id;
    } catch (err) {
      // Fallback: if user already exists, fetch id
      const fallbackId = await findUserIdByEmail(bot.email);
      if (!fallbackId) throw err;
      userId = fallbackId;
    }
  }

  // Ensure profile exists and mark as bot
  const { error: upsertError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      username: bot.username,
      avatar_url: bot.avatar_url ?? null,
      career: bot.career ?? null,
      is_bot: true,
      bot_label: bot.bot_label ?? null,
      bot_style: bot.bot_style ?? null,
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: 'id' }
  );

  if (upsertError) throw upsertError;
  return userId;
}

async function getFallbackUserId(): Promise<string> {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) throw error;
  const id = (data as any[])?.[0]?.id as string | undefined;
  if (!id) {
    throw new Error('No profiles found to use as fallback for demo seeding. Create a real user first.');
  }
  return id;
}

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

async function resetDemoPosts() {
  const { error } = await supabase.from('posts').delete().eq('is_demo', true);
  if (error) {
    throw new Error(
      `Failed to reset demo posts. Did you apply the demo/bots migration? Original error: ${error.message}`
    );
  }
}

async function seedDemoPosts(botIds: Record<string, string>) {
  const posts: any[] = [
    {
      user_id: botIds.community,
      visibility: 'public',
      content: 'Busco compañeros para desarrollar una plataforma que conecte estudiantes que necesitan ayuda con tutores. ¡Únete si te interesa!',
      post_type: 'idea',
      idea: {
        title: '📚 Plataforma de Tutorías entre Estudiantes',
        description:
          'Una app que conecte estudiantes que necesitan ayuda en materias específicas con otros estudiantes que dominan esos temas. Sistema de puntos y recompensas para los tutores.',
        participants: [
          {
            user_id: botIds.community,
            username: 'Comunidad HSocial',
            profession: 'Coordinación',
            joined_at: hoursAgoIso(6),
          },
        ],
        needed_roles: [
          {
            title: 'Desarrollador Backend',
            description: 'Necesitamos alguien con experiencia en Node.js y bases de datos',
            commitment_level: 'medium',
          },
        ],
        project_phase: 'ideation',
        collaboration_type: 'remote',
      },
      created_at: hoursAgoIso(6),
      updated_at: hoursAgoIso(6),
      is_demo: true,
      demo_category: 'idea',
      demo_source: 'seed',
      demo_readonly: true,
    },
    {
      user_id: botIds.mentor,
      visibility: 'public',
      content:
        'Tip rápido: si vas a iniciar un proyecto, define primero el problema y el usuario. Después viene la tecnología. ¿Qué problema estás resolviendo hoy?',
      post_type: 'regular',
      created_at: hoursAgoIso(10),
      updated_at: hoursAgoIso(10),
      is_demo: true,
      demo_category: 'post',
      demo_source: 'seed',
      demo_readonly: true,
    },
    {
      user_id: botIds.events,
      visibility: 'public',
      content:
        '📅 Evento recomendado: Meetup de Portafolios. Trae tu CV y tu proyecto favorito para feedback. (Publicación de muestra)',
      post_type: 'regular',
      created_at: hoursAgoIso(14),
      updated_at: hoursAgoIso(14),
      is_demo: true,
      demo_category: 'event',
      demo_source: 'seed',
      demo_readonly: true,
    },
  ];

  const { error } = await supabase.from('posts').insert(posts);
  if (error) throw error;
}

async function main() {
  const shouldReset = process.argv.includes('--reset');

  const bots: BotSpec[] = [
    {
      email: 'bot-community@hsocial.demo',
      username: 'Comunidad HSocial',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Community',
      career: 'Cuenta Oficial',
      bot_label: 'Cuenta de la Comunidad',
      bot_style: 'community',
    },
    {
      email: 'bot-mentor@hsocial.demo',
      username: 'Mentor HSocial',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
      career: 'Mentoría',
      bot_label: 'Mentor',
      bot_style: 'mentor',
    },
    {
      email: 'bot-events@hsocial.demo',
      username: 'Eventos HSocial',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Events',
      career: 'Eventos',
      bot_label: 'Cuenta de Eventos',
      bot_style: 'events',
    },
  ];

  let community: string;
  let mentor: string;
  let events: string;

  try {
    [community, mentor, events] = await Promise.all(bots.map(ensureAuthUserAndBotProfile));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('⚠️ Bot auth creation failed; falling back to an existing user for demo posts:', err);
    const fallbackUserId = await getFallbackUserId();
    community = fallbackUserId;
    mentor = fallbackUserId;
    events = fallbackUserId;
  }

  if (shouldReset) {
    await resetDemoPosts();
  }

  await seedDemoPosts({ community, mentor, events });

  // eslint-disable-next-line no-console
  console.log('✅ Demo seed completed', { reset: shouldReset });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Demo seed failed:', err);
  process.exit(1);
});
