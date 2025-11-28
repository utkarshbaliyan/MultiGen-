
import React, { useState } from 'react';
import { reviewResume } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';
import MarkdownRenderer from './common/MarkdownRenderer';

interface ResumeReviewerProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const ResumeReviewer: React.FC<ResumeReviewerProps> = ({ addToHistory }) => {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get raw base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!resumeText && !file) return;
    setLoading(true);
    setFeedback('');
    
    try {
        let input: string | { data: string; mimeType: string };
        let context = '';

        if (file) {
            const base64 = await fileToBase64(file);
            input = { data: base64, mimeType: file.type };
            // If file exists, resumeText acts as additional instructions
            if (resumeText) context = resumeText;
        } else {
            input = resumeText;
        }

        const reviewFeedback = await reviewResume(input, context);
        setFeedback(reviewFeedback);
        
        // Construct a meaningful prompt for history
        const historyPrompt = file 
            ? `Reviewed file: ${file.name}${context ? ` (Context: ${context})` : ''}` 
            : resumeText.length > 50 ? resumeText.substring(0, 50) + '...' : resumeText;

        addToHistory({ prompt: historyPrompt, result: reviewFeedback });
    } catch (e) {
        console.error(e);
        setFeedback("An error occurred while processing your resume.");
    }
    
    setLoading(false);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Upload your resume (PDF, Image) or paste the text below to get specific, actionable feedback.</p>
      </div>

      <div className="space-y-4">
        {/* File Upload Area */}
        <div className={`relative p-6 border-2 border-dashed rounded-lg transition-colors text-center cursor-pointer group
            ${file ? 'border-purple-500 bg-purple-900/10' : 'border-gray-700 bg-gray-900 hover:border-purple-500 hover:bg-gray-800'}`}
        >
             <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {file ? (
                <div className="flex items-center justify-center space-x-3 text-purple-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="font-medium text-lg">{file.name}</span>
                    <button 
                        onClick={removeFile}
                        className="p-1 rounded-full bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-200 transition-colors z-20 relative"
                        title="Remove file"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center text-gray-500 group-hover:text-purple-400 transition-colors">
                    <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm opacity-70 mt-1">PDF, PNG, JPG supported</p>
                </div>
            )}
        </div>

        {/* Text Area */}
        <div className="relative">
             <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                {file ? 'Add specific questions or context (Optional)' : 'Or paste your resume content directly'}
             </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder={file ? "e.g., Focus on my leadership experience..." : "Paste your resume content here..."}
              className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
        </div>

        <GlowingButton onClick={handleSubmit} isLoading={loading} disabled={!resumeText && !file}>
          Review Resume
        </GlowingButton>
      </div>

      {(loading || feedback) && (
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Feedback:</h3>
          {loading ? (
             <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
             </div>
          ) : (
            <MarkdownRenderer content={feedback} />
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeReviewer;
