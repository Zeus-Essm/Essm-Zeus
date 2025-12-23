
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { GoogleIcon } from './IconComponents';
import { toast } from '../utils/toast';

const LoginScreen: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                toast('Verifique seu e-mail para confirmar a conta!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            toast.error(err.message || 'Erro ao autenticar.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSocialLogin = async (provider: 'google') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin, 
                },
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message || 'Erro no login social.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-white p-8 animate-fadeIn font-sans select-none">
            <div className="w-full max-w-sm flex flex-col items-center">
                
                {/* Logo PUMP estilizado conforme o Print */}
                <div className="flex text-7xl font-black lowercase tracking-tighter mb-16">
                  <span className="text-[#FFC107]">p</span>
                  <span className="text-[#9C27B0]">u</span>
                  <span className="text-[#2196F3]">m</span>
                  <span className="text-[#F44336]">p</span>
                </div>

                <form onSubmit={handleAuth} className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-4">
                            E-mail
                        </label>
                        <input
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 focus:border-amber-500/30 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 placeholder:text-zinc-300"
                            disabled={loading}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
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
                            className="w-full p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 focus:border-amber-500/30 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 placeholder:text-zinc-300"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-5 bg-[#F59E0B] hover:bg-amber-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] shadow-[0_12px_24px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Aguarde...' : (isSignUp ? 'Finalizar Cadastro' : 'Entrar agora')}
                        </button>
                    </div>
                </form>

                <div className="mt-8 flex flex-col items-center w-full gap-6">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-800 transition-colors"
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
                        className="w-full flex items-center justify-center gap-3 p-5 bg-white text-zinc-700 rounded-[1.5rem] border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-600">Continuar com Google</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-12 text-[10px] font-black uppercase text-zinc-300 tracking-[0.3em]">
                <a href="/terms.html" className="hover:text-amber-500 transition-colors">Termos</a>
                <a href="/privacy.html" className="hover:text-amber-500 transition-colors">Privacidade</a>
            </div>
        </div>
    );
};

export default LoginScreen;
