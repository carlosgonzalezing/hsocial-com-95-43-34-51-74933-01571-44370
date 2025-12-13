
import { FriendSuggestion } from "@/types/friends";
import { NotificationsSuggestionsList } from "./suggestions/NotificationsSuggestionsList";

interface NotificationsSuggestionsProps {
  suggestions: FriendSuggestion[];
  onDismissSuggestion: (userId: string) => void;
  setOpen: (open: boolean) => void;
}

export function NotificationsSuggestions({ 
  suggestions, 
  onDismissSuggestion, 
  setOpen 
}: NotificationsSuggestionsProps) {
  return (
    <NotificationsSuggestionsList
      suggestions={suggestions}
      onDismissSuggestion={onDismissSuggestion}
      setOpen={setOpen}
    />
  );
}
