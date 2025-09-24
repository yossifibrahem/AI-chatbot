// React import not required with new JSX transform
import { useEffect, useRef } from 'react';
import { User, Bot, Edit, RefreshCw } from 'lucide-react';
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
      'flex gap-4 mb-8',
      message.role === 'user' ? 'justify-end' : 'justify-start'
    )}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 flex items-center justify-center shadow-lg">
          <Bot size={20} className="text-white" />
        </div>
      )}
      
      <div className={clsx(
        'max-w-4xl rounded-3xl px-6 py-4 relative shadow-lg',
        // use `group` so hover styles inside the bubble can be triggered
        'group',
        message.role === 'user' 
          ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-purple-600 text-white ml-12 shadow-blue-500/20' 
          : 'bg-slate-800/80 backdrop-blur-sm text-slate-100 mr-12 border border-slate-700/50',
        isLast && message.isStreaming && 'animate-pulse'
      )}>
        <div
          ref={contentRef}
          className={clsx(
            'prose prose-invert max-w-none leading-relaxed',
            message.role === 'user' ? 'whitespace-pre-wrap' : ''
          )}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
        {/* Thinking indicator: show when assistant message is streaming but no tokens/output yet */}
        {message.role === 'assistant' && message.isStreaming && (!message.content || message.content.trim() === '') && (
          <div className="mt-2" aria-live="polite" aria-busy="true">
            <span className="text-sm text-slate-300 italic font-medium">Thinking...</span>
            <span className="sr-only">Assistant is thinking</span>
          </div>
        )}
        
        {/* Hover controls placed at bottom-right of the bubble */}
        {(message.role === 'assistant' || message.role === 'user') && (
          <div className="absolute -bottom-5 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 pointer-events-auto">
            {message.role === 'assistant' && (
              <button
                title="Regenerate"
                aria-label="Regenerate message"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white shadow-lg ring-1 ring-slate-700/50 hover:ring-slate-600 transition-all duration-200 backdrop-blur-sm hover:scale-105"
                onClick={() => {
                  const ev = new CustomEvent('regenerate-message', { detail: { messageId: message.id } });
                  window.dispatchEvent(ev);
                }}
              >
                <RefreshCw size={18} />
              </button>
            )}

            {message.role === 'user' && (
              <button
                title="Edit"
                aria-label="Edit message"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white shadow-lg ring-1 ring-slate-700/50 hover:ring-slate-600 transition-all duration-200 backdrop-blur-sm hover:scale-105"
                onClick={() => {
                  const ev = new CustomEvent('edit-message', { detail: { messageId: message.id } });
                  window.dispatchEvent(ev);
                }}
              >
                <Edit size={18} />
              </button>
            )}
          </div>
        )}
        
        {isLast && message.isStreaming && (
          <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-bounce shadow-lg" />
        )}
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
          <User size={20} className="text-white" />
        </div>
      )}
    </div>
  );
}