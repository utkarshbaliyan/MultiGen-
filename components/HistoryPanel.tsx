
import React, { useState } from 'react';
import { HistoryItem, ToolType } from '../types';
import MarkdownRenderer from './common/MarkdownRenderer';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  toolName: string;
  toolType: ToolType;
}

const HistoryItemDetail: React.FC<{ item: HistoryItem }> = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    
    const isImageInput = item.prompt.startsWith('data:image');
    
    return (
        <li 
            className="bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors overflow-hidden"
        >
            <div 
                className="p-3 cursor-pointer flex justify-between items-start"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {isImageInput ? 'Image Input' : item.prompt}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                </div>
                <button className="ml-2 text-gray-400">
                    {expanded ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    ) : (
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                </button>
            </div>
            
            {expanded && (
                <div className="p-3 border-t border-gray-700 bg-gray-900/50 text-sm text-gray-300 overflow-x-auto">
                    {/* Render result based on content type */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        <MarkdownRenderer content={item.result} />
                    </div>
                </div>
            )}
        </li>
    );
};

const renderHistoryContent = (toolType: ToolType, history: HistoryItem[]) => {
    if (history.length === 0) {
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No history yet.</p>
          </div>
        );
    }
    
    switch (toolType) {
        case ToolType.IMAGE_GENERATOR:
        case ToolType.BACKGROUND_REMOVER:
            return (
                <div className="grid grid-cols-2 gap-2">
                  {history.map(item => (
                    <div 
                      key={item.id}
                      className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                    >
                      <img 
                        src={item.result} 
                        alt={item.prompt.startsWith('data:') ? 'Generated Image' : item.prompt} 
                        className="aspect-square w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                        <p className="text-white text-xs line-clamp-3">
                            {item.prompt.startsWith('data:') ? 'Image processed' : item.prompt}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
            );
        
        case ToolType.VIDEO_GENERATION:
             return (
                <div className="space-y-3">
                  {history.map(item => (
                    <div 
                      key={item.id}
                      className="group cursor-pointer overflow-hidden rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                    >
                      <video 
                        src={item.result}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="w-full h-auto bg-black"
                      />
                      <div className="p-2 bg-gray-800">
                        <p className="text-white text-xs line-clamp-2">{item.prompt}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
            );

        default:
            return (
              <ul className="space-y-3">
                {history.map(item => (
                  <HistoryItemDetail key={item.id} item={item} />
                ))}
              </ul>
            );
    }
};


const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, toolName, toolType }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      {/* Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900/95 backdrop-blur-md border-l border-gray-800 shadow-2xl shadow-purple-500/10
          transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-bold">
              {toolName} History
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {renderHistoryContent(toolType, history)}
          </div>
        </div>
      </aside>
    </>
  );
};

export default HistoryPanel;
