// Stub polls API - poll_votes table removed
import { supabase } from "@/integrations/supabase/client";

export async function submitPollVote(postId: string, optionId: string) {
  console.log('Polls feature disabled');
  throw new Error('Polls feature disabled');
}

export async function fetchPollWithVotes(postId: string) {
  console.log('Polls feature disabled');
  return null;
}

export async function fetchPollVotes(postId: string) {
  return null;
}
