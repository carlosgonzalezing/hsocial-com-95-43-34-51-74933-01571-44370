
import React from "react";
import { Card } from "@/components/ui/card";
import { ReportedPost } from "@/types/database/moderation.types";
import { Loader2 } from "lucide-react";

interface ReportedPostsListProps {
  reportedPosts: ReportedPost[];
  selectedPost: string | null;
  onSelectPost: (postId: string) => void;
  isLoading: boolean;
}

const ReportedPostsList: React.FC<ReportedPostsListProps> = ({
  reportedPosts,
  selectedPost,
  onSelectPost,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <h2 className="text-lg font-medium mb-4">Publicaciones reportadas</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Cargando publicaciones reportadas...</p>
        </div>
      </Card>
    );
  }

  if (!reportedPosts || reportedPosts.length === 0) {
    return (
      <Card className="p-4">
        <h2 className="text-lg font-medium mb-4">Publicaciones reportadas</h2>
        <div className="text-center py-8 text-muted-foreground">
          No hay publicaciones reportadas
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-lg font-medium mb-4">Publicaciones reportadas</h2>
      <div className="space-y-2">
        {reportedPosts.map((post) => (
          <div
            key={post.post_id}
            role="button"
            className={`p-3 rounded-md cursor-pointer flex justify-between ${
              selectedPost === post.post_id
                ? "bg-accent"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelectPost(post.post_id)}
          >
            <div className="truncate">
              @{post.posts.profiles.username || "Usuario"}
            </div>
            <div className="text-sm font-semibold text-destructive">
              {post.count} reportes
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReportedPostsList;
