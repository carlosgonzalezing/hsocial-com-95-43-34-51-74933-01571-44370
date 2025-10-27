
import { Link } from "react-router-dom";

interface SuggestionsFooterProps {
  setOpen: (open: boolean) => void;
}

export function SuggestionsFooter({ setOpen }: SuggestionsFooterProps) {
  return (
    <div className="p-2 text-center">
      <Link 
        to="/friends" 
        className="text-sm text-blue-500 hover:underline"
        onClick={() => setOpen(false)}
      >
        Ver todas las sugerencias
      </Link>
    </div>
  );
}
