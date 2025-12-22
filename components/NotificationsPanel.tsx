
import React from 'react';
import type { AppNotification } from '../types';
import { BellIcon } from './IconComponents';

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
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
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
          if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-[100] flex justify-end overflow-hidden"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop com desfoque */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Mini Janela Deslizante */}
            <div 
                className="relative w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col border-l border-zinc-100"
                style={{ 
                    animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 flex items-center justify-between border-b border-zinc-50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic">Notificações</h2>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Atividade da sua conta</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all active:scale-90" 
                        aria-label="Fechar"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto scrollbar-hide py-2">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map(notif => (
                                <button 
                                    key={notif.id} 
                                    onClick={() => onNotificationClick(notif)}
                                    className="w-full text-left p-5 hover:bg-zinc-50 transition-all flex items-start gap-4 border-b border-zinc-50/50 group"
                                >
                                    <div className="relative flex-shrink-0 mt-1">
                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${notif.read ? 'bg-transparent' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'}`} />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className={`text-sm leading-snug transition-colors ${notif.read ? 'text-zinc-500 font-medium' : 'text-zinc-900 font-bold'}`}>
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">
                                                {formatTimeAgo(notif.createdAt)} atrás
                                            </span>
                                            {!notif.read && (
                                                <span className="w-1 h-1 rounded-full bg-zinc-200" />
                                            )}
                                            {!notif.read && (
                                                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Nova</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                            <BellIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-30">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-zinc-50 flex items-center justify-center mb-6">
                                <BellIcon className="w-10 h-10 text-zinc-300" strokeWidth={1} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Tudo calmo por aqui</h3>
                            <p className="text-[10px] font-bold text-zinc-300 mt-2 uppercase tracking-tight">Novas interações aparecerão nesta janela</p>
                        </div>
                    )}
                </main>

                <footer className="p-6 border-t border-zinc-50 bg-white flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-zinc-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]"
                    >
                        Entendido
                    </button>
                </footer>
            </div>

            <style>
            {`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}
            </style>
        </div>
    );
};

export default NotificationsPanel;
