// React import not required with new JSX transform
import { useEffect, useRef } from 'react';
import { User, MessageSquare, Edit, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    if (contentRef.current && message.role === 'assistant') {
      // Highlight existing code blocks and enhance them with copy/header UI
      enhanceCodeBlocks(contentRef.current);
    }
  }, [message.content]);

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
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-600 dark:bg-amber-700 flex items-center justify-center shadow-sm">
          <MessageSquare size={18} className="text-cream-50" />
        </div>
      )}
      
      <div className={clsx(
        'max-w-4xl rounded-2xl px-6 py-4 relative shadow-sm',
        // use `group` so hover styles inside the bubble can be triggered
        'group',
        message.role === 'user' 
          ? 'bg-amber-600 dark:bg-amber-700 text-cream-50 ml-12 border border-amber-700 dark:border-amber-600' 
          : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-cream-100 mr-12 border border-amber-200 dark:border-amber-800',
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
          <div className="mt-3" aria-live="polite" aria-busy="true">
            <span className="text-sm text-amber-600 dark:text-amber-400 italic font-medium">Thinking</span>
            <span className="sr-only">Assistant is thinking</span>
          </div>
        )}
        
        {/* Hover controls placed at bottom-right of the bubble */}
        {(message.role === 'assistant' || message.role === 'user') && (
          <div className="absolute -bottom-4 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-2 pointer-events-auto">
            {message.role === 'assistant' && (
              <button
                title="Regenerate"
                aria-label="Regenerate message"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-600/90 hover:bg-amber-700 text-cream-50 shadow-md ring-1 ring-transparent hover:ring-amber-400 transition-all duration-200"
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
                className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-600/90 hover:bg-amber-700 text-cream-50 shadow-md ring-1 ring-transparent hover:ring-amber-400 transition-all duration-200"
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
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500 rounded-full animate-bounce" />
        )}
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-600 dark:bg-stone-700 flex items-center justify-center shadow-sm">
          <User size={18} className="text-cream-50" />
        </div>
      )}
    </div>
  );
}