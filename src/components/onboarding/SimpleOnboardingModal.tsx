import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Users, Lightbulb, X } from "lucide-react";

interface SimpleOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleOnboardingModal({ isOpen, onClose }: SimpleOnboardingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <DialogTitle>¡Bienvenido a H Social!</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left space-y-4">
            <p>La red social universitaria donde conectas, colaboras y creces académicamente.</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm">Conecta con estudiantes de tu carrera</span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="text-sm">Comparte ideas y encuentra colaboradores</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Omitir
          </Button>
          <Button onClick={onClose}>
            ¡Empezar!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}