import React from 'react';

interface ImagePresentationProps {
  allImages: string[];
  currentIndex: number;
  fade: boolean;
  name: string;
  currentSong: string;
  audioError: string | null;
}

const ImagePresentation: React.FC<ImagePresentationProps> = ({
  allImages,
  currentIndex,
  fade,
  name,
  currentSong,
  audioError,
}) => {
  if (allImages.length === 0) {
    return (
      <div className="presentation-container">
        <div className="no-images">No images to display</div>
      </div>
    );
  }

  return (
    <div className="presentation-container">
      <div className={`image-container ${fade ? 'fade' : ''}`}>
        {/* Info overlay in top left */}
        <div className="info-overlay">
          <div className="image-counter">
            Image {(currentIndex % allImages.length) + 1} of {allImages.length}
          </div>
          {name && <div className="presentation-name">{name}</div>}
          {currentSong && (
            <div className="presentation-song">
              <div className="now-playing-label">Now Playing:</div>
              <div className="song-name">{currentSong.replace('.mp3', '')}</div>
            </div>
          )}
          {audioError && <div className="error-message">{audioError}</div>}
        </div>
        
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