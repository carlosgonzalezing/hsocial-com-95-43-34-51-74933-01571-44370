import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Link, ImageIcon } from 'lucide-react';
import { type ProjectFormData, type AdditionalLink } from '@/types/project';

interface ProjectAdditionalStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
}

export function ProjectAdditionalStep({ formData, updateFormData, imageFile, setImageFile }: ProjectAdditionalStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    }
  };
  const [memberInput, setMemberInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const addTeamMember = (member: string) => {
    if (member && !formData.team_members.includes(member)) {
      updateFormData({ team_members: [...formData.team_members, member] });
    }
    setMemberInput('');
  };

  const removeTeamMember = (member: string) => {
    updateFormData({ 
      team_members: formData.team_members.filter(m => m !== member) 
    });
  };

  const addAdditionalLink = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      const newLink: AdditionalLink = {
        title: linkTitle.trim(),
        url: linkUrl.trim()
      };
      updateFormData({ 
        additional_links: [...formData.additional_links, newLink] 
      });
      setLinkTitle('');
      setLinkUrl('');
    }
  };

  const removeAdditionalLink = (index: number) => {
    updateFormData({ 
      additional_links: formData.additional_links.filter((_, i) => i !== index) 
    });
  };

  const handleMemberKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTeamMember(memberInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Miembros del Equipo</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ana García, Carlos López, María Rodríguez (separados por comas)"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            onKeyDown={handleMemberKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addTeamMember(memberInput.trim())}
            disabled={!memberInput.trim()}
          >
            <Plus size={16} />
          </Button>
        </div>
        
        {/* Selected Team Members */}
        {formData.team_members.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.team_members.map((member, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {member}
                <button
                  type="button"
                  onClick={() => removeTeamMember(member)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        <Label htmlFor="challenges" className="text-sm font-medium">
          Retos y Desafíos
        </Label>
        <Textarea
          id="challenges"
          placeholder="¿Qué desafíos técnicos o conceptuales has enfrentado en este proyecto?"
          value={formData.challenges}
          onChange={(e) => updateFormData({ challenges: e.target.value })}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Achievements */}
      <div className="space-y-2">
        <Label htmlFor="achievements" className="text-sm font-medium">
          Logros y Resultados
        </Label>
        <Textarea
          id="achievements"
          placeholder="¿Qué logros o resultados destacables has obtenido con este proyecto?"
          value={formData.achievements}
          onChange={(e) => updateFormData({ achievements: e.target.value })}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <ImageIcon size={16} />
          Imagen de Portada del Proyecto
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload size={16} className="mr-2" />
            {imageFile ? 'Cambiar imagen' : 'Subir imagen'}
          </Button>
          {imageFile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setImageFile(null)}
            >
              <X size={16} />
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        {imageFile && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Sube una imagen representativa de tu proyecto (máx. 20MB)
        </p>
      </div>

      {/* Additional Links */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Link size={16} />
          Enlaces Adicionales
        </Label>
        
        {/* Add Link Form */}
        <div className="space-y-2 p-3 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="Título del enlace"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
            />
            <Input
              placeholder="https://ejemplo.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAdditionalLink}
            disabled={!linkTitle.trim() || !linkUrl.trim()}
            className="w-full"
          >
            <Plus size={14} />
            Agregar
          </Button>
        </div>

        {/* Display Added Links */}
        {formData.additional_links.length > 0 && (
          <div className="space-y-2">
            {formData.additional_links.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{link.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAdditionalLink(index)}
                  className="ml-2 text-destructive hover:text-destructive"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Note */}
      <div className="bg-primary/10 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">🎉 ¡Casi listo!</h4>
        <p className="text-xs text-muted-foreground">
          Has completado toda la información del proyecto. Revisa los datos y haz clic en "Publicar Proyecto" 
          para compartirlo con la comunidad universitaria.
        </p>
      </div>
    </div>
  );
}