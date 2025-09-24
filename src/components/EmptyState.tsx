import React from 'react';
import { MessageCircle, Sparkles, Code, Calculator } from 'lucide-react';

interface EmptyStateProps {
  onSendMessage: (message: string) => void;
}

export function EmptyState({ onSendMessage }: EmptyStateProps) {
  const suggestions = [
    {
      icon: <MessageCircle size={20} />,
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
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-blue-600 flex items-center justify-center">
          <MessageCircle size={36} className="text-white" />
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-6">
          Welcome to AI Assistant
        </h2>
        <p className="text-gray-400 text-xl mb-12 leading-relaxed">
          I'm here to help you with anything you need. Choose a topic below to get started, or type your own message.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(suggestion.prompt)}
              className="p-8 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-600/30 rounded-2xl text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 group-hover:text-blue-300 transition-colors">
                  {suggestion.icon}
                </div>
                <h3 className="font-semibold text-white text-lg">
                  {suggestion.title}
                </h3>
              </div>
              <p className="text-gray-500 text-base leading-relaxed">
                {suggestion.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}