
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "../AudioRecorder";
import { MousePointerClick, PlusCircle, Lightbulb, Mic, BarChartBig } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
// Removed StoryCreator - stories feature removed
import { supabase } from "@/integrations/supabase/client";
import { AttachmentInput } from "@/components/AttachmentInput";

interface PostActionButtonsProps {
  onFileSelect: (file: File) => void;
  onPollCreate: () => void;
  onIdeaCreate?: () => void;
  isPending: boolean;
  isIdeaMode?: boolean;
  onAudioRecord?: () => void;
}

export function PostActionButtons({ 
  onFileSelect, 
  onPollCreate, 
  onIdeaCreate, 
  isPending,
  isIdeaMode = false,
  onAudioRecord
}: PostActionButtonsProps) {
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID when component loads
  useEffect(() => {
    async function getUserId() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    }
    getUserId();
  }, []);

  const handleFileSelect = (files: File[] | null) => {
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleStoryClick = () => {
    setShowStoryCreator(true);
  };

  return (
    <div className="flex">
      {/* Mobile dropdown menu with click icon */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              <MousePointerClick className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border-border">
            <DropdownMenuItem>
              <AttachmentInput
                type="image"
                onAttachmentChange={handleFileSelect}
                showLabel={true}
                buttonVariant="ghost"
                buttonClassName="w-full flex justify-start text-blue-500"
                label="Foto/vídeo"
                accept="image/*,video/*"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AttachmentInput
                type="audio"
                onAttachmentChange={handleFileSelect}
                showLabel={true}
                buttonVariant="ghost"
                buttonClassName="w-full flex justify-start"
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPollCreate}>
              <Button variant="ghost" className="w-full flex justify-start">
                <BarChartBig className="h-4 w-4 mr-2" />
                Encuesta
              </Button>
            </DropdownMenuItem>
            {onIdeaCreate && (
              <DropdownMenuItem onClick={onIdeaCreate}>
                <Button 
                  variant="ghost" 
                  className={`w-full flex justify-start ${isIdeaMode ? 'text-primary' : ''}`}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {isIdeaMode ? "Cancelar idea" : "Idea"}
                </Button>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleStoryClick}>
              <Button variant="ghost" className="w-full flex justify-start">
                <PlusCircle className="h-4 w-4 mr-2" />
                Historia
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop buttons */}
      <div className="hidden md:flex items-center space-x-1">
        <AttachmentInput
          type="image"
          onAttachmentChange={handleFileSelect}
          showLabel={false}
          buttonSize="icon"
          buttonVariant="ghost"
          disabled={isPending}
          buttonClassName="h-10 w-10 p-0 text-blue-500"
          accept="image/*,video/*"
        />
        <AttachmentInput
          type="audio"
          onAttachmentChange={handleFileSelect}
          showLabel={false}
          buttonSize="icon"
          buttonVariant="ghost"
          disabled={isPending}
          buttonClassName="h-10 w-10 p-0 text-gray-500"
        />
        <AudioRecorder onRecordingComplete={(blob) => onFileSelect(new File([blob], "audio.webm", { type: "audio/webm" }))} />
        <Button
          variant="ghost"
          disabled={isPending}
          title="Crear encuesta"
          onClick={onPollCreate}
          className="h-10 text-sm font-normal px-2 text-gray-500"
        >
          Encuesta
        </Button>
        {onIdeaCreate && (
          <Button
            variant={isIdeaMode ? "default" : "ghost"}
            disabled={isPending}
            title={isIdeaMode ? "Cancelar idea" : "Crear idea"}
            onClick={onIdeaCreate}
            className={`h-10 ${isIdeaMode ? 'bg-primary/10 hover:bg-primary/20 text-primary border-primary' : 'text-gray-500'}`}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Story creator removed - feature simplified */}
    </div>
  );
}
