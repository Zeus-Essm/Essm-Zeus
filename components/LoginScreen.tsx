
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
        <div className="relative flex flex-col items-center justify-center min-h-full w-full bg-[#FFFFFF] overflow-hidden p-8 animate-fadeIn font-sans">
            <div className="w-full max-w-sm z-10">
                <div className="text-center mb-10 flex flex-col items-center">
                    <img 
                      src="https://i.postimg.cc/L4190LN2/PUMP-startup-2.png" 
                      alt="PUMP Logo" 
                      className="h-16 w-auto mb-6 animate-logo-pulse" 
                    />
                    {isSignUp && (
                      <div className="animate-slideUp">
                        <h1 className="text-4xl font-bold text-[#F59E0B] leading-tight mb-2">
                            Criar Conta
                        </h1>
                        <p className="text-lg text-zinc-500">
                            Preencha os dados para começar.
                        </p>
                      </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-500/5 border border-red-500/10 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold animate-slideUp flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-zinc-400 ml-4 tracking-[0.15em]">E-mail</label>
                        <input
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all text-sm font-semibold text-zinc-900 placeholder:text-zinc-300 shadow-sm"
                            disabled={loading}
                            required
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                         <div className="flex justify-between items-center px-4">
                            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.15em]">Senha</label>
                            {!isSignUp && <button type="button" className="text-[10px] font-black uppercase text-[#F59E0B] hover:text-amber-700 transition-colors">Esqueci</button>}
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all text-sm font-semibold text-zinc-900 placeholder:text-zinc-300 shadow-sm"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-[#F59E0B] hover:bg-amber-400 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processando...' : (isSignUp ? 'Finalizar Cadastro' : 'Entrar agora')}
                        </button>
                    </div>
                </form>

                <div className="mt-8 flex flex-col items-center gap-6">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:text-zinc-800 transition-colors"
                    >
                        {isSignUp ? 'Já possui conta? Entrar agora' : 'Não tem conta? Cadastre-se grátis'}
                    </button>

                    <div className="w-full flex items-center gap-4">
                        <div className="flex-grow h-[1px] bg-zinc-100"></div>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">ou</span>
                        <div className="flex-grow h-[1px] bg-zinc-100"></div>
                    </div>
                    
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-white text-zinc-700 rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-sm"
                        disabled={loading}
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="font-bold text-xs uppercase tracking-widest text-zinc-600">Continuar com Google</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                <a href="/terms.html" className="hover:text-[#F59E0B] transition-colors">Termos</a>
                <a href="/privacy.html" className="hover:text-[#F59E0B] transition-colors">Privacidade</a>
            </div>
        </div>
    );
};

export default LoginScreen;
