import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { GoogleIcon } from './IconComponents';
import { toast } from '../utils/toast';

interface LoginScreenProps {
  onNavigateToSignUp?: () => void;
  onSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!email || !password) {
            toast.error("Preencha todos os campos.");
            return;
        }
        
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0]
                        }
                    }
                });
                if (error) throw error;
                toast.success("Conta criada! Verifique seu e-mail.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (onSuccess) onSuccess();
            }
        } catch (err: any) {
            toast.error(err.message || "Erro na autenticação.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSocialLogin = async (provider: 'google') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="relative flex flex-col min-h-[100dvh] w-full bg-white animate-fadeIn font-sans select-none overflow-y-auto overflow-x-hidden">
            <div className="flex-grow flex flex-col items-center justify-center px-8 py-6">
                <div className="w-full max-w-sm flex flex-col items-center">
                    
                    <div className="flex text-[64px] sm:text-[72px] font-black lowercase tracking-tighter mb-8 sm:mb-12 leading-none">
                      <span className="text-[#FFC107]">p</span>
                      <span className="text-[#2D336B]">u</span>
                      <span className="text-[#0EA5E9]">m</span>
                      <span className="text-[#F44336]">p</span>
                    </div>

                    <form onSubmit={handleAuth} className="w-full space-y-4 sm:space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-4">
                                E-mail
                            </label>
                            <input
                                type="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-zinc-50 rounded-[1.25rem] border border-zinc-100 focus:border-amber-500/30 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 placeholder:text-zinc-300 shadow-sm"
                                disabled={loading}
                                required
                            />
                        </div>
                        
                        <div className="space-y-1">
                             <div className="flex justify-between items-center px-4">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                                    Senha
                                </label>
                                {!isSignUp && (
                                    <button type="button" className="text-[10px] font-black uppercase text-amber-500 hover:text-amber-600 transition-colors tracking-widest">
                                        Esqueci
                                    </button>
                                )}
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-zinc-50 rounded-[1.25rem] border border-zinc-100 focus:border-amber-500/30 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 placeholder:text-zinc-300 shadow-sm"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-5 bg-[#F59E0B] hover:bg-amber-500 text-white font-black uppercase text-[12px] tracking-[0.2em] rounded-[1.25rem] shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Aguarde...' : (isSignUp ? 'Criar minha conta' : 'Entrar na conta')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 sm:mt-8 flex flex-col items-center w-full gap-5">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:text-zinc-800 transition-colors"
                        >
                            {isSignUp ? 'Já possui conta? Faça Login' : 'Ainda não tem conta? Cadastre-se agora'}
                        </button>

                        <div className="w-full flex items-center gap-4">
                            <div className="flex-grow h-[1px] bg-zinc-100"></div>
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em]">ou</span>
                            <div className="flex-grow h-[1px] bg-zinc-100"></div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-white text-zinc-700 rounded-[1.25rem] border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-sm"
                            disabled={loading}
                        >
                            <GoogleIcon className="w-5 h-5" />
                            <span className="font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-600">Continuar com Google</span>
                        </button>
                    </div>
                </div>
            </div>

            <footer className="py-4 sm:py-6 w-full flex justify-center gap-8 text-[9px] font-black uppercase text-zinc-300 tracking-[0.3em] bg-white border-t border-zinc-50">
                <a href="/privacy.html" className="hover:text-zinc-500 transition-colors">Termos</a>
                <a href="/privacy.html" className="hover:text-zinc-500 transition-colors">Privacidade</a>
            </footer>
        </div>
    );
};

export default LoginScreen;