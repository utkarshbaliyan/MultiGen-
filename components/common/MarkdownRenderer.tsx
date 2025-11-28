
import React from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const getMarkdownText = () => {
    const rawMarkup = marked.parse(content);
    return { __html: rawMarkup };
  };

  return (
    <div 
      className="prose prose-invert max-w-none
      
      /* Headings */
      prose-headings:font-bold prose-headings:text-purple-400
      prose-h1:!text-4xl prose-h1:!mb-8 prose-h1:!pb-6 prose-h1:border-b prose-h1:border-gray-800
      prose-h2:!text-3xl prose-h2:!mt-16 prose-h2:!mb-8 prose-h2:text-white
      prose-h3:!text-xl prose-h3:!mt-10 prose-h3:!mb-4 prose-h3:text-purple-300
      
      /* Paragraphs and text */
      prose-p:text-gray-300 prose-p:!leading-8 prose-p:!my-6 prose-p:!text-lg
      prose-strong:text-purple-300 prose-strong:font-extrabold
      
      /* Lists */
      prose-ul:!my-6 prose-ul:list-disc prose-ul:!pl-8 prose-ul:text-gray-300
      prose-ol:!my-6 prose-ol:list-decimal prose-ol:!pl-8 prose-ol:text-gray-300
      prose-li:!my-3 prose-li:marker:text-gray-500
      
      /* Code */
      prose-code:text-pink-400 prose-code:bg-gray-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
      prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 prose-pre:p-6 prose-pre:rounded-xl prose-pre:!my-8
      
      /* Misc */
      prose-hr:border-gray-800 prose-hr:!my-10
      prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-gray-900/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:!my-8
      "
      dangerouslySetInnerHTML={getMarkdownText()} 
    />
  );
};

export default MarkdownRenderer;