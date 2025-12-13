import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Star, BookOpen, EyeOff, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "@/types/post";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostOptionsMenu } from "./actions/PostOptionsMenu";
import { AuthorPostOptionsMenu } from "./actions/AuthorPostOptionsMenu";
import { IncognitoAuthorOptionsMenu } from "./actions/IncognitoAuthorOptionsMenu";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostHeaderProps {
  post: Post;
  onDelete?: () => void;
  isAuthor?: boolean;
  isHidden?: boolean;
  content?: string;
  isIdeaPost?: boolean;
  isDemoPost?: boolean;
}

export function PostHeader({ 
  post, 
  onDelete, 
  isAuthor = false, 
  isHidden = false,
  content = "",
  isIdeaPost = false,
  isDemoPost = false
}: PostHeaderProps) {
  const [authorCareer, setAuthorCareer] = useState<string | null>(null);
  const [incognitoData, setIncognitoData] = useState<{
    anonymous_author_name: string;
    anonymous_author_number: number;
  } | null>(null);
  
  const isIncognito = post.visibility === 'incognito';
  
  useEffect(() => {
    // Fetch incognito data if this is an incognito post
    if (isIncognito) {
      const fetchIncognitoData = async () => {
        const { data, error } = await (supabase as any)
          .from("incognito_posts")
          .select("anonymous_author_name, anonymous_author_number")
          .eq("post_id", post.id)
          .single();
          
        if (!error && data) {
          setIncognitoData(data);
        }
      };
      
      fetchIncognitoData();
    } else if (post.user_id) {
      // Only fetch career information if it's not incognito and it's an idea post
      const fetchAuthorCareer = async () => {
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("career")
          .eq("id", post.user_id)
          .single();
          
        if (!error && data && 'career' in data) {
          setAuthorCareer(data.career);
        }
      };
      
      fetchAuthorCareer();
    }
  }, [post.user_id, post.id, isIncognito]);

  const renderIdeaTag = () => {
    if (!isIdeaPost) return null;
    
    return (
      <Badge 
        variant="secondary"
        className="ml-2 flex items-center gap-1 text-xs bg-[#0095f6] text-white px-2 py-0.5 rounded-md"
      >
        💡 Idea Colaborativa
      </Badge>
    );
  };

  const renderIncognitoTag = () => {
    if (!isIncognito) return null;
    
    return (
      <Badge 
        variant="secondary" 
        className="ml-2 flex items-center gap-1 text-xs bg-gray-600 text-white"
      >
        <EyeOff className="h-3 w-3" />
        <span>Incógnito</span>
      </Badge>
    );
  };

  const renderDemoTag = () => {
    if (!isDemoPost) return null;
    
    return (
      <Badge 
        variant="secondary" 
        className="ml-2 flex items-center gap-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      >
        <Sparkles className="h-3 w-3" />
        <span>Ejemplo</span>
      </Badge>
    );
  };
  
  // No mostrar badges de carrera según requisitos visuales
  const renderCareerBadge = () => {
    return null;
  };

  const getDisplayName = () => {
    if (isIncognito && incognitoData) {
      return `${incognitoData.anonymous_author_name} #${incognitoData.anonymous_author_number}`;
    }
    return post.profiles?.username || 'Usuario';
  };

  const getAvatarContent = () => {
    if (isIncognito) {
      return (
        <Avatar className="h-10 w-10 bg-gray-500">
          <AvatarFallback className="bg-gray-500 text-white">
            <EyeOff className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      );
    }
    
    return (
      <Link to={`/profile/${post.user_id}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback>{post.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
      </Link>
    );
  };

  const getUsernameElement = () => {
    if (isIncognito) {
      return (
        <span className="font-semibold text-gray-600">
          {getDisplayName()}
        </span>
      );
    }
    
    return (
      <Link 
        to={`/profile/${post.user_id}`} 
        className="font-semibold hover:underline"
      >
        {getDisplayName()}
      </Link>
    );
  };

  const renderOptionsMenu = () => {
    if (isAuthor) {
      // Si es el autor y es incógnito, mostrar menú limitado
      if (isIncognito) {
        return (
          <IncognitoAuthorOptionsMenu 
            postId={post.id} 
            onDelete={onDelete}
          />
        );
      }
      // Si es el autor y no es incógnito, mostrar menú completo
      return (
        <AuthorPostOptionsMenu 
          postId={post.id} 
          onDelete={onDelete}
        />
      );
    } else if (!isIncognito) {
      // Si no es el autor y no es incógnito, mostrar opciones normales
      return (
        <PostOptionsMenu 
          postId={post.id} 
          postUserId={post.user_id || ''} 
          isHidden={isHidden}
        />
      );
    }
    // Si no es el autor y es incógnito, no mostrar menú
    return null;
  };

  const isMobile = useIsMobile();

  return (
    <div className={`flex justify-between items-start px-4 py-4 md:px-8 md:py-6 ${isHidden ? 'opacity-50' : ''}`}>
      <div className="flex items-start space-x-3">
        {getAvatarContent()}
        <div>
          <div className="flex items-center flex-wrap">
            {getUsernameElement()}
            {renderIdeaTag()}
            {renderIncognitoTag()}
            {renderDemoTag()}
          </div>
          <div className="flex items-center mt-0.5">
            {renderCareerBadge()}
          </div>
          <div className="text-xs text-muted-foreground/70 mt-1 font-normal">
            {formatDistanceToNow(new Date(post.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </div>
        </div>
      </div>
      
      {/* Options menu with save, interest, etc. */}
      {renderOptionsMenu()}
    </div>
  );
}
