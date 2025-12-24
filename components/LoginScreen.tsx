
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { GoogleIcon } from './IconComponents';
import { toast } from '../utils/toast';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignUp }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
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
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-white p-8 animate-fadeIn font-sans select-none overflow-y-auto">
            <div className="w-full max-w-sm flex flex-col items-center py-10">
                
                {/* Logo PUMP - Cópia Fiel da Imagem */}
                <div className="flex text-[84px] font-black lowercase tracking-tighter mb-20 leading-none">
                  <span className="text-[#FFC107]">p</span>
                  <span className="text-[#2D336B]">u</span>
                  <span className="text-[#0EA5E9]">m</span>
                  <span className="text-[#F44336]">p</span>
                </div>

                <form onSubmit={handleAuth} className="w-full space-y-6">
                    {/* Campo E-mail */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.25em] ml-4">
                            E-mail
                        </label>
                        <input
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 focus:border-amber-500/30 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 placeholder:text-zinc-300 shadow-sm"
                            disabled={loading}
                            required
                        />
                    </div>
                    
                    {/* Campo Senha */}
                    <div className="space-y-2">
                         <div className="flex justify-between items-center px-4">
                            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                                Senha
                            </label>
                            <button type="button" className="text-[11px] font-black uppercase text-amber-500 hover:text-amber-600 transition-colors tracking-widest">
                                Esqueci
                            </button>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 focus:border-amber-500/30 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 placeholder:text-zinc-300 shadow-sm"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Botão Entrar Agora */}
                    <div className="pt-8">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-6 bg-[#F59E0B] hover:bg-amber-500 text-white font-black uppercase text-[13px] tracking-[0.25em] rounded-[1.5rem] shadow-[0_12px_24px_rgba(245,158,11,0.25)] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Aguarde...' : 'Entrar agora'}
                        </button>
                    </div>
                </form>

                <div className="mt-12 flex flex-col items-center w-full gap-8">
                    <button
                        onClick={onNavigateToSignUp}
                        className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-800 transition-colors"
                    >
                        Não tem conta? Cadastre-se grátis
                    </button>

                    <div className="w-full flex items-center gap-5">
                        <div className="flex-grow h-[1px] bg-zinc-100"></div>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">ou</span>
                        <div className="flex-grow h-[1px] bg-zinc-100"></div>
                    </div>
                    
                    {/* Botão Google */}
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center gap-4 p-5 bg-white text-zinc-700 rounded-[1.5rem] border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-sm"
                        disabled={loading}
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="font-bold text-[11px] uppercase tracking-[0.18em] text-zinc-600">Continuar com Google</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto py-8 w-full flex justify-center gap-14 text-[10px] font-black uppercase text-zinc-300 tracking-[0.4em]">
                <a href="/terms.html" className="hover:text-zinc-500 transition-colors">Termos</a>
                <a href="/privacy.html" className="hover:text-zinc-500 transition-colors">Privacidade</a>
            </div>
        </div>
    );
};

export default LoginScreen;
