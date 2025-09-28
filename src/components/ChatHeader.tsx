// React import not required with new JSX transform
import { Menu, MessageSquare } from 'lucide-react';
import { Conversation } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onToggleSidebar: () => void;
}

export function ChatHeader({ currentConversation, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="border-b border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3 flex-1 lg:justify-center">
          <div className="w-10 h-10 rounded-full bg-amber-600 dark:bg-amber-700 flex items-center justify-center shadow-sm">
            <MessageSquare size={20} className="text-cream-50" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800 dark:text-cream-100">
              {currentConversation?.name || 'AI Assistant'}
            </h1>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Powered by GPT-OSS
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}