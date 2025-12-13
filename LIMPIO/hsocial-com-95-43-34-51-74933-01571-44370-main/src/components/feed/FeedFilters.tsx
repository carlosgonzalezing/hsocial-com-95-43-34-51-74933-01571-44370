import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Filter, 
  MessageSquare, 
  Lightbulb, 
  Camera,
  Video,
  FileText
} from "lucide-react";

export type PostType = 'text' | 'image' | 'video' | 'idea';

interface FeedFiltersProps {
  selectedTypes: PostType[];
  onTypeChange: (types: PostType[]) => void;
}

const postTypeConfig = {
  text: { 
    icon: MessageSquare, 
    label: "Texto", 
    color: "text-blue-600" 
  },
  image: { 
    icon: Camera, 
    label: "Fotos", 
    color: "text-green-600" 
  },
  video: { 
    icon: Video, 
    label: "Videos", 
    color: "text-purple-600" 
  },
  idea: { 
    icon: Lightbulb, 
    label: "Ideas", 
    color: "text-yellow-600" 
  }
};

export function FeedFilters({ selectedTypes, onTypeChange }: FeedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeToggle = (type: PostType) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const clearFilters = () => {
    onTypeChange([]);
  };

  const selectAll = () => {
    onTypeChange(['text', 'image', 'video', 'idea']);
  };

  const hasActiveFilters = selectedTypes.length > 0;

  return (
    <div className="flex items-center gap-2 p-4 bg-background border-b">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {selectedTypes.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Tipo de contenido</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(postTypeConfig).map(([type, config]) => {
            const IconComponent = config.icon;
            const isSelected = selectedTypes.includes(type as PostType);
            
            return (
              <DropdownMenuCheckboxItem
                key={type}
                checked={isSelected}
                onCheckedChange={() => handleTypeToggle(type as PostType)}
                className="flex items-center gap-2"
              >
                <IconComponent className={`h-4 w-4 ${config.color}`} />
                {config.label}
              </DropdownMenuCheckboxItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <div className="flex gap-1 p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={selectAll}
              className="flex-1 h-7 text-xs"
            >
              Todos
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="flex-1 h-7 text-xs"
            >
              Limpiar
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show active filters as badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {selectedTypes.map(type => {
            const config = postTypeConfig[type];
            const IconComponent = config.icon;
            
            return (
              <Badge 
                key={type} 
                variant="secondary" 
                className="flex items-center gap-1 text-xs"
              >
                <IconComponent className={`h-3 w-3 ${config.color}`} />
                {config.label}
                <button
                  onClick={() => handleTypeToggle(type)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}