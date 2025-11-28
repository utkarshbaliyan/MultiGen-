
import React, { useState } from 'react';
import { generateCode } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';

interface CodeGeneratorProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ addToHistory }) => {
  const [language, setLanguage] = useState('javascript');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!description) return;
    setLoading(true);
    setCode('');
    const generatedCode = await generateCode(language, description);
    setCode(generatedCode);
    addToHistory({ prompt: `Language: ${language}\nDescription: ${description}`, result: generatedCode });
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Describe the functionality, and let AI write the code.</p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., a function to reverse a string"
            className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>
        <GlowingButton onClick={handleSubmit} isLoading={loading} disabled={!description}>
          Generate Code
        </GlowingButton>
      </div>

      {(loading || code) && (
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Generated Code:</h3>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
            </div>
          ) : (
            <div className="relative group">
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800/90 backdrop-blur-sm border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 z-10 shadow-lg"
                title="Copy to clipboard"
              >
                {copied ? (
                  <div className="flex items-center text-green-400">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-bold">Copied!</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </button>
              <pre className="bg-black p-4 rounded-md overflow-x-auto border border-gray-800 text-sm font-mono">
                <code className={`language-${language}`}>{code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;
