// React import not required with new JSX transform
import { Menu, Bot } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onToggleSidebar: () => void;
}

export function ChatHeader({ currentConversation, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl shadow-lg">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2.5 text-slate-400 hover:text-slate-200 transition-all duration-200 rounded-xl hover:bg-slate-800/60 active:scale-95"
        >
          <Menu size={22} />
        </button>
        
        <div className="flex items-center gap-3 flex-1 lg:justify-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 flex items-center justify-center shadow-lg">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {currentConversation?.name || 'AI Assistant'}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Powered by GPT-OSS
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2" />
      </div>
    </div>
  );
}