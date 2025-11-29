
import React, { useEffect, useState } from 'react';

const COIN_COUNT = 20;

const CoinBurst: React.FC = () => {
  const [coins, setCoins] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const newCoins = Array.from({ length: COIN_COUNT }).map((_, i) => {
      // Random direction and distance
      const angle = Math.random() * Math.PI * 2;
      const velocity = 150 + Math.random() * 200; // Distance traveled
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity + 100; // Add gravity effect (y moves down)
      const rot = 720 + Math.random() * 720; // Multiple rotations

      return {
        id: i,
        style: {
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--rot': `${rot}deg`,
          animation: `coin-explosion 1.5s ease-out forwards`,
          animationDelay: `${Math.random() * 0.2}s`
        } as React.CSSProperties
      };
    });

    setCoins(newCoins);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex items-center justify-center">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="coin-burst-item"
          style={coin.style}
        >
          $
        </div>
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-[#f59e0b] text-glow animate-slideUp" style={{ animationDuration: '2s' }}>
        +50 PTS
      </div>
    </div>
  );
};

export default CoinBurst;
