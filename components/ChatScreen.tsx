
import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, Profile } from '../types';
import { ArrowLeftIcon, PaperAirplaneIcon } from './IconComponents';

interface ChatScreenProps {
  conversation: Conversation;
  currentUser: Profile;
  onBack: () => void;
  onSendMessage: (text: string, conversationId: string) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversation, currentUser, onBack, onSendMessage }) => {
  // Mock messages for this specific conversation
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', text: 'Olá! Adorei seu último look, ficou incrível!', senderId: conversation.participant.id, timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString() },
    { id: 'm2', text: 'Obrigado! Fico feliz que tenha gostado 😊', senderId: currentUser.id, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageToSend: Message = {
      id: `msg_${Date.now()}`,
      text: newMessage,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
    };
    
    // In a real app, you'd call onSendMessage and wait for a state update.
    // Here, we'll just update the local state for demonstration.
    setMessages(prev => [...prev, messageToSend]);
    setNewMessage('');
    
    // Simulate a reply after 1.5 seconds
    setTimeout(() => {
        const replyMessage: Message = {
            id: `msg_${Date.now() + 1}`,
            text: 'Legal!',
            senderId: conversation.participant.id,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, replyMessage]);
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-2 flex items-center bg-[var(--bg-header)] border-b border-[var(--border-primary)] backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-[var(--accent-primary)]" />
        </button>
        <img src={conversation.participant.avatar} alt={conversation.participant.name} className="w-9 h-9 rounded-full object-cover mr-3"/>
        <h1 className="text-lg font-bold text-white tracking-wider">{conversation.participant.name}</h1>
      </header>

      {/* Messages Area */}
      <main className="flex-grow overflow-y-auto pt-16 pb-4 px-4 space-y-4">
        {messages.map(msg => {
          const isSentByMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${isSentByMe ? 'bg-[var(--accent-primary)] text-white rounded-br-lg' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-lg'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 p-2 bg-[var(--bg-main)] border-t border-[var(--border-primary)]">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-grow p-3 bg-[var(--bg-tertiary)] rounded-full border-2 border-transparent focus:border-[var(--accent-primary)] focus:outline-none focus:ring-0 transition-colors"
          />
          <button
            type="submit"
            className="p-3 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:brightness-125 disabled:bg-zinc-600 transition-colors"
            disabled={!newMessage.trim()}
            aria-label="Enviar mensagem"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatScreen;