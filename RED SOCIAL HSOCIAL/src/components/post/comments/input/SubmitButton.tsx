
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading?: boolean;
}

export function SubmitButton({ onClick, disabled, isLoading = false }: SubmitButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={isLoading ? "bg-orange-600 hover:bg-orange-700" : ""}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Enviando...
        </>
      ) : (
        "Comentar"
      )}
    </Button>
  );
}
