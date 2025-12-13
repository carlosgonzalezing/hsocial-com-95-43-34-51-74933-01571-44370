
import type { Visibility } from "../types";

export function processPostData({
  content,
  mediaUrl,
  mediaType,
  pollData,
  ideaData,
  visibility,
  userId
}: {
  content?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  pollData?: any;
  ideaData?: any;
  visibility: Visibility;
  userId: string;
}) {
  const postData: any = {
    user_id: userId,
    visibility,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (content) {
    postData.content = content;
  }

  if (mediaUrl && mediaType) {
    postData.media_url = mediaUrl;
    postData.media_type = mediaType;
  }

  if (pollData) {
    postData.poll = pollData;
    postData.post_type = 'poll';
  }

  if (ideaData) {
    postData.idea = ideaData;
    postData.post_type = 'idea';
  }

  return postData;
}

export function processMediaData(file: File) {
  return {
    type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
    size: file.size,
    name: file.name
  };
}
