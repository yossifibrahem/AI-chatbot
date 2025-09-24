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
    <div className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-md p-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          {editingMessageId && (
            <div className="text-sm text-yellow-300 bg-yellow-900/20 px-3 py-1 rounded-md">
              Editing message — this will delete all messages after it and regenerate the assistant response when submitted.
            </div>
          )}

          <div className="flex items-end gap-3 bg-gray-800 rounded-2xl border border-gray-600 p-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 resize-none border-none outline-none min-h-[32px] max-h-[200px]"
            style={{ height: '32px' }}
          />
          {/* If editing, show a Cancel button */}
          {editingMessageId && (
            <button
              onClick={() => onCancelEdit && onCancelEdit()}
              className="mr-2 text-sm text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          )}
          <button
            onClick={isStreaming ? onStopGeneration : handleSubmit}
            disabled={(!message.trim() && !isStreaming) || disabled}
            className={clsx(
              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
              isStreaming
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : message.trim()
                ? 'bg-gradient-to-br from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isStreaming ? <Square size={18} /> : <Send size={18} />}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}