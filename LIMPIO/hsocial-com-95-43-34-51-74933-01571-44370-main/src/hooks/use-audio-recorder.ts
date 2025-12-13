
import { useState, useEffect } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setAudioChunks([]);
      setMediaRecorder(recorder);
      
      recorder.ondataavailable = (e) => {
        setAudioChunks(chunks => [...chunks, e.data]);
      };
      
      recorder.onstop = () => {
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  };
  
  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        setIsRecording(false);
        resolve(null);
        return;
      }
      
      mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          setIsRecording(false);
          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      mediaRecorder.stop();
    });
  };
  
  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording
  };
}
