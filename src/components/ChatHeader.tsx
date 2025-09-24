// React import not required with new JSX transform
import { Menu, Bot } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onToggleSidebar: () => void;
}

export function ChatHeader({ currentConversation, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="border-b border-warm-primary bg-warm-secondary">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-warm-muted hover:text-warm-primary smooth-transition rounded-lg hover:bg-warm-tertiary focus-ring"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3 flex-1 lg:justify-center">
          <div className="w-8 h-8 rounded-full bg-orange-accent flex items-center justify-center">
            <Bot size={18} className="text-warm-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-warm-primary">
              {currentConversation?.name || 'AI Assistant'}
            </h1>
            <p className="text-sm text-warm-muted">
              Powered by GPT-OSS
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2" />
      </div>
    </div>
  );
}