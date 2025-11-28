
import React, { useState, useEffect, useRef } from 'react';
import { createChatSession, sendChatMessage } from '../services/geminiService';
import MarkdownRenderer from './common/MarkdownRenderer';
import { Chat } from '@google/genai';

interface TextGeneratorProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python script to parse a CSV file",
  "Plan a 3-day itinerary for a trip to Paris",
  "Draft a professional email asking for a raise",
  "What are the health benefits of meditation?",
  "Debug this React useEffect code snippet"
];

const TextGenerator: React.FC<TextGeneratorProps> = ({ addToHistory }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use a ref to store the chat session so it persists across renders without triggering re-effects
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session once on mount
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
    } catch (e) {
      console.error("Failed to initialize chat", e);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || !chatSessionRef.current) return;

    // Clear input if it came from the text area
    if (!textOverride) {
        setInputText('');
    }
    
    // Add User Message
    const userMsgObj: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsgObj]);
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(chatSessionRef.current, textToSend);
      
      const aiMsgObj: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsgObj]);

      // Add the interaction to the global history panel (saving the turn)
      addToHistory({ prompt: textToSend, result: responseText });

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 mb-4">
        
        {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                     <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-8">How can I help you today?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl px-4">
                    {SUGGESTIONS.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion)}
                            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-purple-500 transition-all duration-200 text-left group"
                        >
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{suggestion}</span>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <>
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                        msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
                    }`}
                    >
                    {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                        <MarkdownRenderer content={msg.text} />
                    )}
                    </div>
                </div>
                ))}
                
                {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-none p-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 flex items-end shadow-lg relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-white p-3 max-h-32 resize-none custom-scrollbar"
          rows={1}
          style={{ minHeight: '44px' }}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors ml-2 mb-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TextGenerator;
