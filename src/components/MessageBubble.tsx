// React import not required with new JSX transform
import { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { renderMath } from '../utils/math';
import { highlightCode } from '../utils/markdown';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && message.role === 'assistant') {
      highlightCode(contentRef.current);
    }
  }, [message.content]);

  // Detect tool-result blocks: fenced blocks starting with ```tool
  let processed = message.role === 'assistant' ? renderMath(message.content) : message.content;
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
        
        {/* Small per-message controls for assistant messages (handled via custom events) */}
        {message.role === 'assistant' && (
          <div className="mt-2 flex gap-2">
            <button className="text-sm text-gray-400 hover:text-gray-200" onClick={() => {
              const ev = new CustomEvent('regenerate-message', { detail: { messageId: message.id } });
              window.dispatchEvent(ev);
            }}>Regenerate</button>
          </div>
        )}

        {message.role === 'user' && (
          <div className="mt-2 flex gap-2 justify-end">
            <button className="text-sm text-gray-300 hover:text-white" onClick={() => {
              const ev = new CustomEvent('edit-message', { detail: { messageId: message.id } });
              window.dispatchEvent(ev);
            }}>Edit</button>
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