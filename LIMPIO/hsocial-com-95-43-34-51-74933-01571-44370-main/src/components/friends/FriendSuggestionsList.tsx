
import { Card } from "@/components/ui/card";
import { FriendSuggestion } from "@/hooks/use-friends";
import { FriendSuggestionItem } from "./FriendSuggestionItem";
import { useBatchFollowingStatus } from "@/hooks/use-batch-following-status";

interface FriendSuggestionsListProps {
  suggestions: FriendSuggestion[];
}

export function FriendSuggestionsList({ suggestions }: FriendSuggestionsListProps) {
  // Optimización: batch following status para todas las sugerencias
  const suggestionIds = suggestions.map(s => s.id);
  const { 
    getFollowingStatus, 
    updateFollowingStatus, 
    isLoading: batchLoading 
  } = useBatchFollowingStatus(suggestionIds);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Personas que quizá conozcas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <FriendSuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            batchFollowingStatus={getFollowingStatus(suggestion.id)}
            onBatchFollowingUpdate={updateFollowingStatus}
          />
        ))}
      </div>
    </Card>
  );
}
