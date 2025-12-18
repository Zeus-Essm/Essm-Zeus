
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import GradientButton from './GradientButton';
import { GoogleIcon } from './IconComponents';

interface LoginScreenProps {
    // onContinueAsVisitor removed as the visitor system no longer exists
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Verifique seu e-mail para o link de confirmação!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSocialLogin = async (provider: 'google') => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin, 
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)] p-6 animate-fadeIn">
            <img src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" alt="PUMP Logo" className="w-24 h-auto mb-8 animate-logo-pulse" />
            
            <h1 className="text-3xl font-bold mb-2 text-glow text-[var(--accent-primary)] opacity-90">{isSignUp ? 'Crie sua Conta' : 'Bem-vindo ao PUMP'}</h1>
            <p className="text-[var(--text-secondary)] mb-8 text-center">{isSignUp ? 'Comece sua jornada de estilo real.' : 'Faça login para gerenciar seu espaço.'}</p>
            
            {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm w-full text-center">{error}</p>}

            <form onSubmit={handleAuth} className="w-full space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    disabled={loading}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    disabled={loading}
                    required
                />
                <GradientButton type="submit" disabled={loading}>
                    {loading ? 'Carregando...' : (isSignUp ? 'Criar Minha Conta' : 'Entrar')}
                </GradientButton>
            </form>

            <div className="my-6 flex items-center w-full">
                <div className="flex-grow border-t border-[var(--accent-primary)]/20"></div>
                <span className="flex-shrink mx-4 text-zinc-500 text-sm">OU</span>
                <div className="flex-grow border-t border-[var(--accent-primary)]/20"></div>
            </div>
            
            <div className="w-full space-y-3">
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-white text-zinc-800 rounded-lg border-2 border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all shadow-sm"
                    disabled={loading}
                >
                    <GoogleIcon className="w-6 h-6" />
                    <span className="font-semibold">Entrar com Google</span>
                </button>
            </div>
            
            <p className="mt-8 text-[var(--text-secondary)]">
                {isSignUp ? 'Já tem uma conta? ' : 'Novo por aqui? '}
                <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-[var(--accent-primary)] hover:underline">
                    {isSignUp ? 'Faça Login' : 'Cadastre-se'}
                </button>
            </p>
            
            <div className="mt-6 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/40">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">✓ Sistema Atualizado: Real Space Mode</span>
            </div>
        </div>
    );
};

export default LoginScreen;
