
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import GradientButton from './GradientButton';
import { GoogleIcon } from './IconComponents';

const LoginScreen: React.FC = () => {
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
        <div className="relative flex flex-col items-center justify-center min-h-full w-full bg-[var(--bg-main)] overflow-hidden p-8 animate-fadeIn">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl"></div>
            
            <div className="w-full max-w-sm z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 p-1 bg-white rounded-2xl shadow-2xl shadow-amber-500/10 border border-zinc-100 flex items-center justify-center animate-logo-pulse">
                        <img src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" alt="PUMP Logo" className="w-14 h-auto" />
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-8 border border-zinc-200 dark:border-zinc-800">
                    <button 
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${!isSignUp ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Entrar
                    </button>
                    <button 
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${isSignUp ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Criar Conta
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold animate-slideUp flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0 animate-pulse"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-3 tracking-[0.1em]">E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:border-[var(--accent-primary)] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold text-[var(--text-primary)] placeholder:text-zinc-300 shadow-inner"
                            disabled={loading}
                            required
                        />
                    </div>
                    
                    <div className="space-y-1">
                         <div className="flex justify-between items-center px-3">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em]">Senha</label>
                            {!isSignUp && <button type="button" className="text-[10px] font-black uppercase text-amber-600 hover:underline">Esqueci</button>}
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:border-[var(--accent-primary)] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold text-[var(--text-primary)] placeholder:text-zinc-300 shadow-inner"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <GradientButton 
                            type="submit" 
                            disabled={loading}
                            className="!rounded-2xl !py-4 shadow-xl shadow-amber-500/20 active:scale-95 !text-black !bg-[var(--accent-primary)] !border-none font-black text-sm transition-transform"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Aguarde...
                                </div>
                            ) : (isSignUp ? 'Criar Conta Agora' : 'Entrar na Plataforma')}
                        </GradientButton>
                    </div>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="flex-grow h-px bg-zinc-100 dark:bg-zinc-800"></div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">ou</span>
                    <div className="flex-grow h-px bg-zinc-100 dark:bg-zinc-800"></div>
                </div>
                
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-white dark:bg-zinc-900 text-[var(--text-primary)] rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-98"
                    disabled={loading}
                >
                    <GoogleIcon className="w-5 h-5" />
                    <span className="font-bold text-sm">Continuar com Google</span>
                </button>
            </div>

            {/* Update Confirmation Seal */}
            <div className="fixed top-6 right-6 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-50 flex items-center gap-1.5 animate-bounce">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LOGIN ATUALIZADO
            </div>

            {/* Legal Links */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-[10px] font-black uppercase text-zinc-300 tracking-widest">
                <a href="/terms.html" className="hover:text-zinc-500 transition-colors">Termos</a>
                <span>•</span>
                <a href="/privacy.html" className="hover:text-zinc-500 transition-colors">Privacidade</a>
            </div>
        </div>
    );
};

export default LoginScreen;
