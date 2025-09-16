import React from 'react';

interface LoadingIndicatorProps {
    userImage: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ userImage }) => {
    const messages = [
        "Ajustando o caimento perfeito...",
        "Consultando nossos estilistas de IA...",
        "Tecendo pixels para criar seu look...",
        "Quase pronto! Finalizando os detalhes...",
    ];

    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 3000);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full text-white text-center p-6 animate-fadeIn">
            <div className="relative w-48 h-64 rounded-2xl mb-8 animate-gradient-pulse">
                <img src={userImage} alt="Sua foto sendo processada" className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-gray-900/30 rounded-2xl"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Gerando seu visual...</h2>
            <p className="text-sky-300 transition-opacity duration-500">{message}</p>
        </div>
    );
};

export default LoadingIndicator;