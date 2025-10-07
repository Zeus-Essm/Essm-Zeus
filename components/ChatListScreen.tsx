
import React from 'react';
import type { Conversation } from '../types';
import Header from './Header';

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "a";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return "agora";
};

interface ChatListScreenProps {
  conversations: Conversation[];
  onBack: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ conversations, onBack, onSelectConversation }) => {
  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
      <Header title="Mensagens" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="divide-y divide-[var(--border-primary)]">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--accent-primary)]/5 transition-colors"
              >
                <img src={convo.participant.avatar} alt={convo.participant.name} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold truncate">{convo.participant.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] flex-shrink-0 ml-2">{formatTimeAgo(convo.lastMessage.timestamp)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-[var(--text-secondary)] truncate">{convo.lastMessage.text}</p>
                    {convo.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-grow h-full flex flex-col items-center justify-center text-center p-8">
            <p className="text-[var(--text-secondary)]">Nenhuma conversa encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListScreen;