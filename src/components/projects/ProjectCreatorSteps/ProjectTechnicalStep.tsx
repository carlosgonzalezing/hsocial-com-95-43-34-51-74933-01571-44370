import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Github, Globe, FileText } from 'lucide-react';
import { POPULAR_TECHNOLOGIES, type ProjectFormData } from '@/types/project';

interface ProjectTechnicalStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

export function ProjectTechnicalStep({ formData, updateFormData }: ProjectTechnicalStepProps) {
  const [techInput, setTechInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies.includes(tech)) {
      updateFormData({ technologies: [...formData.technologies, tech] });
    }
    setTechInput('');
  };

  const removeTechnology = (tech: string) => {
    updateFormData({ 
      technologies: formData.technologies.filter(t => t !== tech) 
    });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      updateFormData({ tags: [...formData.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateFormData({ 
      tags: formData.tags.filter(t => t !== tag) 
    });
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTechnology(techInput.trim());
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Technologies */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tecnologías Utilizadas</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe una tecnología (separadas por comas)"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addTechnology(techInput.trim())}
              disabled={!techInput.trim()}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          {/* Popular Technologies */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {POPULAR_TECHNOLOGIES.slice(0, 8).map((tech) => (
              <Button
                key={tech}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTechnology(tech)}
                disabled={formData.technologies.includes(tech)}
                className="h-7 text-xs"
              >
                {tech}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Selected Technologies */}
        {formData.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags/Palabras Clave</Label>
        <div className="flex gap-2">
          <Input
            placeholder="IA, Machine Learning, Web Development (separadas por comas)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addTag(tagInput.trim())}
            disabled={!tagInput.trim()}
          >
            <Plus size={16} />
          </Button>
        </div>
        
        {/* Selected Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Project Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Estado del Proyecto</Label>
        <Select value={formData.status} onValueChange={(value: any) => updateFormData({ status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planificación</SelectItem>
            <SelectItem value="development">En Desarrollo</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Links */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Github size={16} />
            Repositorio de GitHub
          </Label>
          <Input
            placeholder="https://github.com/usuario/proyecto"
            value={formData.github_url}
            onChange={(e) => updateFormData({ github_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileText size={16} />
            Enlace de Documentación
          </Label>
          <Input
            placeholder="https://docs.miproyecto.com"
            value={formData.documentation_url}
            onChange={(e) => updateFormData({ documentation_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe size={16} />
            Demo/Prototipo
          </Label>
          <Input
            placeholder="https://demo.miproyecto.com"
            value={formData.demo_url}
            onChange={(e) => updateFormData({ demo_url: e.target.value })}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label className="text-sm font-medium">¿Es un proyecto de código abierto?</Label>
            <p className="text-xs text-muted-foreground">El código fuente será público y accesible</p>
          </div>
          <Switch
            checked={formData.is_open_source}
            onCheckedChange={(checked) => updateFormData({ is_open_source: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label className="text-sm font-medium">¿Buscas colaboradores?</Label>
            <p className="text-xs text-muted-foreground">Otros estudiantes podrán solicitar unirse</p>
          </div>
          <Switch
            checked={formData.seeking_collaborators}
            onCheckedChange={(checked) => updateFormData({ seeking_collaborators: checked })}
          />
        </div>
      </div>
    </div>
  );
}