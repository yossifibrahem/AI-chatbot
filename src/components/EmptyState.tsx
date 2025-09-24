import React from 'react';
import { MessageSquare, Sparkles, Code, Calculator } from 'lucide-react';

interface EmptyStateProps {
  onSendMessage: (message: string) => void;
}

export function EmptyState({ onSendMessage }: EmptyStateProps) {
  const suggestions = [
    {
      icon: <MessageSquare size={20} />,
      title: 'General Chat',
      description: 'Ask me anything you want to know',
      prompt: 'Hello! Can you tell me about yourself?'
    },
    {
      icon: <Code size={20} />,
      title: 'Code Help',
      description: 'Get help with programming problems',
      prompt: 'Can you help me write a React component?'
    },
    {
      icon: <Calculator size={20} />,
      title: 'Math & Science',
      description: 'Solve complex equations and problems',
      prompt: 'Explain the quadratic formula with examples'
    },
    {
      icon: <Sparkles size={20} />,
      title: 'Creative Writing',
      description: 'Generate stories, poems, and content',
      prompt: 'Write a short story about AI and humans'
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-cream-50 dark:bg-stone-900">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-amber-600 dark:bg-amber-700 flex items-center justify-center shadow-lg">
          <MessageSquare size={36} className="text-cream-50" />
        </div>
        
        <h2 className="text-4xl font-bold text-stone-800 dark:text-cream-100 mb-6">
          Welcome to AI Assistant
        </h2>
        <p className="text-stone-600 dark:text-amber-400 text-lg mb-12 leading-relaxed">
          I'm here to help you with anything you need. Choose a topic below to get started, or type your own message.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(suggestion.prompt)}
              className="p-6 bg-white dark:bg-stone-800 hover:bg-cream-100 dark:hover:bg-stone-700 border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-xl text-left transition-all duration-200 hover:shadow-lg group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  {suggestion.icon}
                </div>
                <h3 className="font-bold text-stone-800 dark:text-cream-100">
                  {suggestion.title}
                </h3>
              </div>
              <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
                {suggestion.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}