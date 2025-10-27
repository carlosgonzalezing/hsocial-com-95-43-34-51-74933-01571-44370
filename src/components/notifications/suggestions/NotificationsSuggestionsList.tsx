
import { FriendSuggestion } from "@/types/friends";
import { SuggestionsHeader } from "./SuggestionsHeader";
import { SuggestionItem } from "./SuggestionItem";
import { SuggestionsFooter } from "./SuggestionsFooter";
import { useFriendRequestMutation } from "./useFriendRequestMutation";
import { useEffect } from "react";

interface NotificationsSuggestionsListProps {
  suggestions: FriendSuggestion[];
  onDismissSuggestion: (userId: string) => void;
  setOpen: (open: boolean) => void;
}

export function NotificationsSuggestionsList({
  suggestions,
  onDismissSuggestion,
  setOpen
}: NotificationsSuggestionsListProps) {
  const { loadingStates, pendingRequests, sendFriendRequest } = useFriendRequestMutation();

  if (suggestions.length === 0) return null;

  const handleAddFriend = async (userId: string) => {
    await sendFriendRequest(userId);
    // Close dropdown after sending friend request to prevent stuck UI
    setTimeout(() => setOpen(false), 500);
  };

  return (
    <>
      <SuggestionsHeader />
      
      {suggestions.slice(0, 5).map((suggestion) => (
        <SuggestionItem 
          key={suggestion.id}
          suggestion={suggestion}
          isPending={pendingRequests[suggestion.id] || false}
          isLoading={loadingStates[suggestion.id] || false}
          onAddFriend={handleAddFriend}
          onDismiss={(userId) => {
            onDismissSuggestion(userId);
            // Close dropdown after dismissing to prevent stuck UI
            setTimeout(() => setOpen(false), 300);
          }}
          setOpen={setOpen}
        />
      ))}
      
      <SuggestionsFooter setOpen={setOpen} />
    </>
  );
}
