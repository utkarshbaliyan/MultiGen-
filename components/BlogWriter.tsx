
import React, { useState } from 'react';
import { generateBlog } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';
import MarkdownRenderer from './common/MarkdownRenderer';

interface BlogWriterProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const BlogWriter: React.FC<BlogWriterProps> = ({ addToHistory }) => {
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!topic || !title) return;
    setLoading(true);
    setResult('');
    const blogContent = await generateBlog(topic, title);
    setResult(blogContent);
    addToHistory({ prompt: `Title: ${title}\nTopic: ${topic}`, result: blogContent });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Generate high-quality, long-form articles in minutes.</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog Post Title"
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe the blog topic and key points to cover..."
          className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        <GlowingButton onClick={handleSubmit} isLoading={loading} disabled={!topic || !title}>
          Write Blog
        </GlowingButton>
      </div>

       {(loading || result) && (
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Generated Blog Post:</h3>
          {loading ? (
             <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
             </div>
          ) : (
            <MarkdownRenderer content={result} />
          )}
        </div>
      )}
    </div>
  );
};

export default BlogWriter;
