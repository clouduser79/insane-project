import React, { useState, useEffect, useRef, useCallback } from 'react';
import SparkleBackground from './components/SparkleBackground';
import ImageUploadForm from './components/ImageUploadForm';
import ImagePresentation from './components/ImagePresentation';
import VolumeControl from './components/VolumeControl';
import { createAudioPlayer, getRandomSong } from './utils/audioPlayer';

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [name, setName] = useState('');
  const [fade, setFade] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImageWarning, setShowImageWarning] = useState(false);
  const [cycleSpeed, setCycleSpeed] = useState(1000);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<{
    context: AudioContext;
    gainNode: GainNode;
    source: AudioBufferSourceNode;
    setVolume: (volume: number) => void;
  } | null>(null);
  const [forcePalette, setForcePalette] = useState<number | null>(null);
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

  useEffect(() => {
    cycleSpeedRef.current = cycleSpeed;
  }, [cycleSpeed]);

  const resetForm = () => {
    setUploadedImages([]);
    setSelectedSong('');
    setName('');
    setShowImageWarning(false);
    setCurrentIndex(0);
    setFade(true);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEnd = () => {
    setForcePalette(6);
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

    // Set a default name if empty
    const displayName = name.trim() || 'No message provided';
    setName(displayName);
    
    if (uploadedImages.length === 0) {
      setShowImageWarning(true);
      return;
    }
    if (uploadedImages.length < 2) {
      alert('Please upload at least 2 images.');
      return;
    }
    
    try {
      console.log('Starting presentation...');
      setIsSubmitting(true);
      const songToPlay = selectedSong || getRandomSong();
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
        });
        
        if (player) {
          console.log('Audio player created successfully');
          setAudioPlayer(player);
          setForcePalette(null);
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

  // Handle cycle speed changes based on elapsed time
  useEffect(() => {
    if (!startTime) return;

    const check = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 88000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 74000) {
        setCycleSpeed(500);
      } else if (elapsed >= 59000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 44000) {
        setCycleSpeed(500);
      } else if (elapsed >= 29000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 15000) {
        setCycleSpeed(500);
      }
    };

    const id = window.setInterval(check, 250);
    check();
    return () => clearInterval(id);
  }, [startTime]);

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
        <SparkleBackground startTime={startTime} defaultPalette={0} forcePalette={0} />
        <div className="volume-control-container">
          <VolumeControl 
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>
        <main className="container intro">
          <h1>Upload images to make a presentation with music and effects!</h1>
          <ImageUploadForm
            name={name}
            setName={setName}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            showImageWarning={showImageWarning}
            setShowImageWarning={setShowImageWarning}
            onSubmit={handleSubmit}
            selectedSong={selectedSong}
            setSelectedSong={setSelectedSong}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            isSubmitting={isSubmitting}
          />
        </main>
      </>
    );
  }

  return (
    <div className="app">
      <SparkleBackground 
        startTime={startTime} 
        forcePalette={forcePalette ?? undefined} 
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
        name={name}
        currentSong={currentSong}
        audioError={audioError}
      />
    </div>
  );
};

export default App;
