import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

const IMAGES: string[] = [];

function SparkleBackground({ count = 50, startTime, defaultPalette = 1, forcePalette }: { count?: number, startTime: number | null, defaultPalette?: number, forcePalette?: number }) {
  const [currentPalette, setCurrentPalette] = useState(defaultPalette);

  useEffect(() => {
    if (typeof forcePalette === 'number') {
      if (currentPalette !== forcePalette) setCurrentPalette(forcePalette);
    }
  }, [forcePalette, currentPalette]);

  useEffect(() => {
    if (!startTime) return;
    if (typeof forcePalette === 'number') return;

    const updatePalette = () => {
      const elapsed = Date.now() - startTime;
      let newPalette = 1;

      if (elapsed >= 87000) newPalette = 8;       // 87 seconds
      else if (elapsed >= 74000) newPalette = 7;  // 74 seconds
      else if (elapsed >= 60000) newPalette = 5;  // 60 seconds
      else if (elapsed >= 45000) newPalette = 4;  // 45 seconds
      else if (elapsed >= 30000) newPalette = 3;  // 30 seconds
      else if (elapsed >= 15000) newPalette = 2;  // 15 seconds

      if (newPalette !== currentPalette) {
        setCurrentPalette(newPalette);
      }
    };

    const interval = setInterval(updatePalette, 100);
    updatePalette();

    return () => clearInterval(interval);
  }, [startTime, currentPalette, forcePalette]);

  const [sparkles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2.5,
      size: 5 + Math.random() * 8,
    }))
  );

  return (
    <div className={`sparkle-bg palette-${currentPalette}`}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [name, setName] = useState('');
  const [fade, setFade] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImageWarning, setShowImageWarning] = useState(false);
  const [cycleSpeed, setCycleSpeed] = useState(1000);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [forcePalette, setForcePalette] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSong, setCurrentSong] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const availableSongs = [
    'MONTAGEM XONADA.mp3',
    'MONTAGEM CORACAO.mp3',
    'MONTAGEM DIREÇÃO.mp3',
    'NO BATIDÃO.mp3',
    'TE CONOCÍ.mp3',
    'VAI VAI TRAIR.mp3'
  ];

  const getRandomSong = () => {
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    return availableSongs[randomIndex];
  };

  const playMusicOnce = async (
    onEnd: () => void,
    setAudioError: (msg: string | null) => void,
    songName: string = ''
  ) => {
    try {
      const ctx = new AudioContext();
      const base = (import.meta as any).env?.BASE_URL || '/';
      const songToPlay = songName || getRandomSong();
      setCurrentSong(songToPlay);
      
      const candidates = [
        `${base}static/${songToPlay}`,
        `${base}${songToPlay}`,
        `./static/${songToPlay}`,
        `/${songToPlay}`,
        songToPlay
      ];
      
      let response: Response | null = null;
      for (const url of candidates) {
        try {
          const r = await fetch(url);
          if (r.ok) { response = r; break; }
        } catch (_) {}
      }
      if (!response) throw new Error('Could not load music file');

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);

      source.onended = () => {
        console.log('Music finished playing.');
        ctx.close();
        onEnd();
      };

      setAudioError(null);
      return ctx;
    } catch (err) {
      console.error('Audio playback error:', err);
      setAudioError('Unable to play background music. Please click anywhere to try again.');
      return null;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selected = Array.from(files);
    const newTotal = uploadedImages.length + selected.length;
    if (newTotal > 20) {
      alert('You can upload up to 20 images. Your selections have been cleared.');
      setUploadedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const limit = Math.min(20 - uploadedImages.length, selected.length);
    const fileArr = selected.slice(0, limit);
    const readers = fileArr.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((imgs) => {
      setUploadedImages(prev => {
        const remaining = 20 - prev.length;
        return [...prev, ...imgs.slice(0, remaining)];
      });
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      startExperience();
    }
  };

  const handleSongChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const song = e.target.value;
    setSelectedSong(song);
    if (isStarted) {
      startExperience(song);
    }
  };

  const startExperience = async (songName?: string) => {
    if (isSubmitting) return false;
    
    try {
      setIsSubmitting(true);
      const songToPlay = songName || selectedSong || getRandomSong();
      setCurrentSong(songToPlay);
      
      const ctx = await playMusicOnce(handleEnd, setAudioError, songToPlay);
      if (ctx) setAudioContext(ctx);
      setForcePalette(null);
      setStartTime(Date.now());
      setIsStarted(true);
      return true;
    } catch (err) {
      console.error('Failed to start music:', err);
      setStartTime(Date.now());
      setIsStarted(true);
      setIsSubmitting(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowImageWarning(false);

    if (name.trim() === '') {
      const displayName = name.trim() || 'No message provided';
      setName(displayName);
    }
    
    if (uploadedImages.length === 0) {
      setShowImageWarning(true);
      return;
    }
    if (uploadedImages.length < 2) {
      alert('Please upload at least 2 images.');
      return;
    }
    
    try {
      const songToPlay = selectedSong || getRandomSong();
      await startExperience(songToPlay);
    } catch (err) {
      console.error('Error starting experience:', err);
      setIsSubmitting(false);
    }
  };

  const allImages = uploadedImages.length > 0 ? [...uploadedImages, ...IMAGES] : IMAGES;
  const allImagesRef = React.useRef(allImages);
  React.useEffect(() => { allImagesRef.current = allImages; }, [allImages]);

  const cycleSpeedRef = React.useRef(cycleSpeed);
  React.useEffect(() => { cycleSpeedRef.current = cycleSpeed; }, [cycleSpeed]);

  const lastAdvanceRef = React.useRef(Date.now());

  useEffect(() => {
    if (!startTime) return;

    const check = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 87000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 74000) {
        setCycleSpeed(500);
      } else if (elapsed >= 60000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 45000) {
        setCycleSpeed(500);
      } else if (elapsed >= 30000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 15000) {
        setCycleSpeed(500);
      }
    };

    const id = window.setInterval(check, 250);
    check();
    return () => clearInterval(id);
  }, [startTime]);

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
            console.debug('[slideshow] advance', prev, '->', next, 'at', Date.now());
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
  }, [isStarted, startTime, cycleSpeed]);

  useEffect(() => {
    if (isStarted && audioContext) {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    }
  }, [isStarted, audioContext]);

  if (!isStarted) {
    return (
      <>
        <SparkleBackground startTime={startTime} defaultPalette={6} forcePalette={6} />
        <main className="container intro">
        <h1>Upload images to make a presentation with music and effects!</h1>
        <form onSubmit={handleSubmit} className="name-form">
          <div className="name-input-container">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a message: " 
              className="name-input"
            />
            <div className="music-selector">
              <label htmlFor="song-select" className="music-label">Choose Music: </label>
              <select 
                id="song-select"
                value={selectedSong} 
                onChange={handleSongChange}
                className="song-select"
              >
                <option value="">Random</option>
                {availableSongs.map((song) => (
                  <option key={song} value={song}>
                    {song.replace('.mp3', '')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="file-upload-container">
            <label>
              <span>Upload up to 20 images:</span>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="file-input"
              />
            </label>
            {showImageWarning && (
              <div style={{ color: '#ff5555', fontSize: '1em', textAlign: 'center' }}>
                Please upload at least one image!
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5em', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.5em' }}>
            {uploadedImages.map((img, i) => (
              <img key={i} src={img} alt={`upload-${i + 1}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1.5px solid #ccc' }} />
            ))}
          </div>
          <button type="submit">Submit</button>
        </form>
        </main>
      </>
    );
  }

  return (
    <>
      <SparkleBackground startTime={startTime} forcePalette={forcePalette ?? undefined} />
      <main className="container presentation">
        {allImages.length > 0 ? (
          <>
            <div className="image-frame">
              <img
                className={`fade ${fade ? 'in' : 'out'} rounded`}
                src={allImages[currentIndex % allImages.length]}
                alt="Presentation"
              />
            </div>
            <div className="message-container">
              <p className="presentation-message">
                ✨ {name} ✨
              </p>
            </div>
            <p className="presentation-text">
              {currentSong ? `Now Playing: ${currentSong.replace('.mp3', '')}` : 'Loading music...'}
            </p>
            {audioError && (
              <div style={{ color: '#ff5555', fontSize: '0.9em', marginTop: '1em' }}>
                {audioError}
              </div>
            )}
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
            <div
              className="presentation-text"
              style={{
                fontSize: '0.8em',
                marginTop: '1em',
                opacity: 0.8,
              }}
            >
              Image {(currentIndex % allImages.length) + 1} of {allImages.length}
            </div>
          </>
        ) : (
          <p className="presentation-text">
            No images to display. Please go back and upload some images.
          </p>
        )}
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)