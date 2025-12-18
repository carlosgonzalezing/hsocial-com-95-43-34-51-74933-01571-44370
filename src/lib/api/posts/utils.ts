
// Utils for transforming post data

export function transformPoll(pollData: any) {
  if (!pollData) return null;
  
  return {
    id: pollData.id,
    question: pollData.question,
    options: Array.isArray(pollData.options) ? pollData.options : [],
    votes_count: pollData.votes_count || 0,
    user_has_voted: pollData.user_has_voted || false,
    user_choice: pollData.user_choice || null,
    total_votes: pollData.total_votes || 0,
    user_vote: pollData.user_vote || null
  };
}

export function transformIdea(ideaData: any) {
  if (!ideaData) return null;
  
  return {
    id: ideaData.id,
    title: ideaData.title,
    description: ideaData.description,
    participants: Array.isArray(ideaData.participants) ? ideaData.participants : [],
    created_at: ideaData.created_at,
    updated_at: ideaData.updated_at
  };
}
