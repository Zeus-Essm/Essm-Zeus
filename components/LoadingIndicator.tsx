
import React from 'react';

interface LoadingIndicatorProps {
    userImage: string;
    customMessage?: string | null;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ userImage, customMessage }) => {
    const defaultMessages = [
        "Ajustando o caimento perfeito...",
        "Consultando nossos estilistas de IA...",
        "Tecendo pixels para criar seu look...",
        "Quase pronto! Finalizando os detalhes...",
    ];

    const [message, setMessage] = React.useState(customMessage || defaultMessages[0]);

    React.useEffect(() => {
        if (customMessage) {
            setMessage(customMessage);
            return;
        }

        setMessage(defaultMessages[0]);
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % defaultMessages.length;
            setMessage(defaultMessages[index]);
        }, 3000);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customMessage]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full text-[var(--text-primary)] text-center p-6 animate-fadeIn">
            <div className="relative w-48 h-64 rounded-2xl mb-8 animate-gold-pulse">
                <img src={userImage} alt="Sua foto sendo processada" className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-glow text-[var(--accent-primary)] opacity-90">Gerando seu visual...</h2>
            <p className="text-[var(--accent-primary)]/80 transition-opacity duration-500">{message}</p>
        </div>
    );
};

export default LoadingIndicator;