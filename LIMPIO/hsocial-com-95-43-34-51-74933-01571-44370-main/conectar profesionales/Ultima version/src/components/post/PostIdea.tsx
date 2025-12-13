
import { Idea, Post } from "@/types/post";
import { IdeaContent } from "./IdeaContent";
import { IdeaProjectActions } from "./IdeaProjectActions";
import { IdeaParticipants } from "./IdeaParticipants";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface PostIdeaProps {
  idea: Idea;
  postId: string;
  post: Post;
}

export function PostIdea({ idea, postId, post }: PostIdeaProps) {
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const checkAuthor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthor(user?.id === post.user_id);
    };
    checkAuthor();
  }, [post.user_id]);

  return (
    <div className="space-y-3">
      <IdeaContent idea={idea} />
      <IdeaParticipants postId={postId} />
      <IdeaProjectActions post={post} isAuthor={isAuthor} />
    </div>
  );
}
