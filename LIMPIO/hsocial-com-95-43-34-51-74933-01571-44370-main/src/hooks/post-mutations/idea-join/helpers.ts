
// Re-export all functions from the new utility files
import { joinIdea, leaveIdea } from './core-functions';
import { updateParticipantsJson, removeParticipantFromJson } from './json-operations';
import { createIdeaNotification, createIdeaLeaveNotification } from './notifications';

export {
  // Core functions
  joinIdea,
  leaveIdea,
  
  // JSON operations
  updateParticipantsJson,
  removeParticipantFromJson,
  
  // Notification functions
  createIdeaNotification,
  createIdeaLeaveNotification
};
