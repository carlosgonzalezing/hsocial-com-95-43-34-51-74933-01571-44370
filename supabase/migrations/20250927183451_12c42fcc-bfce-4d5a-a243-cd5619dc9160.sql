-- Fix foreign key relationships for followers table
ALTER TABLE public.followers
ADD CONSTRAINT followers_follower_id_fkey 
FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.followers
ADD CONSTRAINT followers_following_id_fkey 
FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE;