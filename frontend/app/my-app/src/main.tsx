import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

// No default images needed
const IMAGES: string[] = [];

function SparkleBackground({ count = 50, startTime, defaultPalette = 1, forcePalette }: { count?: number, startTime: number | null, defaultPalette?: number, forcePalette?: number }) {
  const [currentPalette, setCurrentPalette] = useState(defaultPalette);

  // If forcePalette is provided, immediately apply it and skip timed updates
  useEffect(() => {
    if (typeof forcePalette === 'number') {
      if (currentPalette !== forcePalette) setCurrentPalette(forcePalette);
    }
  }, [forcePalette, currentPalette]);

  // Handle color scheme changes at specified intervals
  useEffect(() => {
    if (!startTime) return;
    if (typeof forcePalette === 'number') return; // frozen by force

    const updatePalette = () => {
      const elapsed = Date.now() - startTime;
      let newPalette = 1;

      if (elapsed >= 204000) newPalette = 5;      // 204 seconds
      else if (elapsed >= 118000) newPalette = 4; // 118 seconds
      else if (elapsed >= 96000) newPalette = 3;  // 96 seconds
      else if (elapsed >= 38000) newPalette = 2;  // 38 seconds

      if (newPalette !== currentPalette) {
        setCurrentPalette(newPalette);
      }
    };

    const interval = setInterval(updatePalette, 100);
    updatePalette();

    return () => clearInterval(interval);
  }, [startTime, currentPalette, forcePalette]);

  // Generate random sparkles on mount
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
  const [userName, setUserName] = useState('');
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

const playMusicOnce = async (
  onEnd: () => void,
  setAudioError: (msg: string | null) => void
) => {
  try {
    const ctx = new AudioContext();
    const base = (import.meta as any).env?.BASE_URL || '/';
    const candidates = [
      `${base}static/background.mp3`,
      `${base}background.mp3`,
    ];
    let response: Response | null = null;
    for (const url of candidates) {
      try {
        const r = await fetch(url);
        if (r.ok) { response = r; break; }
      } catch (_) {
        // try next candidate
      }
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
      onEnd(); // trigger slideshow pause + button
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
    if (!files) return;
    const fileArr = Array.from(files).slice(0, 5 - uploadedImages.length);
    const readers = fileArr.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(imgs => {
      setUploadedImages(prev => [...prev, ...imgs].slice(0, 5));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowImageWarning(false);
    if (!name.trim()) {
      alert('Please enter your name first!');
      return;
    }
    if (uploadedImages.length === 0) {
      setShowImageWarning(true);
      return;
    }
    try {
      const ctx = await playMusicOnce(() => {
        setForcePalette(6);
        setStartTime(null);
        setIsStarted(false);
      }, setAudioError);
      if (ctx) setAudioContext(ctx);
      setForcePalette(null);
      setStartTime(Date.now());
      setUserName(name);
      setIsStarted(true);
    } catch (err) {
      console.error('Failed to start music:', err);
      setStartTime(Date.now());
      setUserName(name);
      setIsStarted(true);
    }
  };

  const allImages = uploadedImages.length > 0 ? [...uploadedImages, ...IMAGES] : IMAGES;

  const allImagesRef = React.useRef(allImages);
  React.useEffect(() => { allImagesRef.current = allImages; }, [allImages]);

  const cycleSpeedRef = React.useRef(cycleSpeed);
  React.useEffect(() => { cycleSpeedRef.current = cycleSpeed; }, [cycleSpeed]);

  const lastAdvanceRef = React.useRef(Date.now());

  // Adjust cycle speed over time
  useEffect(() => {
    if (!startTime) return;

    const check = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 204000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 118000) {
        setCycleSpeed(500);
      } else if (elapsed >= 96000) {
        setCycleSpeed(1000);
      } else if (elapsed >= 38000) {
        setCycleSpeed(500);
      }
    };

    const id = window.setInterval(check, 250);
    check();
    return () => clearInterval(id);
  }, [startTime]);

  // ✅ Updated slideshow logic
  useEffect(() => {
    if (!(isStarted && startTime)) return;

    const fadeDuration = 200; // ms
    const advanceTimeoutRef = { id: null as number | null };
    const isFadingRef = { val: false };
    const tickInterval = 100; // check 10x/sec

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
        <SparkleBackground startTime={startTime} defaultPalette={6} />
        <main className="container intro">
        <h1>Upload images to make a presentation with music and effects!</h1>
        <form onSubmit={handleSubmit} className="name-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a message to be displayed"
          />
          <div className="file-upload-container">
            <label>
              <span>Upload up to 5 images:</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadedImages.length >= 5}
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
            <p className="presentation-text">
              ✨<strong>{userName}</strong>✨
            </p>
            <p className="presentation-text">
              Song Name: "It Ain't Me" by Kygo & Selena Gomez.
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
);