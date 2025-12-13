import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

export interface ProfileResult {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

export interface PostResult {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export interface ChannelResult {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: string;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileResults, setProfileResults] = useState<ProfileResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [channelResults, setChannelResults] = useState<ChannelResult[]>([]);

  const search = useCallback(debounce(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setProfileResults([]);
      setPostResults([]);
      setChannelResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const [profiles, posts, channels] = await Promise.all([
        // Search profiles
        supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(5),
          
        // Search posts
        supabase
          .from('posts')
          .select('id, content, created_at, user_id')
          .ilike('content', `%${searchQuery}%`)
          .limit(5),
          
        // Search channels
        supabase
          .from('canales')
          .select('id, nombre, descripcion, created_at')
          .ilike('nombre', `%${searchQuery}%`)
          .limit(5)
      ]);

      setProfileResults(profiles.data || []);
      setPostResults(posts.data || []);
      setChannelResults(channels.data || []);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300), []);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    search(newQuery);
  };

  return {
    query,
    setQuery: handleQueryChange,
    profileResults,
    postResults,
    channelResults,
    isLoading,
    search
  };
}
