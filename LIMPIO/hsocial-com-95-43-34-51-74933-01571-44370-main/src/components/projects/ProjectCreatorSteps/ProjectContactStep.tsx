import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Linkedin, Globe } from 'lucide-react';
import { type ProjectFormData } from '@/types/project';

interface ProjectContactStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

export function ProjectContactStep({ formData, updateFormData }: ProjectContactStepProps) {
  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="contact_email" className="text-sm font-medium flex items-center gap-2">
          <Mail size={16} />
          Email de Contacto *
        </Label>
        <Input
          id="contact_email"
          type="email"
          placeholder="tu.email@ejemplo.com"
          value={formData.contact_email}
          onChange={(e) => updateFormData({ contact_email: e.target.value })}
          className="w-full"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone_number" className="text-sm font-medium flex items-center gap-2">
          <Phone size={16} />
          Número de Teléfono
        </Label>
        <Input
          id="phone_number"
          type="tel"
          placeholder="+57 300 123 4567"
          value={formData.phone_number}
          onChange={(e) => updateFormData({ phone_number: e.target.value })}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Opcional - Para contacto directo</p>
      </div>

      {/* LinkedIn */}
      <div className="space-y-2">
        <Label htmlFor="linkedin_url" className="text-sm font-medium flex items-center gap-2">
          <Linkedin size={16} />
          Perfil de LinkedIn
        </Label>
        <Input
          id="linkedin_url"
          placeholder="https://linkedin.com/in/tu-perfil"
          value={formData.linkedin_url}
          onChange={(e) => updateFormData({ linkedin_url: e.target.value })}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Opcional - Para networking profesional</p>
      </div>

      {/* Personal Website */}
      <div className="space-y-2">
        <Label htmlFor="personal_website" className="text-sm font-medium flex items-center gap-2">
          <Globe size={16} />
          Sitio Web Personal
        </Label>
        <Input
          id="personal_website"
          placeholder="https://miportfolio.com"
          value={formData.personal_website}
          onChange={(e) => updateFormData({ personal_website: e.target.value })}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Opcional - Tu portafolio o sitio web</p>
      </div>

      {/* Contact Info Note */}
      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">💡 Información de Contacto</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Tu email será visible para otros estudiantes interesados en colaborar</li>
          <li>• La información adicional ayuda a establecer credibilidad profesional</li>
          <li>• Solo completa los campos con los que te sientes cómodo compartiendo</li>
        </ul>
      </div>
    </div>
  );
}