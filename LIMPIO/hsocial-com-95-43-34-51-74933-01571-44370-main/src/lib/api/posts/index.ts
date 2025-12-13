
// Main entry point that exports all post-related functionality

// Post creation
export { createPost } from './create';

// Post retrieval
export { getPosts } from './retrieve';

// Post management - export from manage.ts
export { 
  deletePost,
  updatePostVisibility,
  updatePost,
  hidePost, 
  unhidePost, 
  getHiddenPosts 
} from './manage';

// Social interactions
export { addReaction } from './social/reactions';

// Re-export functions from other files for backward compatibility
export * from "./types";
export * from "./utils";
export * from "./storage";
export * from "./notifications";
export * from "./queries";

// Export share functionality
export { sharePost } from "./queries/shares";
