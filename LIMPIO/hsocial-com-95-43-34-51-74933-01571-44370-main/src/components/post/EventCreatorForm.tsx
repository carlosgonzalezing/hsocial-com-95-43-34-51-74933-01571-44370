import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Event } from "@/types/post";
import { ColorGradientPicker } from "./ColorGradientPicker";
import { ImageUploadPreview } from "./ImageUploadPreview";

interface EventCreatorFormProps {
  event: Event & {
    subtitle?: string;
    gradient_color?: string;
    banner_file?: File | null;
  };
  setEvent: (event: Event & {
    subtitle?: string;
    gradient_color?: string;
    banner_file?: File | null;
  }) => void;
}

export function EventCreatorForm({ event, setEvent }: EventCreatorFormProps) {
  const handleChange = (field: string, value: any) => {
    console.log(`🎯 Event field changed:`, { field, value });
    setEvent({ ...event, [field]: value });
  };

  // Helper function to ensure proper date format
  const formatDateTimeForInput = (dateTimeString?: string): { date: string; time: string } => {
    if (!dateTimeString) {
      return { date: '', time: '09:00' };
    }
    
    // Handle different input formats
    if (dateTimeString.includes('T')) {
      const [datePart, timePart] = dateTimeString.split('T');
      return {
        date: datePart,
        time: timePart.split(':').slice(0, 2).join(':') // Remove seconds if present
      };
    }
    
    return { date: dateTimeString, time: '09:00' };
  };

  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Información Básica</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-title" className="text-sm font-medium">
            Título del evento *
          </Label>
          <Input
            id="event-title"
            placeholder="Ej: VIVE FEST 2024"
            value={event.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-subtitle" className="text-sm font-medium">
            Subtítulo
          </Label>
          <Input
            id="event-subtitle"
            placeholder="Ej: Innovación y Futuro Tecnológico"
            value={event.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-description" className="text-sm font-medium">
            Descripción *
          </Label>
          <Textarea
            id="event-description"
            placeholder="Describe tu evento en detalle..."
            value={event.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="text-base"
          />
        </div>
      </div>

      <Separator />

      {/* Fecha y Ubicación */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Fecha y Ubicación</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-start-date" className="text-sm font-medium">
              Fecha de inicio *
            </Label>
            <Input
              id="event-start-date"
              type="date"
              value={formatDateTimeForInput(event.start_date).date}
              onChange={(e) => {
                const currentTime = formatDateTimeForInput(event.start_date).time;
                const newDateTime = `${e.target.value}T${currentTime}`;
                console.log('📅 Start date changed:', { newDateTime });
                handleChange('start_date', newDateTime);
              }}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-start-time" className="text-sm font-medium">
              Hora de inicio *
            </Label>
            <Input
              id="event-start-time"
              type="time"
              value={formatDateTimeForInput(event.start_date).time}
              onChange={(e) => {
                const currentDate = formatDateTimeForInput(event.start_date).date || new Date().toISOString().split('T')[0];
                const newDateTime = `${currentDate}T${e.target.value}`;
                console.log('⏰ Start time changed:', { newDateTime });
                handleChange('start_date', newDateTime);
              }}
              className="text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-end-date" className="text-sm font-medium">
              Fecha de fin (opcional)
            </Label>
            <Input
              id="event-end-date"
              type="date"
              value={formatDateTimeForInput(event.end_date).date}
              onChange={(e) => {
                if (e.target.value) {
                  const currentTime = formatDateTimeForInput(event.end_date).time;
                  const newDateTime = `${e.target.value}T${currentTime}`;
                  console.log('📅 End date changed:', { newDateTime });
                  handleChange('end_date', newDateTime);
                } else {
                  console.log('📅 End date cleared');
                  handleChange('end_date', '');
                }
              }}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-end-time" className="text-sm font-medium">
              Hora de fin (opcional)
            </Label>
            <Input
              id="event-end-time"
              type="time"
              value={formatDateTimeForInput(event.end_date).time}
              onChange={(e) => {
                const currentDate = formatDateTimeForInput(event.end_date).date || 
                                   formatDateTimeForInput(event.start_date).date || 
                                   new Date().toISOString().split('T')[0];
                const newDateTime = `${currentDate}T${e.target.value}`;
                console.log('⏰ End time changed:', { newDateTime });
                handleChange('end_date', newDateTime);
              }}
              disabled={!event.end_date}
              className="text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-location" className="text-sm font-medium">
            Ubicación *
          </Label>
          <Input
            id="event-location"
            placeholder="Ej: Centro de Convenciones, Link de Zoom..."
            value={event.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de ubicación *</Label>
            <Select value={event.location_type} onValueChange={(value) => handleChange('location_type', value)}>
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de evento *</Label>
            <Select value={event.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Selecciona tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conference">Conferencia</SelectItem>
                <SelectItem value="seminar">Seminario</SelectItem>
                <SelectItem value="workshop">Taller</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="career_fair">Feria de Empleo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Personalización Visual */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Personalización Visual</h3>
        </div>
        
        <ColorGradientPicker
          selectedGradient={event.gradient_color || 'gradient-1'}
          onGradientChange={(gradient) => handleChange('gradient_color', gradient)}
        />
        
        <ImageUploadPreview
          image={event.banner_file || null}
          onImageChange={(file) => handleChange('banner_file', file)}
          placeholder="Sube una imagen representativa para tu evento"
        />
      </div>

      <Separator />

      {/* Configuración Adicional */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Configuración Adicional</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-attendees" className="text-sm font-medium">
              Máximo de asistentes
            </Label>
            <Input
              id="event-attendees"
              type="number"
              placeholder="Sin límite"
              value={event.max_attendees || ''}
              onChange={(e) => handleChange('max_attendees', e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-info" className="text-sm font-medium">
              Información de contacto
            </Label>
            <Input
              id="contact-info"
              placeholder="Email, teléfono, etc."
              value={event.contact_info || ''}
              onChange={(e) => handleChange('contact_info', e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="registration-required"
              checked={event.registration_required || false}
              onCheckedChange={(checked) => handleChange('registration_required', checked)}
            />
            <Label htmlFor="registration-required" className="text-sm font-medium">
              Requiere inscripción previa
            </Label>
          </div>

          {event.registration_required && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="registration-deadline" className="text-sm font-medium">
                Fecha límite de inscripción
              </Label>
              <Input
                id="registration-deadline"
                type="datetime-local"
                value={event.registration_deadline || ''}
                onChange={(e) => handleChange('registration_deadline', e.target.value)}
                className="text-base"
              />
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/20">
          <p className="font-medium mb-1">💡 Consejos para tu evento:</p>
          <ul className="space-y-1">
            <li>• Asegúrate de incluir todos los detalles importantes en la descripción</li>
            <li>• Usa una imagen atractiva que represente tu evento</li>
            <li>• Confirma la fecha y hora antes de publicar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}