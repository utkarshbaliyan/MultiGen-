
import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';
import MarkdownRenderer from './common/MarkdownRenderer';

interface SpeechToTextProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ addToHistory }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Let the browser use its default supported mime type (usually audio/webm or audio/mp4)
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Fix: Use the recorder's mimeType instead of hardcoding audio/wav
        // This ensures we don't send WebM bytes labeled as WAV
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        await handleTranscription(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscription('');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setTranscription("Error: Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        // Ensure we send a clean mime type to the API (e.g., 'audio/webm' instead of 'audio/webm;codecs=opus')
        const cleanMimeType = audioBlob.type.split(';')[0];
        
        const result = await transcribeAudio(base64String, cleanMimeType);
        setTranscription(result);
        addToHistory({ prompt: "Audio Transcription", result: result });
        setLoading(false);
      };
    } catch (error) {
      console.error("Processing error", error);
      setTranscription("Error processing audio.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Record your voice and let AI transcribe it accurately.</p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 py-10">
        <div className={`relative w-32 h-32 flex items-center justify-center rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-gray-800'}`}>
            {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-ping"></div>
            )}
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`z-10 w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 focus:outline-none ${
                    isRecording ? 'bg-red-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? (
                   <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isRecording ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        )}
                    </svg>
                )}
            </button>
        </div>
        
        <p className="text-lg font-medium text-gray-300">
            {loading ? "Transcribing..." : isRecording ? "Recording... Click to Stop" : "Click microphone to start recording"}
        </p>
      </div>

      {(transcription) && (
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Transcription:</h3>
          <MarkdownRenderer content={transcription} />
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
