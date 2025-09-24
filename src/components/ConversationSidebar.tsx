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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-700 z-50 transform transition-transform duration-300 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <MessageCircle size={20} />
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-4">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={clsx(
                'group relative p-3 rounded-xl cursor-pointer transition-all duration-200',
                currentConversationId === conversation.id
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'hover:bg-gray-800 border border-transparent'
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-100 truncate">
                    {conversation.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(conversation.lastUpdated)}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-400 transition-all duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No conversations yet</p>
              <p className="text-gray-500 text-sm mt-2">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}