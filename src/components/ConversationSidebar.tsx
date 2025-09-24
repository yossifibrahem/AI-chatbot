import React from 'react';
import { Plus, MessageCircle, Trash2, X } from 'lucide-react';
import { Conversation } from '../types';
import clsx from 'clsx';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  isOpen,
  onClose,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation
}: ConversationSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full w-80 bg-cream-100 dark:bg-stone-800 border-r border-amber-200 dark:border-amber-800 z-50 transform transition-transform duration-300 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-200 dark:border-amber-800">
          <h2 className="text-lg font-bold text-stone-800 dark:text-cream-100 flex items-center gap-3">
            <MessageCircle size={20} />
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-6">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-3 px-4 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-xl text-cream-50 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={clsx(
                'group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border',
                currentConversationId === conversation.id
                  ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700'
                  : 'hover:bg-white dark:hover:bg-stone-700 border-transparent hover:border-amber-200 dark:hover:border-amber-800'
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 dark:text-cream-100 truncate">
                    {conversation.name}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    {formatDate(conversation.lastUpdated)}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-amber-600 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-amber-400 dark:text-amber-600 mb-4" />
              <p className="text-amber-700 dark:text-amber-400 font-medium">No conversations yet</p>
              <p className="text-amber-600 dark:text-amber-500 text-sm mt-2">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}