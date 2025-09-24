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
    <div className="border-t border-warm-primary bg-warm-secondary p-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          {editingMessageId && (
            <div className="text-sm text-orange-light bg-warm-tertiary px-3 py-1 rounded-md border border-warm-secondary">
              Editing message — this will delete all messages after it and regenerate the assistant response when submitted.
            </div>
          )}

          <div className="flex items-end gap-3 bg-warm-tertiary rounded-2xl border border-warm-secondary p-3 smooth-transition hover:border-orange-accent">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-warm-primary placeholder-warm-muted resize-none border-none outline-none min-h-[32px] max-h-[200px] focus-ring"
            style={{ height: '32px' }}
          />
          {/* If editing, show a Cancel button */}
          {editingMessageId && (
            <button
              onClick={() => onCancelEdit && onCancelEdit()}
              className="mr-2 text-sm text-warm-muted hover:text-warm-primary smooth-transition focus-ring px-2 py-1 rounded"
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
                ? 'bg-error hover:bg-red-700 text-warm-primary hover-lift'
                : message.trim()
                ? 'bg-orange-accent hover:bg-orange-light text-warm-primary shadow-lg hover-lift'
                : 'bg-warm-accent text-warm-muted cursor-not-allowed',
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