import React from 'react';

interface ImagePresentationProps {
  allImages: string[];
  currentIndex: number;
  fade: boolean;
  currentSong: string;
  onStop: () => void;
  imageName: string;
}

const ImagePresentation: React.FC<ImagePresentationProps> = ({
  allImages,
  currentIndex,
  fade,
  currentSong,
  onStop,
  imageName,
}) => {

  return (
    <div className="presentation-container">
      {/* Control buttons in top left */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <button
          onClick={onStop}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Stop & Return Home
        </button>
        <div style={{
          padding: '15px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '5px',
          color: 'white',
          fontSize: '14px',
          minWidth: '200px',
          maxWidth: '250px',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Image:</strong> {imageName || 'No image selected'}
          </div>
          <div>
            <strong>Song:</strong> {currentSong || 'No song selected'}
          </div>
        </div>
      </div>

      <div className={`image-container ${fade ? 'fade' : ''}`}>
        {/* Main image */}
        <img
          src={allImages[currentIndex % allImages.length]}
          alt={`Slide ${currentIndex + 1}`}
          className="presentation-image"
        />
        
        {/* Progress bar at the bottom */}
        <div className="progress-bar">
          <div
            className="progress-bar-inner"
            style={{
              width: allImages.length <= 1
                ? '0%'
                : `${((currentIndex % allImages.length) / (allImages.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePresentation;