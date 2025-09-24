
// FIX: Replaced placeholder content with a functional LoginScreen component.
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import GradientButton from './GradientButton';
import { FacebookIcon, GoogleIcon } from './IconComponents';

interface LoginScreenProps {
    onContinueAsVisitor: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsVisitor }) => {
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
    
    const handleSocialLogin = async (provider: 'facebook' | 'google') => {
        setLoading(true);
        setError(null);
        try {
            // REMOVED the hardcoded redirectTo option. Supabase will now use the current URL.
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white p-6 animate-fadeIn">
            <img src="https://i.postimg.cc/htGw97By/Sem-Ti-tulo-1.png" alt="MEU ESTILO Logo" className="w-24 h-auto mb-8" />
            
            <h1 className="text-3xl font-bold mb-2">{isSignUp ? 'Crie sua Conta' : 'Bem-vindo de Volta!'}</h1>
            <p className="text-gray-400 mb-8">{isSignUp ? 'Comece sua jornada de estilo.' : 'Faça login para continuar.'}</p>
            
            {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm w-full text-center">{error}</p>}

            <form onSubmit={handleAuth} className="w-full space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-gray-900 rounded-lg border-2 border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={loading}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-gray-900 rounded-lg border-2 border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={loading}
                    required
                />
                <GradientButton type="submit" disabled={loading}>
                    {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
                </GradientButton>
            </form>

            <div className="my-6 flex items-center w-full">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="w-full space-y-3">
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-gray-900 rounded-lg border-2 border-gray-700 hover:border-gray-500 transition-colors"
                    disabled={loading}
                >
                    <GoogleIcon className="w-6 h-6" />
                    <span className="font-semibold">{isSignUp ? 'Continue com Google' : 'Entrar com Google'}</span>
                </button>
                <button
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-gray-900 rounded-lg border-2 border-gray-700 hover:border-blue-600 transition-colors"
                    disabled={loading}
                >
                    <FacebookIcon className="w-6 h-6 text-[#1877F2]" />
                    <span className="font-semibold">{isSignUp ? 'Continue com Facebook' : 'Entrar com Facebook'}</span>
                </button>
            </div>
            
            <div className="my-4 text-center text-sm">
                <button onClick={onContinueAsVisitor} className="font-semibold text-gray-400 hover:text-white underline transition-colors">
                    Continuar como Visitante
                </button>
            </div>

            <p className="mt-4 text-gray-400">
                {isSignUp ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-blue-400 hover:underline">
                    {isSignUp ? 'Faça Login' : 'Inscreva-se'}
                </button>
            </p>
        </div>
    );
};

export default LoginScreen;