import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, Profile } from '../types';
import { ArrowLeftIcon, PaperAirplaneIcon, MicrophoneIcon, StopIcon } from './IconComponents';
import LiveVoiceChat from './LiveVoiceChat';

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
  
  // New state for voice chat
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [voiceChatStatus, setVoiceChatStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('closed');
  const [voiceChatError, setVoiceChatError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageToSend: Message = {
      id: `msg_user_${Date.now()}`,
      text: newMessage,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, messageToSend]);
    onSendMessage(newMessage, conversation.id);
    setNewMessage('');
    
    // Simulate a reply for demo
    setTimeout(() => {
        const replyMessage: Message = {
            id: `msg_model_${Date.now()}`,
            text: 'Legal!',
            senderId: conversation.participant.id,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, replyMessage]);
    }, 1500);
  };
  
  const handleNewTranscriptionTurn = ({ userInput, modelOutput }: { userInput: string, modelOutput: string }) => {
      const newMessages: Message[] = [];
      if (userInput.trim()) {
          newMessages.push({
              id: `msg_user_${Date.now()}`,
              text: userInput,
              senderId: currentUser.id,
              timestamp: new Date().toISOString(),
          });
      }
      if (modelOutput.trim()) {
          newMessages.push({
              id: `msg_model_${Date.now() + 1}`,
              text: modelOutput,
              senderId: conversation.participant.id,
              timestamp: new Date().toISOString(),
          });
      }
      if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
      }
  };

  const getStatusIndicator = () => {
      switch (voiceChatStatus) {
          case 'connecting':
              return <p className="text-sm text-amber-400 text-center flex-grow">Conectando...</p>;
          case 'connected':
              return (
                  <div className="flex-grow flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-sm text-green-400">Ouvindo...</p>
                  </div>
              );
          case 'error':
              return <p className="text-sm text-red-400 text-center flex-grow">{voiceChatError || "Erro"}</p>;
          default:
              return null;
      }
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      setIsVoiceChatActive(false);
    }
  }, []);

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
        {isVoiceChatActive ? (
            <div className="flex items-center gap-2 h-[52px]">
                {getStatusIndicator()}
                <button
                    onClick={() => setIsVoiceChatActive(false)}
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    aria-label="Parar chat de voz"
                >
                    <StopIcon className="w-6 h-6" />
                </button>
                {isVoiceChatActive && 
                    <LiveVoiceChat 
                        onNewTranscriptionTurn={handleNewTranscriptionTurn}
                        onStatusChange={setVoiceChatStatus}
                        onError={(err) => {
                            setVoiceChatError(err);
                            setVoiceChatStatus('error');
                        }}
                    />
                }
            </div>
        ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="flex-grow p-3 bg-[var(--bg-tertiary)] rounded-full border-2 border-transparent focus:border-[var(--accent-primary)] focus:outline-none focus:ring-0 transition-colors"
                />
                <button
                    type="button"
                    onClick={() => {
                        setIsVoiceChatActive(true);
                        setVoiceChatError(null);
                    }}
                    className="p-3 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 transition-colors"
                    aria-label="Iniciar chat de voz"
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
                <button
                    type="submit"
                    className="p-3 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:brightness-125 disabled:bg-zinc-600 transition-colors"
                    disabled={!newMessage.trim()}
                    aria-label="Enviar mensagem"
                >
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        )}
      </footer>
    </div>
  );
};

export default ChatScreen;
