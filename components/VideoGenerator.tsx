
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';

interface VideoGeneratorProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const loadingMessages = [
  "Warming up the director's chair...",
  "AI is storyboarding your vision...",
  "Rendering scenes, this may take a few minutes...",
  "Compositing the final shots...",
  "Almost there, adding the final polish...",
];

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ addToHistory }) => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const messageIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3000);
    } else {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }
    
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [loading]);

  const handleSubmit = async () => {
    if (!prompt) return;
    setLoading(true);
    setVideoUrl('');
    setError('');
    setLoadingMessage(loadingMessages[0]);

    const result = await generateVideo(prompt);
    
    if (result.startsWith('https://')) {
      setVideoUrl(result);
      addToHistory({ prompt, result });
    } else {
      setError(result);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Describe a video and watch it come to life. Generation can take a few minutes.</p>
        <p className="text-xs text-gray-500 mt-1">Note: This feature requires a paid Google Cloud Project with the Veo model enabled.</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cinematic shot of a majestic lion walking on a beach"
          className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        <GlowingButton onClick={handleSubmit} isLoading={loading} disabled={!prompt}>
          Generate Video
        </GlowingButton>
      </div>

      {loading && (
        <div className="text-center p-8">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute border-4 border-gray-800 rounded-full w-full h-full"></div>
              <div className="absolute border-4 border-t-purple-500 rounded-full w-full h-full animate-spin"></div>
            </div>
            <p className="text-gray-300 transition-opacity duration-500">{loadingMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
            <p className="font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Generation Failed
            </p>
            <p className="mt-1 text-sm">{error}</p>
        </div>
      )}
      
      {videoUrl && (
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <h3 className="text-lg font-semibold mb-2">Generated Video:</h3>
          <video src={videoUrl} controls autoPlay loop className="rounded-md w-full max-w-2xl mx-auto" />
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
