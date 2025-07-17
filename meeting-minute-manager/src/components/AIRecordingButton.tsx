
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Square, Play, Loader2 } from 'lucide-react';

interface AIRecordingButtonProps {
  onTranscriptionComplete: (transcription: {
    topics: string[];
    decisions: string[];
    tasks: string[];
    title?: string;
  }) => void;
}

const AIRecordingButton: React.FC<AIRecordingButtonProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Grabación iniciada",
        description: "Hable claramente sobre los temas de la reunión",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast({
        title: "Grabación finalizada",
        description: "Procesando audio con IA...",
      });
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    
    try {
      // Simular procesamiento de IA (aquí integrarías con un servicio real como OpenAI Whisper)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Datos simulados de transcripción y análisis
      const mockTranscription = {
        title: "Reunión de Planificación - " + new Date().toLocaleDateString(),
        topics: [
          "Revisión del progreso del proyecto actual",
          "Discusión sobre nuevos requerimientos del cliente",
          "Análisis de recursos disponibles para el próximo sprint"
        ],
        decisions: [
          "Se aprobó la extensión del plazo en 2 semanas",
          "Se asignará un desarrollador adicional al equipo frontend",
          "Se implementará la nueva funcionalidad solicitada por el cliente"
        ],
        tasks: [
          "Actualizar la documentación técnica - Fecha límite: próxima semana",
          "Coordinar reunión con el cliente para validar requerimientos",
          "Preparar ambiente de testing para las nuevas funcionalidades"
        ]
      };

      onTranscriptionComplete(mockTranscription);
      setAudioBlob(null);
      setRecordingTime(0);

      toast({
        title: "¡Procesamiento completado!",
        description: "La minuta ha sido generada automáticamente",
      });
    } catch (error) {
      toast({
        title: "Error en procesamiento",
        description: "No se pudo procesar el audio. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Mic className="h-5 w-5 text-blue-600" />
          <span>Grabación con IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Grabe la reunión y la IA generará automáticamente los temas, decisiones y tareas pendientes.
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!isRecording && !audioBlob && (
              <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                <Mic className="h-4 w-4 mr-2" />
                Iniciar Grabación
              </Button>
            )}

            {isRecording && (
              <>
                <Button onClick={stopRecording} variant="outline" className="border-red-500 text-red-600">
                  <Square className="h-4 w-4 mr-2" />
                  Detener
                </Button>
                <Badge variant="destructive" className="animate-pulse">
                  <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                  REC {formatTime(recordingTime)}
                </Badge>
              </>
            )}

            {audioBlob && !isProcessing && (
              <Button onClick={processAudio} className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Procesar con IA
              </Button>
            )}

            {isProcessing && (
              <Button disabled className="bg-blue-600">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </Button>
            )}
          </div>

          {audioBlob && (
            <Badge variant="outline">
              Grabación lista ({formatTime(recordingTime)})
            </Badge>
          )}
        </div>

        {isProcessing && (
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              ⏳ La IA está analizando el audio y generando la minuta automáticamente...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecordingButton;
