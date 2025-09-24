// React import not required with new JSX transform
import { Menu, Bot } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onToggleSidebar: () => void;
}

export function ChatHeader({ currentConversation, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3 flex-1 lg:justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-100">
              {currentConversation?.name || 'AI Assistant'}
            </h1>
            <p className="text-sm text-gray-400">
              Powered by Claude Sonnet 4
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2" />
      </div>
    </div>
  );
}