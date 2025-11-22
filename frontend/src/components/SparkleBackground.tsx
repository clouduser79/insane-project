import React, { useState, useEffect, useMemo } from 'react';
import type { SparkleBackgroundProps, SparkleConfig } from '../types';

// Professional color palettes
const PROFESSIONAL_PALETTES = [
  // Deep Blue Professional
  {
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    sparkles: ['#4da0b0', '#a8e063', '#f4d03f', '#e74c3c', '#9b59b6']
  },
  // Corporate Teal
  {
    background: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
    sparkles: ['#00b4db', '#0083b0', '#00b4db', '#00c6ff', '#00b4db']
  },
  // Dark Elegance
  {
    background: 'linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%)',
    sparkles: ['#5d9cec', '#48cfad', '#a0d468', '#ffce54', '#ed5565']
  },
  // Modern Purple
  {
    background: 'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)',
    sparkles: ['#a8ff78', '#78ffd6', '#ff8c66', '#ffb347', '#ffcc33']
  },
  // Deep Ocean
  {
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    sparkles: ['#00c9ff', '#92fe9d', '#ff6b6b', '#ffa3b5', '#d4a5e9']
  },
  // Dark Mode (default)
  {
    background: '#121212',
    sparkles: ['#00e5ff', '#00ff9d', '#ff4d8d', '#ffc107', '#9c27b0']
  }
];

const SparkleBackground: React.FC<SparkleBackgroundProps> = ({
  count = 60,
  defaultPalette = 0,
  forcePalette,
  startTime
}) => {
  const [currentPalette, setCurrentPalette] = useState(defaultPalette);
  const [showSparkles, setShowSparkles] = useState(false);

  // Generate sparkles with full-screen coverage and enhanced brightness
  const [sparkles] = useState<SparkleConfig[]>(() =>
    Array.from({ length: count }, (_, i) => {
      const size = 5 + Math.random() * 10; // Slightly larger sparkles
      return {
        id: i,
        left: Math.random() * 100, // Full viewport width
        top: Math.random() * 100,  // Full viewport height
        delay: Math.random() * 0.7,
        size: size,
        duration: 0.7 + Math.random() * 1,
        opacity: 0.7 + Math.random() * 0.3, // Increased minimum opacity for more brightness
        blur: 3 + Math.random() * 4, // Increased blur for better glow
      };
    })
  );

  // Update palette when forcePalette or startTime changes
  useEffect(() => {
    if (forcePalette !== undefined) {
      setCurrentPalette(forcePalette);
    } else if (startTime) {
      // Reset to default palette when presentation starts/restarts
      setCurrentPalette(defaultPalette);
    }
  }, [forcePalette, startTime, defaultPalette]);

  // Handle palette cycling based on elapsed time
  useEffect(() => {
    if (!startTime) return;

    const updatePalette = () => {
      const elapsed = Date.now() - startTime;
      let newPalette = -1; // Initialize to an invalid value to force update

      if (elapsed >= 88000) {
        newPalette = 5; // Final palette
      } else if (elapsed >= 74000) {
        newPalette = 4;
      } else if (elapsed >= 59000) {
        newPalette = 3;
      } else if (elapsed >= 44000) {
        newPalette = 2;
      } else if (elapsed >= 29000) {
        newPalette = 1;
      } else if (elapsed >= 0) { // Changed from 15000 to 0 to cover the first interval
        newPalette = 0;
      }

      if (newPalette !== -1 && newPalette !== currentPalette) {
        setCurrentPalette(newPalette);
      }
    };

    const interval = setInterval(updatePalette, 1000); // Check every second
    updatePalette(); // Initial check

    return () => clearInterval(interval);
  }, [startTime, currentPalette]);

  // Show sparkles when presentation starts
  useEffect(() => {
    if (startTime) {
      const timer = setTimeout(() => setShowSparkles(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowSparkles(false);
    }
  }, [startTime]);

  // Get the current palette colors
  const currentPaletteData = useMemo(() => {
    const idx = Math.min(currentPalette, PROFESSIONAL_PALETTES.length - 1);
    return PROFESSIONAL_PALETTES[Math.max(0, idx)] || PROFESSIONAL_PALETTES[0];
  }, [currentPalette]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: currentPaletteData.background,
    transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 1,
    zIndex: -10,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  };

  return (
    <div style={containerStyle}>
      {showSparkles && (
        <div className="sparkle-container">
          {sparkles.map((sparkle) => {
            const sparkleColor = currentPaletteData.sparkles[
              Math.floor(Math.random() * currentPaletteData.sparkles.length)
            ];
            
            return (
              <div
                key={sparkle.id}
                className="sparkle"
                style={{
                  '--sparkle-delay': `${sparkle.delay}s`,
                  '--sparkle-duration': `${sparkle.duration}s`,
                  '--sparkle-size': `${sparkle.size}px`,
                  '--sparkle-color': sparkleColor,
                  '--sparkle-opacity': sparkle.opacity,
                  '--sparkle-blur': `${sparkle.blur}px`,
                  left: `${sparkle.left}vw`,
                  top: `${sparkle.top}vh`,
                  filter: `blur(${sparkle.blur}px) brightness(1.5)`,
                  willChange: 'transform, opacity',
                  pointerEvents: 'none', // Ensure clicks go through sparkles
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SparkleBackground;