
import React, { useState, useRef, useEffect } from 'react';
import type { Post, Profile, Comment } from '../types';
import { PaperAirplaneIcon, UserIcon } from './IconComponents';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}a`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mês`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}min`;
    return "agora";
};

interface CommentsModalProps {
  post: Post;
  currentUser: Profile;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ post, currentUser, onClose, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    // Scroll to bottom on open
    commentsEndRef.current?.scrollIntoView();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  // Scroll to bottom when a new comment is added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [post.comments]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comments-title"
    >
      <div
        className="w-full h-[85vh] max-h-[700px] bg-[var(--bg-secondary)] rounded-t-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
      >
        <header className="flex-shrink-0 p-4 border-b border-[var(--border-primary)] flex items-center justify-center relative">
            <h2 id="comments-title" className="text-lg font-bold">Comentários</h2>
            <button onClick={onClose} className="absolute right-2 p-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
                <XIcon className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
        </header>

        <main className="flex-grow overflow-y-auto p-4 space-y-4">
            {post.comments.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-secondary)]">
                    <p className="font-bold text-lg">Nenhum comentário ainda.</p>
                    <p>Seja o primeiro a comentar!</p>
                </div>
            ) : (
                post.comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                            {comment.user.avatar ? (
                                <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover"/>
                            ) : (
                                <UserIcon className="w-5 h-5 text-[var(--text-secondary)] opacity-50" />
                            )}
                        </div>
                        <div className="flex-grow">
                            <p>
                                <span className="font-bold text-sm mr-2">{comment.user.name}</span>
                                <span className="text-sm text-[var(--text-tertiary)]">{comment.text}</span>
                            </p>
                            <span className="text-xs text-[var(--text-secondary)] mt-1">{formatTimeAgo(comment.timestamp)}</span>
                        </div>
                    </div>
                ))
            )}
            <div ref={commentsEndRef} />
        </main>
        
        <footer className="flex-shrink-0 p-2 bg-[var(--bg-main)] border-t border-[var(--border-primary)]">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                    {currentUser.profile_image_url ? (
                        <img src={currentUser.profile_image_url} alt="Seu avatar" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-6 h-6 text-[var(--text-secondary)] opacity-50" />
                    )}
                 </div>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-grow p-3 bg-[var(--bg-tertiary)] rounded-full border-2 border-transparent focus:border-[var(--accent-primary)] focus:outline-none focus:ring-0 transition-colors"
                />
                <button
                    type="submit"
                    className="p-3 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:brightness-125 disabled:opacity-50 transition-colors"
                    disabled={!newComment.trim()}
                    aria-label="Publicar comentário"
                >
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        </footer>
      </div>
       <style>
        {`
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
        `}
        </style>
    </div>
  );
};

export default CommentsModal;
