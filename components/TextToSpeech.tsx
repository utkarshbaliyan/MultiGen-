
import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';

interface TextToSpeechProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const TextToSpeech: React.FC<TextToSpeechProps> = ({ addToHistory }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!text) return;
    setLoading(true);
    setAudioUrl(null);
    setError('');
    
    try {
        const url = await generateSpeech(text, voice);
        setAudioUrl(url);
        addToHistory({ prompt: `Text: ${text.substring(0, 50)}... (Voice: ${voice})`, result: "Audio Generated" }); // We don't store the blob URL in DB as it's temporary
    } catch (e) {
        setError("Failed to generate speech. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `speech-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Convert written text into lifelike spoken audio.</p>
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Voice</label>
            <div className="flex space-x-4">
                {VOICES.map(v => (
                    <button
                        key={v}
                        onClick={() => setVoice(v)}
                        className={`px-4 py-2 rounded-full border transition-all ${
                            voice === v 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-400 hover:text-white'
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full h-40 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        
        <GlowingButton onClick={handleSubmit} isLoading={loading} disabled={!text}>
          Generate Speech
        </GlowingButton>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {audioUrl && (
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Result:</h3>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 3.464a5 5 0 00-6.072 0L4.293 8.172A1 1 0 004 8.828v6.344a1 1 0 00.293.656l5.171 4.708a5 5 0 006.072 0l4.171-4.708A1 1 0 0020 15.172V8.828a1 1 0 00-.293-.656l-4.171-4.708z" />
                 </svg>
             </div>
             <audio controls src={audioUrl} className="w-full max-w-md mb-6" />
             
             <button 
                onClick={handleDownload}
                className="px-6 py-2 bg-gray-800 hover:bg-purple-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center border border-gray-700 hover:border-purple-500 shadow-lg hover:shadow-purple-500/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Audio
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
