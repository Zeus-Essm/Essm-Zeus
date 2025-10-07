
import React from 'react';
import type { AppNotification } from '../types';
import { BellIcon } from './IconComponents';

// Simple time formatter
const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " a";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return Math.floor(seconds) + " s";
};

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface NotificationsPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onNotificationClick: (notification: AppNotification) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onNotificationClick }) => {
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            onClose();
          }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm z-50 animate-modalFadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
        >
            <div 
                className="absolute top-0 right-0 h-full w-full max-w-sm bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slideInRight 0.3s ease-out forwards' }} // Custom animation
            >
                <header className="p-4 flex items-center justify-between border-b border-[var(--border-primary)] flex-shrink-0">
                    <h2 id="notifications-title" className="text-xl font-bold text-[var(--accent-primary)] text-glow tracking-wider uppercase">Notificações</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors" aria-label="Fechar notificações">
                        <XIcon className="w-6 h-6 text-[var(--accent-primary)]" />
                    </button>
                </header>
                <main className="flex-grow overflow-y-auto">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-[var(--border-primary)]">
                            {notifications.map(notif => (
                                <button 
                                    key={notif.id} 
                                    onClick={() => onNotificationClick(notif)}
                                    className="w-full text-left p-4 hover:bg-[var(--accent-primary)]/5 transition-colors flex items-start gap-4"
                                >
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] mt-1.5 flex-shrink-0 transition-opacity" style={{ opacity: notif.read ? 0 : 1 }} aria-hidden="true" />
                                    <div className="flex-grow">
                                        <p className="text-[var(--text-primary)]">{notif.message}</p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">{formatTimeAgo(notif.createdAt)} atrás</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <BellIcon className="w-20 h-20 text-[var(--text-secondary)] mb-4" />
                            <h3 className="text-lg font-bold">Nenhuma notificação</h3>
                            <p className="text-[var(--text-secondary)] mt-1">As novidades aparecerão aqui.</p>
                        </div>
                    )}
                </main>
            </div>
            {/* Add keyframes for slide-in animation */}
            <style>
            {`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}
            </style>
        </div>
    );
};

export default NotificationsPanel;