
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from '../utils/toast';
import { GoogleIcon } from './IconComponents';

const LoginScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return toast.error("Preencha todos os campos.");
        
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });
                if (error) throw error;
                toast.success("Conta criada! Verifique seu e-mail.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            toast.error(err.message || "Erro na autenticação.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error("Erro ao conectar com Google.");
        }
    };

    return (
        <div className="flex flex-col items-center h-full w-full bg-white font-sans overflow-y-auto px-10 pt-24 pb-10">
            {/* Logo Centralizada */}
            <div className="mb-20 shrink-0">
                <img 
                    src="https://i.postimg.cc/L4190LN2/PUMP_startup_2.png" 
                    alt="PUMP" 
                    className="h-16 w-auto object-contain" 
                />
            </div>

            <form onSubmit={handleAuth} className="w-full max-w-sm space-y-7">
                {isSignUp && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                        <input
                            type="text"
                            placeholder="Seu nome"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-5 bg-zinc-50 rounded-[1.8rem] border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/20 transition-all placeholder:text-zinc-300"
                            required
                        />
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">E-mail</label>
                    <input
                        type="email"
                        placeholder="exemplo@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-5 bg-zinc-50 rounded-[1.8rem] border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/20 transition-all placeholder:text-zinc-300"
                        required
                        autoCapitalize="none"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Senha</label>
                        {!isSignUp && (
                            <button type="button" className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:underline">Esqueci</button>
                        )}
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-5 bg-zinc-50 rounded-[1.8rem] border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/20 transition-all placeholder:text-zinc-300"
                        required
                    />
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-[#F59E0B] text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-[1.8rem] shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? "Processando..." : (isSignUp ? "Criar Conta" : "Entrar Agora")}
                    </button>
                </div>
            </form>

            <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="mt-10 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
                {isSignUp ? "Já tem conta? Entrar Agora" : "Não tem conta? Cadastre-se grátis"}
            </button>

            {/* Divisor OU */}
            <div className="w-full max-w-sm flex items-center gap-4 my-12">
                <div className="h-[1px] flex-grow bg-zinc-100"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">OU</span>
                <div className="h-[1px] flex-grow bg-zinc-100"></div>
            </div>

            {/* Botão Google */}
            <button 
                onClick={handleGoogleLogin}
                className="w-full max-w-sm flex items-center justify-center gap-3 py-5 bg-white border border-zinc-100 rounded-[1.8rem] shadow-sm hover:bg-zinc-50 active:scale-[0.98] transition-all group"
            >
                <GoogleIcon className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-800">Continuar com Google</span>
            </button>

            {/* Links de Rodapé */}
            <div className="mt-auto pt-16 flex gap-10">
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 hover:text-zinc-400 transition-colors">Termos</button>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 hover:text-zinc-400 transition-colors">Privacidade</button>
            </div>
        </div>
    );
};

export default LoginScreen;
