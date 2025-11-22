import React, { useState, useEffect, useRef } from 'react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle volume knob drag
  useEffect(() => {
    if (!knobRef.current || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left; // Distance from left
      const width = rect.width;
      let newVolume = x / width;
      
      // Clamp between 0 and 1
      newVolume = Math.min(1, Math.max(0, newVolume));
      onVolumeChange(parseFloat(newVolume.toFixed(2)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onVolumeChange]);

  // Handle wheel events for volume control
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newVolume = Math.min(1, Math.max(0, volume + delta));
    onVolumeChange(parseFloat(newVolume.toFixed(2)));
  };

  const handleMuteToggle = () => {
    onVolumeChange(volume === 0 ? 1 : 0);
  };

  // Calculate knob position based on volume (0-1)
  const fillWidth = `${volume * 100}%`;
  
  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  return (
    <div 
      className={`volume-control ${className}`}
      onMouseLeave={() => isDragging && setIsDragging(false)}
      onWheel={handleWheel}
    >
      <div 
        className="volume-icon"
        onClick={handleMuteToggle}
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </div>
      
      <div className="volume-slider-container">
        <div 
          className="volume-slider-track"
          onClick={(e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const newVolume = Math.min(1, Math.max(0, x / width));
            onVolumeChange(parseFloat(newVolume.toFixed(2)));
          }}
          ref={containerRef}
        >
          <div 
            className="volume-fill" 
            style={{ width: fillWidth }}
          />
          <div 
            ref={knobRef}
            className="volume-knob"
            style={{ left: fillWidth }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;