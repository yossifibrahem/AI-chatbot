import { MessageCircle, Sparkles, Code, Calculator, BookOpen, Lightbulb } from 'lucide-react';

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
    },
    {
      icon: <BookOpen size={20} />,
      title: 'Learning & Education',
      description: 'Explain concepts and help with studying',
      prompt: 'Explain quantum physics in simple terms'
    },
    {
      icon: <Lightbulb size={20} />,
      title: 'Problem Solving',
      description: 'Brainstorm solutions and ideas',
      prompt: 'Help me brainstorm ideas for a mobile app'
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500 flex items-center justify-center">
          <MessageCircle size={32} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          Welcome to AI Assistant
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          I'm here to help you with anything you need. Choose a topic below to get started, or type your own message.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(suggestion.prompt)}
              className="p-6 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                  {suggestion.icon}
                </div>
                <h3 className="font-semibold text-gray-100">
                  {suggestion.title}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                {suggestion.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}