import React from 'react';
import type { ChangeEvent } from 'react';

interface ImageUploadFormProps {
  uploadedImages: string[];
  setUploadedImages: (images: string[]) => void;
  showImageWarning: boolean;
  setShowImageWarning: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedSong: string;
  setSelectedSong: (song: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isSubmitting: boolean;
  uploadedAudio: string | null;
  setUploadedAudio: (audio: string | null) => void;
  audioInputRef: React.RefObject<HTMLInputElement>;
  setImageName: (name: string) => void;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  uploadedImages,
  setUploadedImages,
  showImageWarning,
  setShowImageWarning,
  onSubmit,
  selectedSong,
  setSelectedSong,
  fileInputRef,
  isSubmitting,
  uploadedAudio,
  setUploadedAudio,
  audioInputRef,
  setImageName,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      setShowImageWarning(true);
      return;
    }
    onSubmit(e);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImages([reader.result as string]);
    };
    reader.onerror = () => {
      alert('Error reading image file.');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
      alert('Please upload an MP3 file.');
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedAudio(reader.result as string);
      setSelectedSong(file.name);
    };
    reader.onerror = () => {
      alert('Error reading audio file.');
    };
    reader.readAsDataURL(file);

    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label className="form-label">Upload an MP3 file: </label>
        <div className="file-upload-container">
          <input
            type="file"
            ref={audioInputRef}
            onChange={handleAudioUpload}
            className="file-input"
            accept="audio/mp3, audio/mpeg"
            disabled={isSubmitting}
            style={{ display: 'none' }}
          />
          <div 
            className="file-input-label"
            onClick={() => audioInputRef.current?.click()}
            style={{
              border: '2px dashed #646cff',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(100, 108, 255, 0.1)'
            }}
          >
            <p style={{ margin: '0', color: '#646cff' }}>Click to upload MP3 file</p>
          </div>
          {uploadedAudio && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Audio file selected: {selectedSong}
            </p>
          )}
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label className="form-label">Upload an image: </label>
        <div className="file-upload-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="file-input"
            accept="image/*"
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
              backgroundColor: 'rgba(100, 108, 255, 0.1)'
            }}
          >
            <p style={{ margin: '0', color: '#646cff' }}>Click to upload image</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Supports JPG, PNG, GIF</p>
          </div>
          {uploadedImages.length > 0 && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Image selected
            </p>
          )}
        </div>
        {showImageWarning && (
          <p className="warning-message">
            Please upload an image.
          </p>
        )}
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting}
        style={{ backgroundColor: '#646cff', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
      >
        {isSubmitting ? 'Starting...' : 'Start Presentation'}
      </button>
    </form>
  );
};

export default ImageUploadForm;
