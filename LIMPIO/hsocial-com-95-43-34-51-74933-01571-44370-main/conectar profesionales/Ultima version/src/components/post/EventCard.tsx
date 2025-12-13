import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Event } from "@/types/post";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  onMoreInfo?: () => void;
  onRegister?: () => void;
}

const categoryGradients = {
  conference: "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700",
  seminar: "bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700",
  workshop: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700",
  hackathon: "bg-gradient-to-br from-orange-500 via-red-600 to-pink-700",
  webinar: "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700",
  networking: "bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700",
  career_fair: "bg-gradient-to-br from-gray-600 via-slate-700 to-gray-800"
};

export function EventCard({ event, onMoreInfo, onRegister }: EventCardProps) {
  const startDate = new Date(event.start_date);
  const formattedDate = format(startDate, "d MMM yyyy", { locale: es });
  const formattedTime = format(startDate, "HH:mm", { locale: es });
  
  const gradient = categoryGradients[event.category] || categoryGradients.conference;

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradient}`} />
      
      {/* Content */}
      <div className="relative z-10 p-6 text-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
            <p className="text-white/90 text-sm line-clamp-2">{event.description}</p>
          </div>
          {event.banner_url && (
            <div className="ml-4 w-16 h-16 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm">
              <img 
                src={event.banner_url} 
                alt="Event banner" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-white/90">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formattedDate} a las {formattedTime}</span>
          </div>

          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-4 w-4" />
            <span className="text-sm line-clamp-1">{event.location}</span>
          </div>

          {event.max_attendees && (
            <div className="flex items-center gap-2 text-white/90">
              <Users className="h-4 w-4" />
              <span className="text-sm">Hasta {event.max_attendees} personas</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-white/90">
            <Clock className="h-4 w-4" />
            <span className="text-sm capitalize">{event.location_type}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onMoreInfo}
            className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 flex-1"
          >
            Más inf.
          </Button>
          
          {event.registration_required && (
            <Button
              size="sm"
              onClick={onRegister}
              className="bg-white text-black hover:bg-white/90 flex-1"
            >
              Inscribirse
            </Button>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-white capitalize">{event.category}</span>
        </div>
      </div>
    </Card>
  );
}