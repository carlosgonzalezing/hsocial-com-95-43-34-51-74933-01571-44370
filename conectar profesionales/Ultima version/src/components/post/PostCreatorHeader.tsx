
import { Button } from "@/components/ui/button";
import { MessageCircle, Lightbulb, Briefcase, Calendar, BarChart3, FileText, Briefcase as BriefcaseIcon, Sparkles } from "lucide-react";

type PostType = 'regular' | 'idea' | 'proyecto' | 'evento' | 'encuesta' | 'documento' | 'empleo';

interface PostCreatorHeaderProps {
  postType: PostType;
  setPostType: (type: PostType) => void;
}

export function PostCreatorHeader({ 
  postType, 
  setPostType 
}: PostCreatorHeaderProps) {
  const options = [
    { type: 'regular' as PostType, icon: MessageCircle, label: 'Publicación' },
    { type: 'idea' as PostType, icon: Sparkles, label: 'Idea' },
    { type: 'evento' as PostType, icon: Calendar, label: 'Evento' },
    { type: 'encuesta' as PostType, icon: BarChart3, label: 'Encuesta' },
    { type: 'documento' as PostType, icon: FileText, label: 'Documento' },
    { type: 'empleo' as PostType, icon: BriefcaseIcon, label: 'Empleo' },
    { type: 'proyecto' as PostType, icon: Briefcase, label: 'Proyecto' },
  ];

  return (
    <div className="flex items-center gap-1 pb-4 border-b overflow-x-auto">
      {options.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant={postType === type ? "default" : "ghost"}
          size="sm"
          onClick={() => setPostType(type)}
          className="flex items-center gap-1 px-3 py-2 whitespace-nowrap text-sm"
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
