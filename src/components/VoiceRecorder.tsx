'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Volume2 } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string) => void;
  onClearAudio: () => void;
}

export default function VoiceRecorder({ onAudioReady, onClearAudio }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioUrl(base64Audio);
          onAudioReady(base64Audio);
        };

        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert('Izin mikrofon diperlukan untuk merekam Voice Note.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleClear = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    onClearAudio();
  };

  return (
    <div className="w-full bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-pink-400 uppercase tracking-wider">
        <Volume2 className="w-4 h-4 animate-pulse" /> Voice Note (Maks. 30 detik)
      </div>

      {!audioUrl ? (
        <div className="flex flex-col items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95"
            >
              <Mic className="w-5 h-5" /> Merekam Voice Note
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-rose-400 font-bold animate-pulse">
                🔴 00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime}
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-full shadow-lg transition-all"
              >
                <Square className="w-4 h-4 fill-white" /> Stop
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-pink-500/30 w-full justify-between">
          <audio src={audioUrl} controls className="h-9 w-full max-w-[240px]" />
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
            title="Hapus Rekaman"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
