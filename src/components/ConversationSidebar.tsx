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
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full w-80 bg-gray-800 border-r border-gray-700 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <MessageCircle size={22} className="text-orange-400" />
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-all duration-200 p-1.5 rounded-lg hover:bg-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-6">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-3 px-5 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={22} />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={clsx(
                'group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border',
                currentConversationId === conversation.id
                  ? 'bg-orange-500/10 border-orange-500/30 shadow-lg'
                  : 'hover:bg-gray-700 border-transparent hover:border-gray-600 hover:shadow-md'
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate leading-tight">
                    {conversation.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 font-medium">
                    {formatDate(conversation.lastUpdated)}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-3 p-2 text-gray-400 hover:text-red-400 transition-all duration-200 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-700 flex items-center justify-center">
                <MessageCircle size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 font-medium text-lg">No conversations yet</p>
              <p className="text-gray-500 text-sm mt-2">Start a new chat to begin your journey</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}