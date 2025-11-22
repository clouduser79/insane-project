import React from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { AVAILABLE_SONGS, MAX_IMAGES } from '../constants/songs';

interface ImageUploadFormProps {
  name: string;
  setName: (name: string) => void;
  uploadedImages: string[];
  setUploadedImages: (images: string[]) => void;
  showImageWarning: boolean;
  setShowImageWarning: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedSong: string;
  setSelectedSong: (song: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isSubmitting: boolean;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  name,
  setName,
  uploadedImages,
  setUploadedImages,
  showImageWarning,
  setShowImageWarning,
  onSubmit,
  selectedSong,
  setSelectedSong,
  fileInputRef,
  isSubmitting,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      setShowImageWarning(true);
      return;
    }
    if (uploadedImages.length < 2) {
      alert('Please upload at least 2 images.');
      return;
    }
    onSubmit(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selected = Array.from(files);
    const newTotal = uploadedImages.length + selected.length;
    
    if (newTotal > MAX_IMAGES) {
      alert(`You can upload up to ${MAX_IMAGES} images. Your selections have been cleared.`);
      setUploadedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const limit = MAX_IMAGES - uploadedImages.length;
    const fileArr = selected.slice(0, limit);
    const readers = fileArr.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readers).then((imgs: string[]) => {
      const newImages = [...uploadedImages, ...imgs];
      setUploadedImages(newImages.slice(0, MAX_IMAGES));
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSongChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSong(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group">
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="form-input"
          placeholder="Enter a message (optional): "
          required={false}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Select a Song: </label>
        <select
          value={selectedSong}
          onChange={handleSongChange}
          className="form-select"
          required
          disabled={isSubmitting}
        >
          <option value="">-- Select a song --</option>
          {AVAILABLE_SONGS.map((song) => (
            <option key={song} value={song}>
              {song}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <div className="file-upload-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="file-input"
            accept="image/*"
            multiple
            // Required validation is handled in the parent component
            disabled={isSubmitting}
            style={{ display: 'none' }}
          />
          <div 
            className="file-input-label"
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #646cff',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              margin: '0.5rem 0',
              backgroundColor: 'rgba(100, 108, 255, 0.1)'
            }}
          >
            <p style={{ margin: '0', color: '#646cff' }}>Click to upload images (Max {MAX_IMAGES})</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Supports JPG, PNG, GIF</p>
          </div>
          {uploadedImages.length > 0 && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        {showImageWarning && (
          <p className="warning-message">
            Maximum {MAX_IMAGES} images allowed. Some images were not uploaded.
          </p>
        )}
        
        {uploadedImages.length > 0 && (
          <div className="preview-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {uploadedImages.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`Preview ${index + 1}`}
                className="preview-image"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Starting...' : 'Start Presentation'}
      </button>
    </form>
  );
};

export default ImageUploadForm;
