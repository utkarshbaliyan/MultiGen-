import React, { useState, useEffect } from 'react';
import { TOOLS } from './constants';
import { ToolType, History, HistoryItem } from './types';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import HistoryPanel from './components/HistoryPanel';
import { dbService } from './services/db';

const GUEST_ID = 'guest_user';

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>(ToolType.TEXT_GENERATION);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<History>({});
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load history from DB (Guest Mode)
  useEffect(() => {
    const loadHistory = async () => {
        try {
          const userHistoryFlat = await dbService.getUserHistory(GUEST_ID);
          
          const groupedHistory: History = {};
          
          // Group flat list by toolType
          userHistoryFlat.forEach(item => {
            const toolType = item.toolType;
            
            const historyItem: HistoryItem = {
               id: item.id,
               timestamp: item.timestamp,
               prompt: item.prompt,
               result: item.result
            };

            if (!groupedHistory[toolType]) {
              groupedHistory[toolType] = [];
            }
            groupedHistory[toolType]?.push(historyItem);
          });
          
          // Sort by timestamp descending
          (Object.keys(groupedHistory) as ToolType[]).forEach(key => {
               groupedHistory[key]?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          });

          setHistory(groupedHistory);
        } catch (error) {
          console.error("Failed to load history", error);
        }
    };

    loadHistory();
  }, []);

  const handleSplashContinue = () => {
    setShowSplash(false);
  };

  const addToHistory = async (tool: ToolType, itemData: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...itemData,
      id: new Date().toISOString(),
      timestamp: new Date().toLocaleString(),
    };

    // Optimistic UI Update
    setHistory(prevHistory => ({
      ...prevHistory,
      [tool]: [newItem, ...(prevHistory[tool] || [])],
    }));

    // Save to DB
    try {
      await dbService.addHistoryItem(GUEST_ID, tool, newItem);
    } catch (error) {
      console.error("Failed to save history item to DB", error);
    }
  };

  if (showSplash) {
    return <SplashScreen onContinue={handleSplashContinue} />;
  }

  return (
    <div className="bg-black text-white min-h-screen flex">
        <Sidebar 
          selectedTool={selectedTool} 
          setSelectedTool={setSelectedTool} 
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
        />
        
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{TOOLS.find(tool => tool.id === selectedTool)?.name}</h2>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsHistoryOpen(true)}
                  className="flex items-center space-x-2 p-2 rounded-md border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>History</span>
                </button>
              </div>
            </div>
            {TOOLS.find(tool => tool.id === selectedTool)?.component ? (
              // @ts-ignore - Dynamic component rendering
              React.createElement(TOOLS.find(tool => tool.id === selectedTool)!.component, {
                  addToHistory: (itemData: any) => addToHistory(selectedTool, itemData)
              })
            ) : <div>Select a tool</div>}
          </main>
        </div>

        <HistoryPanel 
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history[selectedTool] || []}
          toolName={TOOLS.find(tool => tool.id === selectedTool)?.name || 'History'}
          toolType={selectedTool}
        />
    </div>
  );
};

export default App;