
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function SubmitButton({ onClick, disabled }: SubmitButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      Comentar
    </Button>
  );
}
