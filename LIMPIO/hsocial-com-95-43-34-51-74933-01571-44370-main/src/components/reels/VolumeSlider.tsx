import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VolumeSliderProps {
  volume: number;
  isMuted: boolean;
  show: boolean;
  onChange: (value: number) => void;
  onMuteToggle: () => void;
}

export function VolumeSlider({ volume, isMuted, show, onChange, onMuteToggle }: VolumeSliderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-full px-6 py-4 flex items-center gap-4 shadow-lg z-50"
        >
          <button
            onClick={onMuteToggle}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          
          <div className="w-32">
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(value) => onChange(value[0])}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
          
          <span className="text-white text-sm font-medium min-w-[3ch] text-right">
            {isMuted ? 0 : volume}%
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
