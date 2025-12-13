// Main API entry file that re-exports all API functions

// Posts API
export * from './posts';

// Comments API - explicitly add named re-exports to avoid duplicates
import { getComments } from './comments';
export { getComments };

// User API
export * from './user';

// Profile API
export * from './profile';

// Hearts API 
export * from './hearts';

// Friends API
export * from './friends';

// Moderation API
export * from './moderation';

// Database cleanup utilities
export * from './database-cleanup';

// Engagement API - Removed for performance
// Events API - Removed for simplification