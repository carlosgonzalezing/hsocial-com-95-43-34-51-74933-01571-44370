import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Heart, Coffee, Book, Music, Car, Plane, Camera, MapPin, Search, Gamepad2, Utensils, GraduationCap, Dumbbell, Home, Users, Briefcase } from "lucide-react";

const moods = [
  { id: 'happy', label: 'Feliz', emoji: '😊', icon: Smile, color: 'text-yellow-500' },
  { id: 'love', label: 'Enamorado', emoji: '❤️', icon: Heart, color: 'text-red-500' },
  { id: 'excited', label: 'Emocionado', emoji: '🤩', icon: Smile, color: 'text-purple-500' },
  { id: 'grateful', label: 'Agradecido', emoji: '🙏', icon: Heart, color: 'text-green-500' },
  { id: 'relaxed', label: 'Relajado', emoji: '😌', icon: Coffee, color: 'text-blue-500' },
  { id: 'motivated', label: 'Motivado', emoji: '💪', icon: Book, color: 'text-orange-500' },
  { id: 'creative', label: 'Creativo', emoji: '🎨', icon: Camera, color: 'text-pink-500' },
  { id: 'focused', label: 'Concentrado', emoji: '🎯', icon: GraduationCap, color: 'text-indigo-500' },
  { id: 'tired', label: 'Cansado', emoji: '😴', icon: Home, color: 'text-gray-500' },
  { id: 'stressed', label: 'Estresado', emoji: '😰', icon: Briefcase, color: 'text-red-400' },
];

const activities = [
  { id: 'studying', label: 'Estudiando', emoji: '📚', icon: Book, color: 'text-blue-600' },
  { id: 'listening', label: 'Escuchando música', emoji: '🎵', icon: Music, color: 'text-purple-600' },
  { id: 'traveling', label: 'Viajando', emoji: '✈️', icon: Plane, color: 'text-sky-500' },
  { id: 'driving', label: 'Conduciendo', emoji: '🚗', icon: Car, color: 'text-gray-600' },
  { id: 'photography', label: 'Fotografiando', emoji: '📸', icon: Camera, color: 'text-pink-500' },
  { id: 'walking', label: 'Caminando', emoji: '🚶', icon: MapPin, color: 'text-green-600' },
  { id: 'eating', label: 'Comiendo', emoji: '🍽️', icon: Utensils, color: 'text-yellow-600' },
  { id: 'exercising', label: 'Ejercitándome', emoji: '🏋️', icon: Dumbbell, color: 'text-red-600' },
  { id: 'gaming', label: 'Jugando', emoji: '🎮', icon: Gamepad2, color: 'text-blue-500' },
  { id: 'working', label: 'Trabajando', emoji: '💼', icon: Briefcase, color: 'text-gray-700' },
  { id: 'socializing', label: 'Socializando', emoji: '👥', icon: Users, color: 'text-indigo-600' },
  { id: 'relaxing', label: 'Descansando', emoji: '🛋️', icon: Home, color: 'text-blue-400' },
];

interface MoodPickerProps {
  onSelect: (type: 'mood' | 'activity', item: any) => void;
  children: React.ReactNode;
}

export function MoodPicker({ onSelect, children }: MoodPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'moods' | 'activities'>('moods');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (type: 'mood' | 'activity', item: any) => {
    onSelect(type, item);
    setOpen(false);
    setSearchQuery('');
  };

  // Filter items based on search query
  const filteredMoods = moods.filter(mood => 
    mood.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredActivities = activities.filter(activity => 
    activity.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 z-[100] bg-background border-border shadow-lg" align="start">
        <div className="border-b">
          <div className="flex">
            <Button
              variant={activeTab === 'moods' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('moods')}
              className="flex-1 rounded-none"
            >
              😊 Estados de ánimo
            </Button>
            <Button
              variant={activeTab === 'activities' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('activities')}
              className="flex-1 rounded-none"
            >
              🎯 Actividades
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${activeTab === 'moods' ? 'estados de ánimo' : 'actividades'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </div>
        
        <div className="p-2 max-h-60 overflow-y-auto">
          {activeTab === 'moods' ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredMoods.length > 0 ? (
                filteredMoods.map((mood) => (
                  <Button
                    key={mood.id}
                    variant="ghost"
                    onClick={() => handleSelect('mood', mood)}
                    className="justify-start h-auto p-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-lg mr-3">{mood.emoji}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{mood.label}</span>
                      <span className="text-xs text-muted-foreground">Estado de ánimo</span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <Smile className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron estados de ánimo</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <Button
                    key={activity.id}
                    variant="ghost"
                    onClick={() => handleSelect('activity', activity)}
                    className="justify-start h-auto p-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-lg mr-3">{activity.emoji}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{activity.label}</span>
                      <span className="text-xs text-muted-foreground">Actividad</span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron actividades</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick suggestions at bottom */}
        <div className="border-t p-2 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Populares:</p>
          <div className="flex gap-1 flex-wrap">
            {(activeTab === 'moods' ? moods.slice(0, 4) : activities.slice(0, 4)).map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                onClick={() => handleSelect(activeTab === 'moods' ? 'mood' : 'activity', item)}
                className="text-xs h-6 px-2"
              >
                {item.emoji} {item.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}