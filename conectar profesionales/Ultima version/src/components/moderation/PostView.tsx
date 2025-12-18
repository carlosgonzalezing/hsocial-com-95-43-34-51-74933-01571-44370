
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post } from "@/components/Post";
import { Post as PostType } from "@/types/post";
import { ReportWithUser } from "@/types/database/moderation.types";
import PostActions from "./PostActions";
import ReportDetails from "./ReportDetails";

interface PostViewProps {
  post: PostType;
  reports: ReportWithUser[];
  onAction: (action: 'approve' | 'reject' | 'delete') => void;
}

const PostView: React.FC<PostViewProps> = ({ post, reports, onAction }) => {
  return (
    <Tabs defaultValue="post">
      <TabsList className="mb-4">
        <TabsTrigger value="post">Publicación</TabsTrigger>
        <TabsTrigger value="reports">Reportes ({reports.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="post" className="space-y-4">
        <PostActions onAction={onAction} />
        <Post post={post} hideComments={true} />
      </TabsContent>

      <TabsContent value="reports">
        <ReportDetails reports={reports} />
      </TabsContent>
    </Tabs>
  );
};

export default PostView;
