import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImageUploadForm from './components/ImageUploadForm';
import ImagePresentation from './components/ImagePresentation';
import VolumeControl from './components/VolumeControl';
import { createAudioPlayer} from './utils/audioPlayer';

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [fade, setFade] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [imageName, setImageName] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('#1a1a2e');
  const [secondaryColor, setSecondaryColor] = useState<string>('#16213e');
  const [showImageWarning, setShowImageWarning] = useState(false);
  const [cycleSpeed] = useState(1000);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<{
    context: AudioContext;
    gainNode: GainNode;
    source: AudioBufferSourceNode;
    setVolume: (volume: number) => void;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSong, setCurrentSong] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastAdvanceRef = useRef(0);
  const allImagesRef = useRef<string[]>([]);
  const cycleSpeedRef = useRef(cycleSpeed);

  // Update refs when state changes
  useEffect(() => {
    allImagesRef.current = [...uploadedImages];
  }, [uploadedImages]);

  // Extract colors from uploaded image
  useEffect(() => {
    if (uploadedImages.length > 0) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Sample colors from the image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple color extraction: get average color
        let r = 0, g = 0, b = 0;
        const sampleSize = 1000; // Sample every nth pixel for performance
        let count = 0;

        for (let i = 0; i < data.length; i += 4 * sampleSize) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Create a darker version for secondary color
        const secondaryR = Math.max(0, r - 40);
        const secondaryG = Math.max(0, g - 40);
        const secondaryB = Math.max(0, b - 40);

        setBackgroundColor(`rgb(${r}, ${g}, ${b})`);
        setSecondaryColor(`rgb(${secondaryR}, ${secondaryG}, ${secondaryB})`);
      };
      img.src = uploadedImages[0];
    }
  }, [uploadedImages]);

  useEffect(() => {
    cycleSpeedRef.current = cycleSpeed;
  }, [cycleSpeed]);

  const resetForm = () => {
    setUploadedImages([]);
    setSelectedSong('');
    setUploadedAudio(null);
    setShowImageWarning(false);
    setCurrentIndex(0);
    setFade(true);
    setIsSubmitting(false);
    setBackgroundColor('#1a1a2e');
    setSecondaryColor('#16213e');
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const handleEnd = () => {
    // Stop the audio immediately
    if (audioPlayer) {
      try {
        audioPlayer.source.stop();
        audioPlayer.context.close();
      } catch (e) {
        console.warn('Error stopping audio:', e);
      }
      setAudioPlayer(null);
    }
    setStartTime(null);
    setIsStarted(false);
    resetForm();
  };

  // Handle volume changes
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioPlayer) {
      audioPlayer.setVolume(newVolume);
    }
  }, [audioPlayer]);

  // Clean up audio resources when component unmounts or when audio changes
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        try {
          audioPlayer.source.stop();
          audioPlayer.context.close();
        } catch (e) {
          console.warn('Error cleaning up audio:', e);
        }
      }
    };
  }, [audioPlayer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowImageWarning(false);

    if (uploadedImages.length === 0) {
      setShowImageWarning(true);
      return;
    }
    if (!uploadedAudio) {
      alert('Please upload an MP3 file.');
      return;
    }
    
    try {
      console.log('Starting presentation...');
      setIsSubmitting(true);
      const songToPlay = selectedSong;
      console.log('Selected song:', songToPlay);
      
      // Clean up previous audio player if it exists
      if (audioPlayer) {
        try {
          audioPlayer.source.stop();
          audioPlayer.context.close();
        } catch (e) {
          console.warn('Error stopping previous audio:', e);
        }
      }
      
      try {
        const player = await createAudioPlayer({
          onEnd: handleEnd,
          setAudioError,
          songName: songToPlay,
          setCurrentSong,
          initialVolume: volume,
          audioDataUrl: uploadedAudio,
        });
        
        if (player) {
          console.log('Audio player created successfully');
          setAudioPlayer(player);
          const now = Date.now();
          console.log('Setting start time to:', now);
          setStartTime(now);
          setIsStarted(true);
          setIsSubmitting(false);
          console.log('Presentation started successfully');
        } else {
          console.error('Failed to create audio player');
          setIsSubmitting(false);
          setAudioError('Failed to load audio. Please try a different song.');
        }
      } catch (error) {
        console.error('Error creating audio player:', error);
        setIsSubmitting(false);
        setAudioError('Error initializing audio. Please try again.');
      }
    } catch (err) {
      console.error('Error starting experience:', err);
      setIsSubmitting(false);
    }
  };

  // Handle image cycling
  useEffect(() => {
    if (!(isStarted && startTime)) return;

    const fadeDuration = 200;
    const advanceTimeoutRef = { id: null as number | null };
    const isFadingRef = { val: false };
    const tickInterval = 100;

    lastAdvanceRef.current = lastAdvanceRef.current || Date.now();

    const tick = () => {
      const now = Date.now();
      const currentSpeed = cycleSpeedRef.current || 1000;
      const elapsed = now - (lastAdvanceRef.current || now);

      if (!isFadingRef.val && elapsed >= currentSpeed - fadeDuration) {
        isFadingRef.val = true;
        setFade(false);

        if (advanceTimeoutRef.id) {
          window.clearTimeout(advanceTimeoutRef.id);
        }
        
        advanceTimeoutRef.id = window.setTimeout(() => {
          setCurrentIndex(prev => {
            const arrLen = allImagesRef.current.length;
            const next = arrLen === 0 ? prev : (prev >= arrLen - 1 ? 0 : prev + 1);
            return next;
          });

          lastAdvanceRef.current = Date.now();
          setFade(true);
          isFadingRef.val = false;
        }, fadeDuration);
      }
    };

    const intervalId = window.setInterval(tick, tickInterval);

    return () => {
      window.clearInterval(intervalId);
      if (advanceTimeoutRef.id) window.clearTimeout(advanceTimeoutRef.id);
    };
  }, [isStarted, startTime]);

  // Handle audio context when app starts/stops
  useEffect(() => {
    if (isStarted && audioPlayer) {
      if (audioPlayer.context.state === 'suspended') {
        audioPlayer.context.resume();
      }
    }
  }, [isStarted, audioPlayer]);

  if (!isStarted) {
    return (
      <>
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor} 100%)`,
            zIndex: -10,
            margin: 0,
            padding: 0,
          }}
        />
        <div className="volume-control-container">
          <VolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>
        <main className="container intro">
          <h1>React Web Player</h1>
          <ImageUploadForm
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            showImageWarning={showImageWarning}
            setShowImageWarning={setShowImageWarning}
            onSubmit={handleSubmit}
            selectedSong={selectedSong}
            setSelectedSong={setSelectedSong}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            isSubmitting={isSubmitting}
            uploadedAudio={uploadedAudio}
            setUploadedAudio={setUploadedAudio}
            audioInputRef={audioInputRef as React.RefObject<HTMLInputElement>}
            setImageName={setImageName}
          />
        </main>
      </>
    );
  }

  return (
    <div className="app">
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor} 100%)`,
          zIndex: -10,
          margin: 0,
          padding: 0,
        }}
      />
      {isStarted && (
        <div className="volume-control-container">
          <VolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>
      )}
      <ImagePresentation
        allImages={[...uploadedImages]}
        currentIndex={currentIndex}
        fade={fade}
        currentSong={selectedSong}
        onStop={handleEnd}
        imageName={imageName}
      />
    </div>
  );
};

export default App;
