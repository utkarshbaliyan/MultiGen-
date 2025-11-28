
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';
import Spinner from './common/Spinner';

interface ImageGeneratorProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const STYLES = [
  { id: 'none', label: 'No Style' },
  { id: 'Photorealistic', label: 'Photorealistic' },
  { id: 'Cartoon', label: 'Cartoon' },
  { id: '3D Render', label: '3D Render' },
  { id: 'Sketch', label: 'Sketch' },
  { id: 'Anime', label: 'Anime' },
  { id: 'Oil Painting', label: 'Oil Painting' },
  { id: 'Cyberpunk', label: 'Cyberpunk' },
  { id: 'Watercolor', label: 'Watercolor' },
  { id: 'Pixel Art', label: 'Pixel Art' },
  { id: 'Fantasy', label: 'Fantasy' },
  { id: 'Sci-Fi', label: 'Sci-Fi' },
];

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ addToHistory }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('none');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt) return;
    setLoading(true);
    setImageUrl('');
    setError('');
    
    // Pass the style to the service
    const result = await generateImage(prompt, style);
    
    if (result.startsWith('data:image')) {
      setImageUrl(result);
      // Save to history with style context
      const historyPrompt = style !== 'none' ? `${prompt} (Style: ${style})` : prompt;
      addToHistory({ prompt: historyPrompt, result });
    } else {
      setError(result);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Describe an image and watch it come to life.</p>
      </div>

      <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic city at sunset with flying cars"
              className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
            />
        </div>
        
        <div>
             <label className="block text-sm font-medium text-gray-400 mb-3">Image Style</label>
             <div className="flex flex-wrap gap-3">
                 {STYLES.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                            style === s.id
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg scale-105'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white hover:bg-gray-700'
                        }`}
                    >
                        {s.label}
                    </button>
                 ))}
             </div>
        </div>

        <GlowingButton onClick={handleSubmit} isLoading={loading} disabled={!prompt}>
          Generate Image
        </GlowingButton>
      </div>

      {loading && <Spinner />}
      
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 animate-fade-in">
             <p className="font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Generation Failed
             </p>
             <p className="text-sm mt-1 ml-7">{error}</p>
        </div>
      )}
      
      {imageUrl && (
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-fade-in flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 self-start">Generated Image:</h3>
          <div className="relative group w-full max-w-md">
             <img src={imageUrl} alt="Generated" className="rounded-md w-full shadow-lg border border-gray-800" />
          </div>
          
          <button 
            onClick={handleDownload}
            className="mt-6 px-6 py-2 bg-gray-800 hover:bg-purple-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center border border-gray-700 hover:border-purple-500 shadow-lg hover:shadow-purple-500/20"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
