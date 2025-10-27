
import { supabase } from "@/integrations/supabase/client";

export async function submitPollVote(postId: string, optionId: string) {
  try {
    console.log(`Submitting poll vote: postId=${postId}, optionId=${optionId}`);
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (voteCheckError) {
      console.error("Error checking existing vote:", voteCheckError);
      throw voteCheckError;
    }
    
    if (existingVote) {
      console.log("User has already voted");
      throw new Error("Ya has votado en esta encuesta");
    }

    // Insert the vote - store optionId as string consistently
    const { error: insertError } = await supabase
      .from('poll_votes')
      .insert({
        post_id: postId,
        user_id: user.id,
        option_id: optionId // Keep as string
      });

    if (insertError) {
      console.error("Error inserting vote:", insertError);
      throw insertError;
    }

    console.log("Vote inserted successfully");

    // Get updated poll data with vote counts
    const updatedPoll = await fetchPollWithVotes(postId);
    return { success: true, poll: updatedPoll };
  } catch (error) {
    console.error("Error submitting poll vote:", error);
    throw error;
  }
}

export async function fetchPollWithVotes(postId: string) {
  try {
    console.log(`Fetching poll with votes for post: ${postId}`);
    
    // Get the post with poll data
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('poll')
      .eq('id', postId)
      .single();
    
    if (postError) {
      console.error("Error fetching post:", postError);
      throw postError;
    }
    
    if (!post?.poll) {
      console.log("No poll found for this post");
      return null;
    }

    // Get vote counts for each option
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('post_id', postId);

    if (votesError) {
      console.error("Error fetching votes:", votesError);
      throw votesError;
    }

    console.log("Votes data:", votes);

    // Count votes by option
    const voteCounts = votes?.reduce((acc: Record<string, number>, vote) => {
      acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
      return acc;
    }, {}) || {};

    console.log("Vote counts:", voteCounts);

    // Update poll data with vote counts
    const pollData = post.poll as any;
    const updatedOptions = pollData.options?.map((option: any) => ({
      ...option,
      votes: voteCounts[String(option.id)] || 0
    })) || [];

    const totalVotes = Object.values(voteCounts).reduce((sum: number, count: number) => sum + count, 0);

    // Check if current user has voted
    const { data: { user } } = await supabase.auth.getUser();
    let userVote = null;
    if (user) {
      const { data: userVoteData } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      userVote = userVoteData?.option_id || null;
    }

    const result = {
      ...pollData,
      options: updatedOptions,
      total_votes: totalVotes,
      user_vote: userVote
    };

    console.log("Final poll data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching poll votes:", error);
    return null;
  }
}

export async function fetchPollVotes(postId: string) {
  return fetchPollWithVotes(postId);
}
