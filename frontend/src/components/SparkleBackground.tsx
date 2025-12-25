import React, { useState, useEffect, useMemo, memo } from 'react';
import type { SparkleBackgroundProps, SparkleConfig } from '../types';

const PROFESSIONAL_PALETTES = [
  // Navy Blue
  {
    background: 'linear-gradient(135deg, #001a33 0%, #003366 50%, #004080 100%)',
    sparkles: ['#003366', '#004080', '#4d79ff', '#6699ff', '#99c2ff']
  },
  // Green Bay Packers (Green & Gold)
  {
    background: 'linear-gradient(135deg, #203731 0%, #3b5e3f 50%, #ffb612 100%)',
    sparkles: ['#3b5e3f', '#4a7c4e', '#ffb612', '#ffd700', '#fff5cc']
  },
  // Jacksonville Jaguars (Teal, Gold, Black)
  {
    background: 'linear-gradient(135deg, #006778 0%, #008eaa 50%, #006778 100%)',
    sparkles: ['#006778', '#008eaa', '#d7a22a', '#ffc72c', '#9f7928']
  },
  // Tampa Bay Buccaneers (Red, Pewter, Orange)
  {
    background: 'linear-gradient(135deg, #910202ff 0%, #ff7900 50%, #efa404ff 100%)',
    sparkles: ['#d50a0a', '#ff4d4d', '#b1b2b4', '#ff7900', '#ffa64d']
  },
  // Buffalo Bills (Red, Royal Blue, White)
  {
    background: 'linear-gradient(135deg, #00338d 0%, #c60c30 50%, #09458eff 100%)',
    sparkles: ['#00338d', '#1a4da6', '#c60c30', '#ff4d4d', '#ffffff']
  },
  // Washington Commanders (Burgundy, Gold, Black)
  {
    background: 'linear-gradient(135deg, #5a1414 0%, #773141 50%, #ffb612 100%)',
    sparkles: ['#5a1414', '#773141', '#ffb612', '#d4af37', '#9f7928']
  },
  // Baltimore Ravens (Purple, Black, Gold)
  {
    background: 'linear-gradient(135deg, #241773 0%, #2c1f5d 50%, #9e7c0c 100%)',
    sparkles: ['#241773', '#3d2d8a', '#9e7c0c', '#c9a01e', '#e6c04f']
  }
];

// Memoized Sparkle component to prevent unnecessary re-renders
const Sparkle = memo(({ sparkle }: { sparkle: SparkleConfig & { color: string } }) => (
  <div
    className="sparkle"
    style={{
      '--sparkle-delay': `${sparkle.delay}s`,
      '--sparkle-duration': `${sparkle.duration}s`,
      '--sparkle-size': `${sparkle.size}px`,
      '--sparkle-color': sparkle.color,
      '--sparkle-opacity': sparkle.opacity,
      '--sparkle-blur': `${sparkle.blur}px`,
      left: `${sparkle.left}vw`,
      top: `${sparkle.top}vh`,
      filter: `blur(${sparkle.blur}px) brightness(1.5)`,
      willChange: 'transform, opacity',
      pointerEvents: 'none',
    } as React.CSSProperties}
  />
));

const SparkleBackground: React.FC<SparkleBackgroundProps> = ({
  count = 30, // Reduced default count for better performance
  defaultPalette = 1, // Start at index 1 (Green Bay Packers)
  forcePalette,
  startTime
}) => {
  const [currentPalette, setCurrentPalette] = useState(defaultPalette);
  const [showSparkles, setShowSparkles] = useState(false);

  // Memoize sparkles generation with consistent timing and viewport-constrained positioning
  const sparkles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 8 + Math.random() * 12; // Increased base size and range
      // Calculate position with padding to keep sparkles fully visible
      const maxLeft = 95; // 100% - (sparkle size as percentage)
      const maxTop = 95;  // 100% - (sparkle size as percentage)
      return {
        id: i,
        left: 2.5 + Math.random() * maxLeft,  // 2.5% padding from edges
        top: 2.5 + Math.random() * maxTop,    // 2.5% padding from edges
        delay: Math.random() * 1.5, // Slightly more varied delay
        size,
        duration: 1 + Math.random() * 0.5, // Consistent duration range
        opacity: 0.6 + Math.random() * 0.4, // Slightly more consistent opacity
        blur: 3 + Math.random() * 4,
        color: PROFESSIONAL_PALETTES[0]?.sparkles[
          Math.floor(Math.random() * PROFESSIONAL_PALETTES[0]?.sparkles.length)
        ] || '#ffffff'
      };
    });
  }, [count]); // Removed defaultPalette dependency

  // Handle palette changes every 15 seconds
  useEffect(() => {
    if (forcePalette !== undefined) {
      setCurrentPalette(forcePalette);
      return;
    }

    if (startTime) {
      const interval = setInterval(() => {
        setCurrentPalette(prev => (prev + 1) % PROFESSIONAL_PALETTES.length);
      }, 15000); // Change palette every 15 seconds

      // Initial palette set to index 1 (Green Bay Packers)
      setCurrentPalette(1);
      
      return () => clearInterval(interval);
    }
  }, [forcePalette, startTime]);

  // Show sparkles when presentation starts
  useEffect(() => {
    if (startTime) {
      const timer = setTimeout(() => {
        setShowSparkles(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowSparkles(false);
    }
  }, [startTime]);

  // Memoize the current palette data with smooth transitions
  const currentPaletteData = useMemo(() => {
    const idx = currentPalette % PROFESSIONAL_PALETTES.length;
    return PROFESSIONAL_PALETTES[Math.max(0, idx)] || PROFESSIONAL_PALETTES[0];
  }, [currentPalette]);

  // Memoize the container style with smooth transitions
  const containerStyle = useMemo((): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: currentPaletteData.background,
    transition: 'background 1.5s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother transition
    opacity: 1,
    zIndex: -10,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    transform: 'translateZ(0)',
    willChange: 'background',
  }), [currentPaletteData.background]);

  return (
    <div style={containerStyle}>
      {showSparkles && (
        <div className="sparkle-container" style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}>
          {sparkles.map((sparkle) => (
            <Sparkle key={sparkle.id} sparkle={sparkle} />
          ))}
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(SparkleBackground);