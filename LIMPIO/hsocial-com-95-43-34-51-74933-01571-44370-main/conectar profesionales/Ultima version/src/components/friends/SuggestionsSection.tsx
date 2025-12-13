
import { FriendSuggestionsList } from "./FriendSuggestionsList";
import { FriendSuggestion } from "@/hooks/use-friends";

interface SuggestionsSectionProps {
  suggestions: FriendSuggestion[];
}

export function SuggestionsSection({ 
  suggestions 
}: SuggestionsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Personas que quizás conozcas</h2>
      <FriendSuggestionsList 
        suggestions={suggestions} 
      />
    </div>
  );
}
