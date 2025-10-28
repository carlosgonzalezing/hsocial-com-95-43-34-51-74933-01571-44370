import { 
  Lightbulb, 
  FolderKanban, 
  Image, 
  Users, 
  Video 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PostCreatorModal } from "../PostCreatorModal";
import { CreatePostSheet } from "./CreatePostSheet";
import { toast } from "@/hooks/use-toast";

interface CreateContentMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContentMenu({ open, onOpenChange }: CreateContentMenuProps) {
  const navigate = useNavigate();
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [showPostSheet, setShowPostSheet] = useState(false);
  const [postType, setPostType] = useState<'regular' | 'idea' | null>(null);

  const handleOptionClick = (option: string) => {
    onOpenChange(false);
    
    switch (option) {
      case 'idea':
      case 'project':
      case 'media':
        // Abrir el nuevo sheet de crear publicación
        setShowPostSheet(true);
        break;
      case 'group':
        toast({
          title: "Próximamente",
          description: "La función de crear grupos estará disponible pronto"
        });
        break;
      case 'story':
        navigate('/reels');
        toast({
          title: "Próximamente",
          description: "La función de crear historias/reels estará disponible pronto"
        });
        break;
    }
  };

  const menuOptions = [
    {
      id: 'idea',
      icon: Lightbulb,
      title: 'Publicar Idea Colaborativa',
      description: 'Comparte una idea y encuentra colaboradores',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'project',
      icon: FolderKanban,
      title: 'Publicar Proyecto',
      description: 'Muestra un proyecto en curso o finalizado',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      id: 'media',
      icon: Image,
      title: 'Publicar Foto/Video',
      description: 'Comparte contenido multimedia',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-500'
    },
    {
      id: 'group',
      icon: Users,
      title: 'Crear Grupo',
      description: 'Forma un grupo de trabajo colaborativo',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      id: 'story',
      icon: Video,
      title: 'Crear Historia/Reel',
      description: 'Sube un video corto o historia',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Crear Contenido</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 mt-4">
            {menuOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className="w-full flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={`${option.iconBg} p-3 rounded-full flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${option.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{option.title}</h3>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {showPostCreator && (
        <PostCreatorModal
          open={showPostCreator}
          onOpenChange={(open) => {
            setShowPostCreator(open);
            if (!open) setPostType(null);
          }}
          focusOnOpen
        />
      )}

      <CreatePostSheet
        open={showPostSheet}
        onOpenChange={setShowPostSheet}
      />
    </>
  );
}
