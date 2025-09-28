import { useState, KeyboardEvent, useEffect, useRef } from 'react';
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
    if (textareaRef.current) textareaRef.current.style.height = '32px';
  }, [initialText, editingMessageId]);

  useEffect(() => {
    // keep initial text in sync via effect; no-op otherwise
  }, []);
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
      textareaRef.current.style.height = '32px';
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
    textarea.style.height = '32px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // Voice input removed: toggleVoiceInput no longer exists
  return (
  <div className="bg-transparent p-3">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          {editingMessageId && (
            <div className="text-sm text-yellow-300 bg-yellow-900/20 px-4 py-2 rounded-xl border border-yellow-700/30">
              Editing message — this will delete all messages after it and regenerate the assistant response when submitted.
            </div>
          )}

          <div className="relative">
            <div className="flex items-end gap-3 bg-gray-800/90 backdrop-blur-sm rounded-3xl border border-gray-600/50 p-3 shadow-lg">
              {/* Voice input UI removed */}
            
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  rows={1}
                  disabled={disabled}
                  className="w-full bg-transparent text-gray-100 placeholder-gray-400 resize-none border-none outline-none min-h-[32px] max-h-[200px] text-sm leading-relaxed"
                  style={{ height: '32px' }}
                />
              </div>
            
              <div className="flex items-center gap-3">
                {/* If editing, show a Cancel button */}
                {editingMessageId && (
                  <button
                    onClick={() => onCancelEdit && onCancelEdit()}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={isStreaming ? onStopGeneration : handleSubmit}
                  disabled={(!message.trim() && !isStreaming) || disabled}
                  className={clsx(
                    'flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg',
                    isStreaming
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25'
                      : message.trim()
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                  )}
                >
                  {isStreaming ? <Square size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}