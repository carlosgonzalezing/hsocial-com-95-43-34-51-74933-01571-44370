import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  X, 
  Image as ImageIcon, 
  Tag, 
  Smile, 
  MapPin, 
  FileText,
  Lightbulb,
  FolderKanban,
  Users
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CreatePostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "post" | "idea" | "project";
type Visibility = "public" | "friends" | "private";

const textBackgrounds = [
  { key: "none", label: "Ninguno", gradient: "bg-white dark:bg-gray-800" },
  { key: "gradient-1", label: "Púrpura", gradient: "bg-gradient-to-br from-purple-500 to-purple-700" },
  { key: "gradient-2", label: "Rosa", gradient: "bg-gradient-to-br from-pink-500 to-pink-700" },
  { key: "gradient-3", label: "Cyan", gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600" },
  { key: "gradient-4", label: "Magenta", gradient: "bg-gradient-to-br from-pink-500 to-purple-600" },
  { key: "gradient-5", label: "Verde", gradient: "bg-gradient-to-br from-green-400 to-green-600" },
  { key: "gradient-6", label: "Coral", gradient: "bg-gradient-to-br from-red-400 to-orange-500" },
];

export function CreatePostSheet({ open, onOpenChange }: CreatePostSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<TabType>("post");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [selectedBackground, setSelectedBackground] = useState("none");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserProfile(data);
          }
        });
    }
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!content.trim() || !user?.id) return;
    
    setIsSubmitting(true);
    
    try {
      const postData: any = {
        user_id: user.id,
        content: content.trim(),
        visibility,
      };

      // Add background if selected
      if (selectedBackground !== "none") {
        postData.background_color = selectedBackground;
      }

      const { data, error } = await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      toast({
        title: "¡Publicación creada!",
        description: "Tu publicación se ha compartido exitosamente",
      });

      // Reset form
      setContent("");
      setSelectedBackground("none");
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la publicación",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] p-0 rounded-t-2xl"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
          <SheetTitle className="text-base font-semibold">Crear publicación</SheetTitle>
          <div className="w-8" />
        </SheetHeader>

        <SheetDescription className="px-4 pt-2 text-xs text-muted-foreground">
          Comparte tus ideas, crea eventos o publica contenido con tu comunidad.
        </SheetDescription>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <Button
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 ${
                activeTab === "post" 
                  ? "border-foreground font-semibold" 
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("post")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Publicación
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 ${
                activeTab === "idea" 
                  ? "border-foreground font-semibold" 
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("idea")}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Idea
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 ${
                activeTab === "project" 
                  ? "border-foreground font-semibold" 
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("project")}
            >
              <FolderKanban className="h-4 w-4 mr-2" />
              Proyecto
            </Button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback>
                {userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{userProfile?.username || "Usuario"}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent"
              >
                <Users className="h-3 w-3 mr-1" />
                Amigos
              </Button>
            </div>
          </div>

          {/* Content Input */}
          <Textarea
            placeholder="¿Qué estás pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-none focus-visible:ring-0 text-base"
          />

          {/* Text Background Palette */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Fondo del texto</p>
            <div className="grid grid-cols-4 gap-2">
              {textBackgrounds.map((bg) => (
                <button
                  key={bg.key}
                  onClick={() => setSelectedBackground(bg.key)}
                  className={`h-12 rounded-lg ${bg.gradient} flex items-center justify-center text-white text-xs font-medium transition-transform ${
                    selectedBackground === bg.key 
                      ? "ring-2 ring-offset-2 ring-primary scale-105" 
                      : ""
                  }`}
                >
                  Aa
                </button>
              ))}
            </div>
          </div>

          {/* Add to Publication */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Agregar a tu publicación</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <ImageIcon className="h-5 w-5 text-green-500" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <Tag className="h-5 w-5 text-blue-500" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <Smile className="h-5 w-5 text-yellow-500" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <MapPin className="h-5 w-5 text-red-500" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <FileText className="h-5 w-5 text-purple-500" />
              </Button>
            </div>
          </div>

          {/* Visibility Selector */}
          <div>
            <select 
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full p-3 border rounded-lg bg-background"
            >
              <option value="public">👥 Público</option>
              <option value="friends">👫 Amigos</option>
              <option value="private">🔒 Privado</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
