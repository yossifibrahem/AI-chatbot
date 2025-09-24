// React import not required with new JSX transform
import { Menu, Bot } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onToggleSidebar: () => void;
}

export function ChatHeader({ currentConversation, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-800 bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2.5 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3 flex-1 lg:justify-center">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              {currentConversation?.name || 'AI Assistant'}
            </h1>
            <p className="text-sm text-gray-500">
              Powered by GPT-OSS
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2" />
      </div>
    </div>
  );
}