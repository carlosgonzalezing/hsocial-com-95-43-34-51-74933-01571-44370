
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Visibility = 'public' | 'friends' | 'private' | 'incognito';

interface VisibilitySelectorProps {
  visibility: Visibility;
  setVisibility?: (visibility: Visibility) => void;
  onVisibilityChange?: (visibility: Visibility) => void;
}

export function VisibilitySelector({ 
  visibility, 
  setVisibility,
  onVisibilityChange
}: VisibilitySelectorProps) {
  const handleChange = (value: Visibility) => {
    if (setVisibility) {
      setVisibility(value);
    }
    if (onVisibilityChange) {
      onVisibilityChange(value);
    }
  };

  return (
    <Select 
      value={visibility} 
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Visibilidad" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="public">Público</SelectItem>
        <SelectItem value="friends">Amigos</SelectItem>
        <SelectItem value="private">Solo yo</SelectItem>
        <SelectItem value="incognito">Incógnito</SelectItem>
      </SelectContent>
    </Select>
  );
}
