
import React, { useState } from 'react';
import { removeBackground } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';
import Spinner from './common/Spinner';

interface BackgroundRemoverProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ addToHistory }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = error => reject(error);
      });
  };

  const handleSubmit = async () => {
    if (!imageFile || !originalImage) {
        setError("Please select an image file first.");
        return;
    };
    setLoading(true);
    setError(null);
    setResultImage(null);
    
    try {
        const base64Image = await fileToBase64(imageFile);
        const processedImage = await removeBackground(base64Image, imageFile.type);
        if (processedImage.startsWith('data:image')) {
          setResultImage(processedImage);
          addToHistory({ prompt: originalImage, result: processedImage });
        } else {
          setError(processedImage);
        }
    } catch (e) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'background-removed.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Upload an image to automatically remove its background.</p>
      </div>

      <div className="p-4 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-700
            hover:file:bg-purple-100"
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
        
      {originalImage && !loading && (
          <GlowingButton onClick={handleSubmit} isLoading={loading} disabled={!imageFile}>
            {resultImage ? 'Generate Again' : 'Remove Background'}
          </GlowingButton>
      )}

      {loading && <Spinner />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {originalImage && (
          <div className="p-2 border border-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-center">Original</h3>
            <img src={originalImage} alt="Original" className="rounded-md max-w-full mx-auto" />
          </div>
        )}
        {resultImage && (
          <div className="p-2 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-center">Result</h3>
            <div className="bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZGBgEGHAD97gk2YwIAxJ/w9Wv0A0IwMjI+OUUQMGwGg4gNESBvj9AAMgHwEArQaxk20eXgAAAABJRU5ErkJggg==')] bg-repeat rounded-md mb-4 overflow-hidden">
                <img src={resultImage} alt="Background removed" className="max-w-full mx-auto block" />
            </div>
            <button 
                onClick={handleDownload}
                className="mt-auto w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundRemover;
