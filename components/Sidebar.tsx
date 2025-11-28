import React from 'react';
import { TOOLS } from '../constants';
import { ToolType } from '../types';

interface SidebarProps {
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (isExpanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTool, setSelectedTool, isSidebarExpanded, setIsSidebarExpanded }) => {

  const handleSelectTool = (toolId: ToolType) => {
    setSelectedTool(toolId);
  };

  return (
    <aside className={`h-screen bg-black border-r border-gray-900 flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-64' : 'w-20'}`}>
      <div className={`p-4 flex items-center mb-4 ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}>
        {isSidebarExpanded ? (
          <h1 className="text-3xl font-bold text-white tracking-wider">
            Multi<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Gen</span>
          </h1>
        ) : (
          <h1 className="text-3xl font-bold text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">M</span>G
          </h1>
        )}
      </div>
      
      <nav className="flex-1 space-y-2">
        <ul>
          {TOOLS.map((tool) => (
            <li key={tool.id} className="px-2">
              <button
                onClick={() => handleSelectTool(tool.id)}
                title={tool.name}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out
                  ${isSidebarExpanded ? '' : 'justify-center'}
                  ${selectedTool === tool.id 
                    ? 'bg-gray-800 text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white hover:scale-105'
                  }`}
              >
                <tool.icon className="w-6 h-6 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm font-medium ml-3 whitespace-nowrap">{tool.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-2 border-t border-gray-900">
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-900 hover:text-white"
        >
          {isSidebarExpanded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium ml-3 whitespace-nowrap">Collapse</span>
            </>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;