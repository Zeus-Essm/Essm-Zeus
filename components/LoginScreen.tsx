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
                toast('Verifique seu e-mail para confirmar o cadastro!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            toast.error(err.message || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSocialLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message || 'Erro ao entrar com Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-between min-h-full w-full bg-[#FFFFFF] p-8 animate-fadeIn font-sans">
            {/* Top Section: Logo */}
            <div className="flex-grow flex flex-col items-center justify-center w-full max-w-sm">
                <img 
                    src="https://i.postimg.cc/L4190LN2/PUMP_startup_2.png" 
                    alt="PUMP Logo" 
                    className="h-16 w-auto mb-16 animate-logo-pulse" 
                />

                {/* Form Section */}
                <form onSubmit={handleAuth} className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-[#94a3b8] ml-4 tracking-[0.2em]">E-mail</label>
                        <input
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-5 bg-[#f8fafc] rounded-[1.2rem] border border-transparent focus:bg-white focus:border-[#F59E0B]/30 focus:outline-none transition-all text-sm font-semibold text-zinc-900 placeholder:text-[#cbd5e1]"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-4">
                            <label className="text-[11px] font-black uppercase text-[#94a3b8] tracking-[0.2em]">Senha</label>
                            <button type="button" className="text-[10px] font-black uppercase text-[#F59E0B] tracking-[0.1em]">Esqueci</button>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-5 bg-[#f8fafc] rounded-[1.2rem] border border-transparent focus:bg-white focus:border-[#F59E0B]/30 focus:outline-none transition-all text-sm font-semibold text-zinc-900 placeholder:text-[#cbd5e1]"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 mt-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[1.2rem] shadow-[0_12px_24px_rgba(245,158,11,0.25)] active:scale-[0.97] transition-all disabled:opacity-50"
                    >
                        {loading ? 'CARREGANDO...' : (isSignUp ? 'CRIAR MINHA CONTA' : 'ENTRAR AGORA')}
                    </button>
                </form>

                <div className="w-full mt-10 text-center space-y-8">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94a3b8] hover:text-zinc-800 transition-colors"
                    >
                        {isSignUp ? 'JÁ TEM CONTA? ENTRAR AGORA' : 'NÃO TEM CONTA? CADASTRE-SE GRÁTIS'}
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex-grow h-[1px] bg-zinc-100"></div>
                        <span className="text-[9px] font-black text-[#cbd5e1] uppercase tracking-[0.3em]">ou</span>
                        <div className="flex-grow h-[1px] bg-zinc-100"></div>
                    </div>
                    
                    <button
                        onClick={handleSocialLogin}
                        className="w-full flex items-center justify-center gap-3 p-5 bg-white text-zinc-700 rounded-[1.2rem] border border-zinc-100 hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-sm group"
                        disabled={loading}
                    >
                        <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-600">Continuar com Google</span>
                    </button>
                </div>
            </div>

            {/* Footer Section */}
            <div className="w-full py-8 flex justify-center gap-10 text-[9px] font-black uppercase text-[#cbd5e1] tracking-[0.3em]">
                <a href="/terms.html" className="hover:text-[#F59E0B] transition-colors">Termos</a>
                <a href="/privacy.html" className="hover:text-[#F59E0B] transition-colors">Privacidade</a>
            </div>
        </div>
    );
};

export default LoginScreen;