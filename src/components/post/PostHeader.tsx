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
  canDelete?: boolean;
  isHidden?: boolean;
  content?: string;
  isIdeaPost?: boolean;
  isDemoPost?: boolean;
}

export function PostHeader({ 
  post, 
  onDelete, 
  isAuthor = false, 
  canDelete = false,
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
  const shouldShowCareerLine = !isIncognito && (post.post_type === 'idea' || post.post_type === 'project' || isIdeaPost);
  const careerLine = shouldShowCareerLine ? (post.profiles as any)?.career ?? authorCareer : null;
  
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
    } else if (post.user_id && shouldShowCareerLine && !(post.profiles as any)?.career) {
      // Only fetch career information if needed (not incognito and not present in post.profiles)
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
  }, [post.user_id, post.id, isIncognito, shouldShowCareerLine, post.profiles]);

  const renderGroupTag = () => {
    if (isIncognito) return null;
    const group = (post as any)?.group;
    const groupId = (post as any)?.group_id;
    if (!groupId || !group?.name) return null;

    return (
      <Link to={`/groups/${group.slug || group.id}`} className="ml-2">
        <Badge
          variant="secondary"
          className="flex items-center gap-1 text-xs bg-muted text-foreground"
        >
          <span className="truncate max-w-[10rem]">{group.name}</span>
        </Badge>
      </Link>
    );
  };

  const renderCompanyTag = () => {
    if (isIncognito) return null;
    const company = (post as any)?.company;
    const companyId = (post as any)?.company_id;
    if (!companyId || !company?.name) return null;

    return (
      <Link to={`/companies/${company.slug || company.id}`} className="ml-2">
        <Badge
          variant="secondary"
          className="flex items-center gap-1 text-xs bg-muted text-foreground"
        >
          <span className="truncate max-w-[10rem]">{company.name}</span>
        </Badge>
      </Link>
    );
  };

  const renderIdeaTag = () => {
    if (!isIdeaPost) return null;
    
    return (
      <Badge 
        variant="secondary"
        className="ml-2 flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5"
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
        className="ml-2 flex items-center gap-1 text-xs bg-muted text-foreground"
      >
        <EyeOff className="h-3 w-3" />
        <span>Incógnito</span>
      </Badge>
    );
  };

  const renderDemoTag = () => {
    return null;
  };
  
  // No mostrar badges de carrera según requisitos visuales
  const renderCareerBadge = () => {
    if (!careerLine) return null;
    return (
      <div className="text-xs text-muted-foreground/80 font-normal truncate max-w-[18rem]">
        {careerLine}
      </div>
    );
  };

  const getDisplayName = () => {
    if (isIncognito && incognitoData) {
      return `${incognitoData.anonymous_author_name} #${incognitoData.anonymous_author_number}`;
    }
    const company = (post as any)?.company;
    const companyId = (post as any)?.company_id;
    if (companyId && company?.name) {
      return company.name;
    }
    return post.profiles?.username || 'Usuario';
  };

  const getAvatarContent = () => {
    if (isIncognito) {
      return (
        <Avatar className="h-9 w-9 bg-gray-500">
          <AvatarFallback className="bg-gray-500 text-white">
            <EyeOff className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      );
    }

    const company = (post as any)?.company;
    const companyId = (post as any)?.company_id;
    if (companyId && company?.name) {
      return (
        <Link to={`/companies/${company.slug || company.id}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={company.logo_url || undefined} />
            <AvatarFallback>{company.name?.[0]}</AvatarFallback>
          </Avatar>
        </Link>
      );
    }
    
    return (
      <Link to={`/profile/${post.user_id}`}>
        <Avatar className="h-9 w-9">
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback>{post.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
      </Link>
    );
  };

  const getUsernameElement = () => {
    if (isIncognito) {
      return (
        <span className="font-bold text-[#050505]">
          {getDisplayName()}
        </span>
      );
    }

    const company = (post as any)?.company;
    const companyId = (post as any)?.company_id;
    if (companyId && company?.name) {
      return (
        <Link 
          to={`/companies/${company.slug || company.id}`}
          className="font-bold text-[#050505] hover:underline"
        >
          {getDisplayName()}
        </Link>
      );
    }
    
    return (
      <Link 
        to={`/profile/${post.user_id}`} 
        className="font-bold text-[#050505] hover:underline"
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
          canDelete={canDelete}
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
    <div className={`flex justify-between items-start px-4 py-3 md:px-5 md:py-4 ${isHidden ? 'opacity-50' : ''}`}>
      <div className="flex items-start space-x-3">
        {getAvatarContent()}
        <div>
          <div className="flex items-center flex-wrap">
            {getUsernameElement()}
            {renderIdeaTag()}
            {renderIncognitoTag()}
            {renderDemoTag()}
            {renderGroupTag()}
            {renderCompanyTag()}
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
