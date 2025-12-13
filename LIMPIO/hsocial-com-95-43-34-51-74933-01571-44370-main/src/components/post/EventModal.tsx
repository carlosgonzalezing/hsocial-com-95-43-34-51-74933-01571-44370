import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Mail, UserCheck } from "lucide-react";
import { Event } from "@/types/post";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: () => void;
}

const categoryColors = {
  conference: "bg-blue-500",
  seminar: "bg-purple-500", 
  workshop: "bg-green-500",
  hackathon: "bg-orange-500",
  webinar: "bg-cyan-500",
  networking: "bg-pink-500",
  career_fair: "bg-gray-500"
};

export function EventModal({ event, isOpen, onClose, onRegister }: EventModalProps) {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  
  const formattedStartDate = format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedStartTime = format(startDate, "HH:mm", { locale: es });
  const formattedEndTime = endDate ? format(endDate, "HH:mm", { locale: es }) : null;

  const categoryColor = categoryColors[event.category] || categoryColors.conference;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-bold text-left pr-4">
              {event.title}
            </DialogTitle>
            <Badge className={`${categoryColor} text-white`}>
              {event.category}
            </Badge>
          </div>
          <DialogDescription className="text-left">
            Detalles completos del evento: {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Banner */}
          {event.banner_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={event.banner_url} 
                alt="Event banner" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Fecha</p>
                  <p className="text-sm text-muted-foreground capitalize">{formattedStartDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Horario</p>
                  <p className="text-sm text-muted-foreground">
                    {formattedStartTime}{formattedEndTime ? ` - ${formattedEndTime}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {event.location_type}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {event.max_attendees && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Capacidad</p>
                    <p className="text-sm text-muted-foreground">Hasta {event.max_attendees} personas</p>
                  </div>
                </div>
              )}

              {event.registration_required && (
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Inscripción</p>
                    <p className="text-sm text-muted-foreground">Requerida</p>
                    {event.registration_deadline && (
                      <p className="text-xs text-muted-foreground">
                        Hasta: {format(new Date(event.registration_deadline), "d MMM yyyy", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {event.contact_info && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Contacto</p>
                    <p className="text-sm text-muted-foreground">{event.contact_info}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cerrar
            </Button>
            {event.registration_required && (
              <Button onClick={onRegister} className="flex-1">
                Inscribirse al evento
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}