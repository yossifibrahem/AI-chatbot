import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Send, Square, Mic, MicOff } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Keep initialText in sync when editingMessageId changes
  useEffect(() => {
    setMessage(initialText ?? '');
    if (textareaRef.current) textareaRef.current.style.height = '56px';
  }, [initialText, editingMessageId]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setMessage(prev => prev + transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
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

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  return (
    <div className="border-t border-gray-700 bg-gray-900/80 backdrop-blur-xl p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          {editingMessageId && (
            <div className="text-sm text-yellow-300 bg-yellow-900/20 px-4 py-2 rounded-xl border border-yellow-700/30">
              Editing message — this will delete all messages after it and regenerate the assistant response when submitted.
            </div>
          )}

          <div className="relative">
            <div className="flex items-end gap-4 bg-gray-800/90 backdrop-blur-sm rounded-3xl border border-gray-600/50 p-4 shadow-2xl">
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={clsx(
                    'flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 border',
                    isListening 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 animate-pulse' 
                      : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                  )}
                  title={isListening ? 'Stop voice input' : 'Start voice input'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
            
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Type your message here..."}
                  rows={1}
                  disabled={disabled}
                  className="w-full bg-transparent text-gray-100 placeholder-gray-400 resize-none border-none outline-none min-h-[40px] max-h-[200px] text-base leading-relaxed"
                  style={{ height: '40px' }}
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
                    'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg',
                    isStreaming
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25'
                      : message.trim()
                      ? 'bg-gradient-to-br from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105'
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