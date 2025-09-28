import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState } from './types';
import { ConversationSidebar } from './components/ConversationSidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { useLocalStorage } from './hooks/useLocalStorage';
import { streamChatCompletion, createChatCompletion } from './utils/api';
import clsx from 'clsx';

function App() {
  const [chatState, setChatState] = useLocalStorage<ChatState>('chat-state', {
    conversations: [],
    currentConversationId: null,
    isStreaming: false,
    sidebarOpen: false,
  });

  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingInitialText, setEditingInitialText] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = chatState.conversations.find(
    conv => conv.id === chatState.currentConversationId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, streamingMessage]);

  // Listen for message-level events (from MessageBubble)
  useEffect(() => {
    const onRegenerate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const messageId = detail?.messageId;
      if (!messageId) return;
      // find conversation containing message
      const conv = chatState.conversations.find(c => c.messages.some(m => m.id === messageId));
      if (!conv) return;
      handleRegenerate(conv.id);
    };

    // delete-message handling removed (no per-message delete button in UI)

    const onEdit = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const messageId = detail?.messageId;
      if (!messageId) return;
      const conv = chatState.conversations.find(c => c.messages.some(m => m.id === messageId));
      if (!conv) return;
      const msg = conv.messages.find(m => m.id === messageId && m.role === 'user');
      if (!msg) return;

      setEditingMessageId(messageId);
      setEditingInitialText(msg.content);
      // ensure the conversation is selected
      setChatState(prev => ({ ...prev, currentConversationId: conv.id }));
    };

    window.addEventListener('regenerate-message', onRegenerate as EventListener);
    window.addEventListener('edit-message', onEdit as EventListener);
    return () => {
      window.removeEventListener('regenerate-message', onRegenerate as EventListener);
      window.removeEventListener('edit-message', onEdit as EventListener);
    };
  }, [chatState.conversations]);

  // Use real streaming from API. Accepts a full messages array (conversation history)
  const streamResponseFromApi = async (messagesForApi: { role: string; content: string }[]) => {
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setStreamingMessage(assistantMessage);

    // Accumulate tokens locally so the final message contains the full content
    let accumulated = '';
    try {
      await streamChatCompletion({
        messages: messagesForApi,
        signal: abortControllerRef.current?.signal ?? undefined,
        onToken: (token) => {
          accumulated += token;
          setStreamingMessage(prev => prev ? { ...prev, content: prev.content + token } : prev);
        }
      });

      // finalize using accumulated content
      const finalMessage: Message = {
        ...assistantMessage,
        content: accumulated,
        isStreaming: false
      };

      setStreamingMessage(null);
      return finalMessage;
    } catch (e) {
      // If the stream was aborted by the user but we already received some tokens,
      // preserve the partial content as a final assistant message instead of discarding it.
  const isAbort = (e as any)?.name === 'AbortError' || (e as any)?.message?.toLowerCase()?.includes('abort');
  // Use the accumulated content that we collected while streaming
  const partial = accumulated || '';
      setStreamingMessage(null);

      if (isAbort && partial && partial.trim() !== '') {
        const finalMessage: Message = {
          ...assistantMessage,
          content: partial,
          isStreaming: false
        };
        return finalMessage;
      }

      // Nothing to preserve, rethrow so callers can handle fallback logic
      throw e;
    }
  };

  // Generate a short, context-aware conversation name using the assistant.
  const generateConversationName = async (conversationId: string, firstUserMessage?: string) => {
    try {
      const firstMsg = firstUserMessage ?? chatState.conversations.find(c => c.id === conversationId)?.messages[0]?.content ?? '';
      if (!firstMsg) return;

      const prompt = `Provide a short (max 30 characters) chat title for a conversation whose first user message is:\n\n"${firstMsg}"\n\nReturn only the title.`;
      const title = await createChatCompletion([{ role: 'user', content: prompt }]);
      const cleaned = title.replace(/\n/g, ' ').trim().slice(0, 60);
      if (cleaned) {
        setChatState(prev => ({
          ...prev,
          conversations: prev.conversations.map(c => c.id === conversationId ? { ...c, name: cleaned } : c)
        }));
      }
    } catch (e) {
      // ignore failures to generate a title
      console.warn('Could not auto-generate conversation name', e);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (chatState.isStreaming) return;

    setChatState(prev => ({ ...prev, isStreaming: true }));
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    let conversation = currentConversation;

    // Create new conversation if needed
    if (!conversation) {
      conversation = {
        id: uuidv4(),
        name: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        lastUpdated: new Date(),
        messages: []
      };
    }

    // Add user message
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      lastUpdated: new Date()
    };

    setChatState(prev => ({
      ...prev,
      conversations: prev.conversations.some(c => c.id === conversation.id)
        ? prev.conversations.map(c => c.id === conversation.id ? updatedConversation : c)
        : [updatedConversation, ...prev.conversations],
      currentConversationId: conversation.id
    }));

    // Remember how many messages were in the conversation before sending
    const prevMessageCount = conversation.messages.length;

    try {
      // Use streaming API when available to show tokens live
      const messagesForApi = updatedConversation.messages.map(m => ({ role: m.role, content: m.content }));
      const assistantMessage = await streamResponseFromApi(messagesForApi);

      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversation.id 
            ? { ...c, messages: [...c.messages, assistantMessage], lastUpdated: new Date() }
            : c
        ),
        isStreaming: false
      }));

      // If this was the first assistant reply for the conversation (i.e. there
      // were 0 messages before sending the user's message), generate a title.
      if (prevMessageCount === 0) {
        // run in background, use the original user message as source
        generateConversationName(conversation.id, userMessage.content).catch(() => {});
      }
    } catch (error) {
      // If the error was caused by an explicit user abort, don't fall back to the non-streaming API
      const isAbort = (error as any)?.name === 'AbortError' || (error as any)?.message?.toLowerCase().includes('abort');
      if (isAbort) {
        console.log('Streaming aborted by user, skipping fallback.');
        setChatState(prev => ({ ...prev, isStreaming: false }));
        return;
      }
      console.error('Error sending message (stream), falling back to non-streaming', error);
      try {
        // fallback to non-streaming completion
        const assistantText = await createChatCompletion([
          ...conversation.messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content }
        ]);

        const assistantMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          content: assistantText,
          timestamp: new Date()
        };

        setChatState(prev => ({
          ...prev,
          conversations: prev.conversations.map(c => 
            c.id === conversation.id 
              ? { ...c, messages: [...c.messages, assistantMessage], lastUpdated: new Date() }
              : c
          ),
          isStreaming: false
        }));

        if (prevMessageCount === 0) {
          generateConversationName(conversation.id, userMessage.content).catch(() => {});
        }
      } catch (e2) {
        console.error('Error sending message:', e2);
        setChatState(prev => ({ ...prev, isStreaming: false }));
      }
    }
  };



  const handleRegenerate = async (conversationId: string) => {
    const conv = chatState.conversations.find(c => c.id === conversationId);
    if (!conv) return;

    // Remove last assistant message if it exists
    const last = conv.messages[conv.messages.length - 1];
    if (last?.role === 'assistant') {
      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => c.id === conversationId
          ? { ...c, messages: c.messages.slice(0, -1), lastUpdated: new Date() }
          : c
        ),
        isStreaming: true
      }));

      // Recreate assistant message from context
      // Ensure we exclude the removed assistant message when rebuilding the history to send to the API
      const userMessages = conv.messages.filter(m => m.role === 'user');
      const lastUser = userMessages[userMessages.length - 1];
      if (!lastUser) {
        setChatState(prev => ({ ...prev, isStreaming: false }));
        return;
      }

      abortControllerRef.current = new AbortController();
      try {
        // Build the full messages history to send to the API (exclude the last assistant message we removed)
        const messagesForApi = conv.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
        const assistantMessage = await streamResponseFromApi(messagesForApi);
        setChatState(prev => ({
          ...prev,
          conversations: prev.conversations.map(c => c.id === conversationId
            ? { ...c, messages: [...c.messages, assistantMessage], lastUpdated: new Date() }
            : c
          ),
          isStreaming: false
        }));
      } catch (e) {
        const isAbort = (e as any)?.name === 'AbortError' || (e as any)?.message?.toLowerCase().includes('abort');
        if (isAbort) {
          setChatState(prev => ({ ...prev, isStreaming: false }));
          // clear controller
          abortControllerRef.current = null;
          return;
        }
        console.error('Regenerate failed', e);
        setChatState(prev => ({ ...prev, isStreaming: false }));
      }
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStreamingMessage(null);
    // Clear the controller so callers can detect the generation was intentionally stopped
    abortControllerRef.current = null;
    setChatState(prev => ({ ...prev, isStreaming: false }));
  };

  const handleNewConversation = () => {
    setChatState(prev => ({
      ...prev,
      currentConversationId: null,
      sidebarOpen: false
    }));
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingInitialText(undefined);
  };

  const handleUpdateMessage = async (messageId: string, newText: string) => {
    // Find conversation and index
    const convIndex = chatState.conversations.findIndex(c => c.messages.some(m => m.id === messageId));
    if (convIndex === -1) return;
    const conv = chatState.conversations[convIndex];

    // Find the position of the message
    const msgIndex = conv.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Replace the message content
    const updatedMessages = conv.messages.slice(0, msgIndex).concat([{ ...conv.messages[msgIndex], content: newText }]);

    // By requirement: editing a message deletes all messages below it
    // So we keep only messages up to (and including) the edited one
    setChatState(prev => ({
      ...prev,
      conversations: prev.conversations.map((c, i) => i === convIndex ? { ...c, messages: updatedMessages, lastUpdated: new Date() } : c)
    }));

    // Clear editing state
    setEditingMessageId(null);
    setEditingInitialText(undefined);

    // Now regenerate assistant response from this point
    try {
      setChatState(prev => ({ ...prev, isStreaming: true }));
      abortControllerRef.current = new AbortController();

      const messagesForApi = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const assistantMessage = await streamResponseFromApi(messagesForApi);

      // Append assistant message to conversation
      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map((c, i) => i === convIndex ? { ...c, messages: [...c.messages.slice(0, msgIndex + 1), assistantMessage], lastUpdated: new Date() } : c),
        isStreaming: false
      }));
    } catch (e) {
      const isAbort = (e as any)?.name === 'AbortError' || (e as any)?.message?.toLowerCase().includes('abort');
      if (isAbort) {
        console.log('Edit regenerate aborted');
        setChatState(prev => ({ ...prev, isStreaming: false }));
        abortControllerRef.current = null;
        return;
      }
      console.error('Failed to regenerate after edit', e);
      setChatState(prev => ({ ...prev, isStreaming: false }));
    }
  };

  const handleSelectConversation = (id: string) => {
    setChatState(prev => ({
      ...prev,
      currentConversationId: id,
      sidebarOpen: false
    }));
  };

  const handleDeleteConversation = (id: string) => {
    setChatState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(c => c.id !== id),
      currentConversationId: prev.currentConversationId === id ? null : prev.currentConversationId
    }));
  };

  const toggleSidebar = () => {
    setChatState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const allMessages = [
    ...(currentConversation?.messages || []),
    ...(streamingMessage ? [streamingMessage] : [])
  ];

  return (
  <div className="h-screen bg-gray-900 flex">
        <ConversationSidebar
          conversations={chatState.conversations}
          currentConversationId={chatState.currentConversationId}
          isOpen={chatState.sidebarOpen}
          onClose={() => setChatState(prev => ({ ...prev, sidebarOpen: false }))}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />

      <div className={clsx(
        'flex-1 flex flex-col min-w-0 transition-all duration-300 relative',
        chatState.sidebarOpen && 'lg:ml-0'
      )}>
        <ChatHeader
          currentConversation={currentConversation ?? null}
          onToggleSidebar={toggleSidebar}
        />

  <div className="flex-1 overflow-y-auto pb-24 chat-messages-area">
          {allMessages.length === 0 ? (
            <EmptyState onSendMessage={handleSendMessage} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
              {allMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLast={index === allMessages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="absolute left-0 right-0 bottom-0 z-20">
          <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={chatState.isStreaming}
          editingMessageId={editingMessageId}
          initialText={editingInitialText}
          onCancelEdit={handleCancelEdit}
          onUpdateMessage={handleUpdateMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;