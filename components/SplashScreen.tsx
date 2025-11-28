import React, { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onContinue: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    // We want to trigger the exit only once
    let hasExited = false;
    const handleInteraction = () => {
      if (hasExited) return;
      hasExited = true;
      setIsExiting(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleInteraction();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setGlowPosition({ x: e.clientX, y: e.clientY });
  };

  const handleAnimationEnd = () => {
    if (isExiting) {
      onContinue();
    }
  };

  return (
    <div 
        className={`fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] ${isExiting ? 'animate-fade-out' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsGlowing(true)}
        onMouseLeave={() => setIsGlowing(false)}
        onAnimationEnd={handleAnimationEnd}
    >
      <div 
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: glowPosition.x,
          top: glowPosition.y,
          width: 400,
          height: 400,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0) 70%)',
          opacity: isGlowing ? 1 : 0,
        }}
      />
      
      <div className="relative text-center">
        <h1 className="text-7xl md:text-9xl font-bold text-white tracking-wider">
          Multi<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Gen</span>
        </h1>
        <p className="mt-8 text-gray-500 animate-pulse tracking-widest text-lg">
          Click or press space to continue
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;