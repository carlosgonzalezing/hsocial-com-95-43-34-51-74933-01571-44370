// Stub polls API - poll_votes table removed
import { supabase } from "@/integrations/supabase/client";

export async function submitPollVote(postId: string, optionId: string) {
  const { data, error } = await (supabase as any).rpc('vote_on_poll', {
    post_id_param: postId,
    option_id_param: optionId,
  });

  if (error) {
    throw error;
  }

  if (data && typeof data === 'object' && 'success' in data && (data as any).success === false) {
    throw new Error((data as any).error || 'No se pudo registrar el voto');
  }

  return data;
}

export async function fetchPollWithVotes(postId: string) {
  console.log('Polls feature disabled');
  return null;
}

export async function fetchPollVotes(postId: string) {
  return null;
}
