import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectCreatorModal } from '@/components/projects/ProjectCreatorModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Layout } from '@/components/layout';
import { PROJECT_CATEGORIES, type Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function Projects() {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Query para obtener TODOS los proyectos (ideas convertidas + proyectos creados)
  const { data: projectPosts = [], isLoading } = useQuery({
    queryKey: ['project-posts', selectedStatus],
    queryFn: async () => {
      // Obtener ideas convertidas a proyectos
      let ideasQuery = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_type', 'idea')
        .not('project_status', 'is', null)
        .order('updated_at', { ascending: false });
      
      if (selectedStatus !== 'all') {
        ideasQuery = ideasQuery.eq('project_status', selectedStatus);
      }

      // Obtener proyectos creados directamente
      const showcasesQuery = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url
          ),
          project_showcases!project_showcases_post_id_fkey (
            project_title,
            project_description,
            project_status,
            technologies_used,
            github_url,
            demo_url,
            project_url,
            images_urls,
            seeking_collaborators,
            collaboration_roles,
            achievements,
            industry
          )
        `)
        .eq('post_type', 'project_showcase')
        .order('updated_at', { ascending: false });
      
      const [ideasResult, showcasesResult] = await Promise.all([
        ideasQuery,
        showcasesQuery
      ]);
      
      if (ideasResult.error) throw ideasResult.error;
      if (showcasesResult.error) throw showcasesResult.error;
      
      // Combinar ambos resultados
      return [...(ideasResult.data || []), ...(showcasesResult.data || [])];
    }
  });

  // Convertir posts a formato Project (ideas convertidas Y project_showcases)
  const projects: Project[] = useMemo(() => {
    return projectPosts.map((post: any) => {
      // Check if it's a project_showcase or an idea
      const isShowcase = post.post_type === 'project_showcase';
      const showcase = post.project_showcases?.[0];
      const idea = post.idea || {};

      if (isShowcase && showcase) {
        // Map project_showcase data
        return {
          id: post.id,
          title: showcase.project_title || 'Sin título',
          description: showcase.project_description || post.content || '',
          short_description: showcase.project_description?.substring(0, 150) || '',
          objectives: showcase.achievements?.[0] || '',
          status: showcase.project_status === 'active' ? 'active' :
                  showcase.project_status === 'completed' ? 'completed' :
                  showcase.project_status === 'development' ? 'development' : 'planning',
          category: showcase.industry || 'Otro',
          technologies: showcase.technologies_used || [],
          tags: [],
          image_url: showcase.images_urls?.[0],
          github_url: showcase.github_url,
          demo_url: showcase.demo_url,
          documentation_url: showcase.project_url,
          is_open_source: false,
          seeking_collaborators: showcase.seeking_collaborators || false,
          author_id: post.user_id,
          author: post.profiles ? {
            id: post.profiles.id,
            username: post.profiles.username || 'Usuario',
            avatar_url: post.profiles.avatar_url
          } : undefined,
          team_members: showcase.collaboration_roles || [],
          contact_email: '',
          additional_links: [],
          likes_count: 0,
          comments_count: 0,
          views_count: 0,
          created_at: post.created_at,
          updated_at: post.updated_at
        };
      } else {
        // Map idea data (converted to project)
        return {
          id: post.id,
          title: idea.title || 'Sin título',
          description: idea.description || post.content || '',
          short_description: idea.description?.substring(0, 150) || '',
          objectives: idea.expected_impact || '',
          status: post.project_status === 'in_progress' ? 'development' : 
                  post.project_status === 'completed' ? 'completed' : 'planning',
          category: idea.category || 'Otro',
          technologies: idea.resources_needed || [],
          tags: [],
          is_open_source: false,
          seeking_collaborators: post.project_status === 'in_progress',
          author_id: post.user_id,
          author: post.profiles ? {
            id: post.profiles.id,
            username: post.profiles.username || 'Usuario',
            avatar_url: post.profiles.avatar_url
          } : undefined,
          team_members: [],
          contact_email: '',
          additional_links: [],
          likes_count: 0,
          comments_count: 0,
          views_count: 0,
          created_at: post.created_at,
          updated_at: post.updated_at
        };
      }
    });
  }, [projectPosts]);

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Proyectos Universitarios - HSocial</title>
          <meta name="description" content="Explora e inspírate con ideas innovadoras de proyectos universitarios" />
        </Helmet>

        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Proyectos Universitarios
                </h1>
                <p className="text-lg opacity-90">
                  Explora e inspírate con ideas innovadoras
                </p>
              </div>
              <Button
                onClick={() => setIsCreatorModalOpen(true)}
                className="bg-white text-primary hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg flex items-center gap-2 self-center lg:self-auto"
              >
                <Plus size={20} />
                Crear
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 rounded-lg border-2 focus:border-primary"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center gap-2 md:w-64">
                <Filter className="text-muted-foreground" size={20} />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="rounded-lg border-2">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {PROJECT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 md:w-48">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="rounded-lg border-2">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="idea">💡 Ideas</SelectItem>
                    <SelectItem value="in_progress">🚀 En Desarrollo</SelectItem>
                    <SelectItem value="completed">✅ Completados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List - Single Column */}
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="max-w-5xl mx-auto space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-xl h-56"></div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="max-w-5xl mx-auto space-y-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No se encontraron proyectos
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Sé el primero en compartir un proyecto innovador'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modals */}
        <ProjectCreatorModal
          open={isCreatorModalOpen}
          onOpenChange={setIsCreatorModalOpen}
        />
        
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            open={!!selectedProject}
            onOpenChange={(open) => !open && setSelectedProject(null)}
          />
        )}
      </div>
    </Layout>
  );
}