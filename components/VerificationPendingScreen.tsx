import React, { useEffect, useState } from 'react';

const Spinner: React.FC = () => (
    <svg className="animate-spin h-12 w-12 text-[var(--accent-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const messages = [
    "Analisando seus documentos...",
    "Verificando foto com identidade...",
    "Confirmando autenticidade...",
    "Quase pronto...",
];

interface VerificationPendingScreenProps {
    onComplete: () => void;
}

const VerificationPendingScreen: React.FC<VerificationPendingScreenProps> = ({ onComplete }) => {
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 1500);

        const completeTimer = setTimeout(() => {
            clearInterval(intervalId);
            onComplete();
        }, messages.length * 1500 + 500);

        return () => {
            clearInterval(intervalId);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)] text-center p-6 animate-fadeIn">
            <Spinner />
            <h2 className="text-2xl font-bold mt-8 mb-2 text-glow text-[var(--accent-primary)] opacity-90">Em Análise</h2>
            <p className="text-[var(--accent-primary)]/80 transition-opacity duration-500">{message}</p>
        </div>
    );
};

export default VerificationPendingScreen;
