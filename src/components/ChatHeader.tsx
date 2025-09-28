import { Menu, Bot, Settings, Download } from 'lucide-react';
import { Conversation } from '../types';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { ExportModal } from './ExportModal';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onToggleSidebar: () => void;
}

export function ChatHeader({ currentConversation, onToggleSidebar }: ChatHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3 flex-1 lg:justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-100">
              {currentConversation?.name || 'AI Assistant'}
            </h1>
            <p className="text-sm text-gray-400">
              Powered by GPT-OSS
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentConversation && (
              <button
                onClick={() => setShowExport(true)}
                className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800"
                title="Export conversation"
              >
                <Download size={18} />
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2" />
      </div>
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      <ExportModal 
        isOpen={showExport} 
        onClose={() => setShowExport(false)}
        conversation={currentConversation}
      />
    </>
  );
}