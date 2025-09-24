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
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange-accent flex items-center justify-center">
          <MessageCircle size={32} className="text-warm-primary" />
        </div>
        
        <h2 className="text-3xl font-bold text-warm-primary mb-4">
          Welcome to AI Assistant
        </h2>
        <p className="text-warm-secondary text-lg mb-8">
          I'm here to help you with anything you need. Choose a topic below to get started, or type your own message.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(suggestion.prompt)}
              className="p-6 bg-warm-secondary hover:bg-warm-tertiary border border-warm-primary hover:border-orange-accent rounded-xl text-left btn-hover group focus-ring"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-accent/20 rounded-lg text-orange-accent group-hover:text-orange-light smooth-transition">
                  {suggestion.icon}
                </div>
                <h3 className="font-semibold text-warm-primary">
                  {suggestion.title}
                </h3>
              </div>
              <p className="text-warm-muted text-sm">
                {suggestion.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}