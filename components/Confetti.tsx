
import React, { useMemo } from 'react';

const CONFETTI_COUNT = 150;
const THEME_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ec4899', '#f9a8d4', '#3b82f6'];

export const Confetti: React.FC = () => {
    const confettiPieces = useMemo(() => 
        Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
            key: i,
            style: {
                // @ts-ignore
                '--x-start': `${Math.random() * 100}vw`,
                '--x-end': `${Math.random() * 100}vw`,
                '--y-end': `${Math.random() * 200 + 800}px`,
                '--bg': THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)],
                '--delay': `${Math.random() * 5}s`,
                '--duration': `${Math.random() * 3 + 4}s`,
                '--rotation-start': `${Math.random() * 360}deg`,
                '--rotation-end': `${Math.random() * 1440 + 360}deg`,
            }
        }))
    , []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiPieces.map(piece => (
                <div 
                    key={piece.key} 
                    className="confetti-piece"
                    style={piece.style}
                ></div>
            ))}
            <style>{`
                .confetti-piece {
                    position: absolute;
                    width: 10px;
                    height: 20px;
                    background-color: var(--bg);
                    top: -20px;
                    left: var(--x-start);
                    opacity: 0;
                    animation: fall var(--duration) var(--delay) linear infinite;
                }

                @keyframes fall {
                    0% {
                        transform: translateY(0vh) rotate(var(--rotation-start));
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(var(--rotation-end));
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};