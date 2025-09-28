import { useEffect, useRef, useState } from 'react';
import { User, Bot, CreditCard as Edit, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from '../types';
import { renderMarkdown, enhanceCodeBlocks } from '../utils/markdown';
import { extractMathPlaceholders, injectMathPlaceholders } from '../utils/math';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (contentRef.current && message.role === 'assistant') {
      // Highlight existing code blocks and enhance them with copy/header UI
      enhanceCodeBlocks(contentRef.current);
    }
  }, [message.content]);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type);
    // Here you could send feedback to your analytics service
    console.log(`Feedback for message ${message.id}: ${type}`);
  };
  // Detect tool-result blocks: fenced blocks starting with ```tool
  let processed = message.role === 'assistant' ? message.content : message.content;
  let mathMap = {} as Record<string, string>;

  // If assistant message, extract math placeholders so KaTeX HTML can be injected after markdown
  if (message.role === 'assistant') {
    const extracted = extractMathPlaceholders(message.content);
    processed = extracted.text;
    mathMap = extracted.mathMap;
  }
  const toolBlocks: { id: string; raw: string; html: string }[] = [];
  processed = processed.replace(/```tool([\s\S]*?)```/g, (_, inner) => {
    const id = `tool-${Math.random().toString(36).slice(2, 9)}`;
    // keep raw text for toggling
    toolBlocks.push({ id, raw: inner, html: `<pre class="tool-result">${inner}</pre>` });
    return `%%TOOL_BLOCK_${id}%%`;
  });

  const md = message.role === 'assistant' ? renderMarkdown(processed) : processed.replace(/\n/g, '<br>');

  // After markdown render, replace placeholders with collapsible HTML
  let processedContent = md;
  for (const tb of toolBlocks) {
    const collapsedHtml = `\n<div class=\"tool-collapsible\">\n  <button class=\"tool-toggle\" data-id=\"${tb.id}\">Show tool result</button>\n  <div class=\"tool-body hidden\" data-id=\"${tb.id}\">${tb.html}</div>\n</div>\n`;
    processedContent = processedContent.replace(`%%TOOL_BLOCK_${tb.id}%%`, collapsedHtml);
  }

  // Inject KaTeX-rendered math back into the HTML so the markdown renderer doesn't escape it.
  if (message.role === 'assistant') {
    processedContent = injectMathPlaceholders(processedContent, mathMap);
  }

  return (
    <div className={clsx(
      'flex gap-3 mb-6',
      message.role === 'user' ? 'justify-end' : 'justify-start'
    )}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
      )}
      
      <div className={clsx(
        'max-w-4xl rounded-2xl px-4 py-3 relative',
        // use `group` so hover styles inside the bubble can be triggered
        'group',
        message.role === 'user' 
          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-12' 
          : 'bg-gray-800 text-gray-100 mr-12',
        isLast && message.isStreaming && 'animate-pulse'
      )}>
        <div
          ref={contentRef}
          className={clsx(
            'prose prose-invert max-w-none',
            message.role === 'user' ? 'whitespace-pre-wrap' : ''
          )}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
        {/* Thinking indicator: show when assistant message is streaming but no tokens/output yet */}
        {message.role === 'assistant' && message.isStreaming && (!message.content || message.content.trim() === '') && (
          <div className="mt-2" aria-live="polite" aria-busy="true">
            <span className="text-sm text-gray-300 italic">Thinking</span>
            <span className="sr-only">Assistant is thinking</span>
          </div>
        )}
        
        {/* Hover controls placed at bottom-right of the bubble */}
        {(message.role === 'assistant' || message.role === 'user') && (
          <div className="absolute -bottom-4 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1 pointer-events-auto">
            {message.role === 'assistant' && (
              <>
                <button
                  title="Good response"
                  aria-label="Good response"
                  className={clsx(
                    'w-8 h-8 flex items-center justify-center rounded-full shadow-sm ring-1 ring-transparent transition',
                    feedback === 'up'
                      ? 'bg-green-600 text-white ring-green-500'
                      : 'bg-black/20 hover:bg-black/30 text-white/90 hover:ring-white/10'
                  )}
                  onClick={() => handleFeedback('up')}
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  title="Poor response"
                  aria-label="Poor response"
                  className={clsx(
                    'w-8 h-8 flex items-center justify-center rounded-full shadow-sm ring-1 ring-transparent transition',
                    feedback === 'down'
                      ? 'bg-red-600 text-white ring-red-500'
                      : 'bg-black/20 hover:bg-black/30 text-white/90 hover:ring-white/10'
                  )}
                  onClick={() => handleFeedback('down')}
                >
                  <ThumbsDown size={14} />
                </button>
              </>
            )}
            
            {message.role === 'assistant' && (
              <button
                title="Regenerate"
                aria-label="Regenerate message"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white/90 shadow-sm ring-1 ring-transparent hover:ring-white/10 transition"
                onClick={() => {
                  const ev = new CustomEvent('regenerate-message', { detail: { messageId: message.id } });
                  window.dispatchEvent(ev);
                }}
              >
                <RefreshCw size={16} />
              </button>
            )}

            {message.role === 'user' && (
              <button
                title="Edit"
                aria-label="Edit message"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white/90 shadow-sm ring-1 ring-transparent hover:ring-white/10 transition"
                onClick={() => {
                  const ev = new CustomEvent('edit-message', { detail: { messageId: message.id } });
                  window.dispatchEvent(ev);
                }}
              >
                <Edit size={16} />
              </button>
            )}
          </div>
        )}
        
        {isLast && message.isStreaming && (
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
        )}
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
      )}
    </div>
  );
}