import { useState } from 'react';
import { X, Download, FileText, Copy, Check } from 'lucide-react';
import { Conversation } from '../types';
import clsx from 'clsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
}

export function ExportModal({ isOpen, onClose, conversation }: ExportModalProps) {
  const [format, setFormat] = useState<'markdown' | 'json' | 'txt'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const generateMarkdown = () => {
    let content = `# ${conversation.name}\n\n`;
    content += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;
    
    conversation.messages.forEach((message, index) => {
      const role = message.role === 'user' ? '**You**' : '**Assistant**';
      content += `## ${role}\n\n${message.content}\n\n`;
      if (index < conversation.messages.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  };

  const generateJSON = () => {
    return JSON.stringify({
      conversation: {
        id: conversation.id,
        name: conversation.name,
        lastUpdated: conversation.lastUpdated,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      },
      exportedAt: new Date().toISOString()
    }, null, 2);
  };

  const generateText = () => {
    let content = `${conversation.name}\n`;
    content += `${'='.repeat(conversation.name.length)}\n\n`;
    content += `Exported on ${new Date().toLocaleDateString()}\n\n`;
    
    conversation.messages.forEach((message, index) => {
      const role = message.role === 'user' ? 'You' : 'Assistant';
      content += `${role}:\n${message.content}\n\n`;
      if (index < conversation.messages.length - 1) {
        content += `${'-'.repeat(50)}\n\n`;
      }
    });
    
    return content;
  };

  const getContent = () => {
    switch (format) {
      case 'markdown': return generateMarkdown();
      case 'json': return generateJSON();
      case 'txt': return generateText();
      default: return '';
    }
  };

  const getFileName = () => {
    const safeName = conversation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    return `${safeName}_${timestamp}.${format}`;
  };

  const handleDownload = () => {
    const content = getContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-200/20 flex items-center justify-center">
              <Download size={18} className="text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Export Conversation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Export Format
            </label>
            <div className="flex gap-2">
              {[
                { value: 'markdown', label: 'Markdown', icon: FileText },
                { value: 'json', label: 'JSON', icon: FileText },
                { value: 'txt', label: 'Text', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFormat(value as any)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                    format === value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Preview
            </label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 h-64 overflow-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {getContent()}
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                copied
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Download size={16} />
              Download {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}