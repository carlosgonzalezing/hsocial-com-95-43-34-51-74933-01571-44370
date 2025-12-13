
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, AudioWaveform } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  className?: string;
}

export function AudioRecorder({ onRecordingComplete, className }: AudioRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isRecording, recordingDuration, startRecording, stopRecording } = useAudioRecorder();

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar la grabación de audio",
      });
    }
  };

  const handleStopRecording = async () => {
    setIsProcessing(true);
    try {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        onRecordingComplete(audioBlob);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar la grabación de audio",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRecording ? (
        <>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleStopRecording}
            disabled={isProcessing}
            className="h-10 w-10 rounded-full"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm font-medium text-destructive">
            {formatTime(recordingDuration)}
          </span>
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartRecording}
          className="h-10 w-10 text-gray-500"
          title="Grabar audio"
        >
          <AudioWaveform className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
