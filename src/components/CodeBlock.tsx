import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { highlightCode } from '../utils/markdown';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      // highlightCode expects the container (pre) element
      const pre = codeRef.current.parentElement as HTMLElement | null;
      if (pre) highlightCode(pre);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="code-block-wrapper my-6 rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
      <div className="code-block-header flex items-center justify-between px-4 py-3 text-sm text-gray-300 bg-gray-800 border-b border-gray-700">
        <span className="font-mono lowercase">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-2 text-gray-400 hover:text-white focus:outline-none px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <pre className="m-0 p-5 overflow-auto max-h-80">
        <code ref={codeRef} className={`language-${language} font-mono text-sm`}>{code}</code>
      </pre>
    </div>
  );
}