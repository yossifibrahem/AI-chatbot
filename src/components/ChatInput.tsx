import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import clsx from 'clsx';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  // Editing support
  editingMessageId?: string | null;
  initialText?: string;
  onCancelEdit?: () => void;
  onUpdateMessage?: (messageId: string, newText: string) => void;
}

export function ChatInput({ onSendMessage, onStopGeneration, isStreaming, disabled, editingMessageId, initialText, onCancelEdit, onUpdateMessage }: ChatInputProps) {
  const [message, setMessage] = useState(initialText ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep initialText in sync when editingMessageId changes
  useEffect(() => {
    setMessage(initialText ?? '');
    if (textareaRef.current) textareaRef.current.style.height = '56px';
  }, [initialText, editingMessageId]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isStreaming || disabled) return;
    // If we're editing, call update handler instead of send
    if (editingMessageId && onUpdateMessage) {
      onUpdateMessage(editingMessageId, trimmedMessage);
    } else {
      onSendMessage(trimmedMessage);
    }
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = '56px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-6 shadow-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-3">
          {editingMessageId && (
            <div className="text-sm text-orange-300 bg-orange-900/20 px-4 py-3 rounded-2xl border border-orange-700/30 font-medium">
              Editing message — this will delete all messages after it and regenerate the assistant response when submitted.
            </div>
          )}

          <div className="flex items-end gap-4 bg-gray-700 rounded-3xl border border-gray-600 p-4 shadow-lg hover:border-gray-500 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none min-h-[36px] max-h-[200px] text-base leading-relaxed"
            style={{ height: '36px' }}
          />
          {/* If editing, show a Cancel button */}
          {editingMessageId && (
            <button
              onClick={() => onCancelEdit && onCancelEdit()}
              className="mr-3 px-3 py-2 text-sm text-gray-300 hover:text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={isStreaming ? onStopGeneration : handleSubmit}
            disabled={(!message.trim() && !isStreaming) || disabled}
            className={clsx(
              'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg',
              isStreaming
                ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-105 active:scale-95'
                : message.trim()
                ? 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 active:scale-95'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isStreaming ? <Square size={20} /> : <Send size={20} />}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}