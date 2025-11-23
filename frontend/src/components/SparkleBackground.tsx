import React, { useState, useEffect, useMemo } from 'react';
import type { SparkleBackgroundProps, SparkleConfig } from '../types';

const PROFESSIONAL_PALETTES = [
  // Deep Navy Gradient
  {
    background: 'linear-gradient(135deg, #0a1929 0%, #1a365d 50%, #2c5282 100%)',
    sparkles: ['#63b3ed', '#4fd1c5', '#f6ad55', '#f687b3', '#9f7aea']
  },
  // Slate Blue Gradient
  {
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
    sparkles: ['#68d391', '#f6e05e', '#f6ad55', '#f687b3', '#9f7aea']
  },
  // Deep Teal Gradient
  {
    background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #2b6cb0 100%)',
    sparkles: ['#90cdf4', '#63b3ed', '#f6e05e', '#f6ad55', '#f687b3']
  },
  // Dark Charcoal Gradient
  {
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
    sparkles: ['#f6e05e', '#f6ad55', '#f687b3', '#9f7aea', '#68d391']
  },
  // Deep Indigo Gradient
  {
    background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #718096 100%)',
    sparkles: ['#f6ad55', '#f687b3', '#9f7aea', '#68d391', '#4fd1c5']
  },
  // Cool Gray Gradient
  {
    background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #718096 100%)',
    sparkles: ['#f687b3', '#9f7aea', '#68d391', '#4fd1c5', '#63b3ed']
  }
];

const SparkleBackground: React.FC<SparkleBackgroundProps> = ({
  count = 62,
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
    if (forcePalette != undefined) {
      setCurrentPalette(forcePalette);
    } else if (startTime) {
      // Reset to default palette when presentation starts/restarts
      setCurrentPalette(defaultPalette);
    }
  }, [forcePalette, startTime, defaultPalette]);

  // Handle palette cycling based on elapsed time
  useEffect(() => {
    if (!startTime) return;

    // Set initial palette immediately
    setCurrentPalette(0);

    const updatePalette = () => {
      const elapsed = Date.now() - startTime;
      let newPalette = 0; // Start with the first palette

      if (elapsed >= 90000) {
        newPalette = 6;
      } else if (elapsed >= 75000) {
        newPalette = 5;
      } else if (elapsed >= 60000) {
        newPalette = 4;
      } else if (elapsed >= 45000) {
        newPalette = 3;
      } else if (elapsed >= 30000) {
        newPalette = 2;
      } else if (elapsed >= 15000) {
        newPalette = 1;
      }

      if (newPalette !== currentPalette) {
        setCurrentPalette(newPalette);
      }
    };

    const interval = setInterval(updatePalette);
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