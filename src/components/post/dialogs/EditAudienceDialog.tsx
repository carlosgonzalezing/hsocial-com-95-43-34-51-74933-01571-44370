
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Globe, Users, Lock } from "lucide-react";

interface EditAudienceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visibility: 'public' | 'friends' | 'private') => void;
  currentVisibility: string;
}

export function EditAudienceDialog({ 
  isOpen, 
  onClose, 
  onSave,
  currentVisibility = "public"
}: EditAudienceDialogProps) {
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(
    (currentVisibility as 'public' | 'friends' | 'private') || 'public'
  );

  const handleSave = () => {
    onSave(visibility);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>¿Quién puede ver tu publicación?</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup
            value={visibility}
            onValueChange={(value) => setVisibility(value as 'public' | 'friends' | 'private')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent cursor-pointer">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4" />
                <div>
                  <p className="font-medium">Público</p>
                  <p className="text-xs text-muted-foreground">Cualquier persona en HuecApp</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent cursor-pointer">
              <RadioGroupItem value="friends" id="friends" />
              <Label htmlFor="friends" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                <div>
                  <p className="font-medium">Amigos</p>
                  <p className="text-xs text-muted-foreground">Solo tus amigos pueden ver esto</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent cursor-pointer">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                <Lock className="h-4 w-4" />
                <div>
                  <p className="font-medium">Solo yo</p>
                  <p className="text-xs text-muted-foreground">Solo tú puedes ver esto</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
