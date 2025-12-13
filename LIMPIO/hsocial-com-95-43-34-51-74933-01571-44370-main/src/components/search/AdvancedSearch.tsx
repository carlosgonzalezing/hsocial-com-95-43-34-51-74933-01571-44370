import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  X, 
  User, 
  GraduationCap, 
  Calendar,
  MapPin,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchFilters {
  query: string;
  career: string;
  semester: string;
  searchType: "users" | "all";
}

const CAREERS = [
  "Ingeniería de Sistemas",
  "Medicina",
  "Derecho", 
  "Administración",
  "Psicología",
  "Arquitectura",
  "Comunicación Social",
  "Contaduría",
  "Diseño Gráfico",
  "Enfermería"
];

const SEMESTERS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
];

export function AdvancedSearch({ isOpen, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    career: "",
    semester: "",
    searchType: "users"
  });
  
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedQuery = useDebounce(filters.query, 300);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (debouncedQuery.length >= 2 || filters.career || filters.semester) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery, filters.career, filters.semester, filters.searchType]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('profiles')
        .select('id, username, bio, avatar_url, career, semester')
        .neq('id', user.id);

      // Apply text search
      if (debouncedQuery.length >= 2) {
        query = query.or(`username.ilike.%${debouncedQuery}%,bio.ilike.%${debouncedQuery}%`);
      }

      // Apply career filter
      if (filters.career) {
        query = query.eq('career', filters.career);
      }

      // Apply semester filter
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo realizar la búsqueda"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      career: "",
      semester: "",
      searchType: "users"
    });
    setResults([]);
  };

  const hasActiveFilters = filters.career || filters.semester;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda Avanzada
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {[filters.career, filters.semester].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estudiantes..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10"
              autoFocus
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Carrera
                </label>
                <Select 
                  value={filters.career} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, career: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREERS.map((career) => (
                      <SelectItem key={career} value={career}>
                        {career}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Semestre
                </label>
                <Select 
                  value={filters.semester} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        Semestre {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="md:col-span-2">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-muted-foreground">Buscando...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4 space-y-2">
              {results.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{user.username || "Usuario"}</div>
                    {user.bio && (
                      <div className="text-sm text-muted-foreground truncate">
                        {user.bio}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      {user.career && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {user.career}
                        </div>
                      )}
                      {user.semester && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Semestre {user.semester}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (filters.query.length >= 2 || hasActiveFilters) ? (
            <div className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron resultados</p>
              <p className="text-sm">Intenta con otros criterios de búsqueda</p>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Escribe al menos 2 caracteres para buscar</p>
              <p className="text-sm">O usa los filtros para explorar por carrera y semestre</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}