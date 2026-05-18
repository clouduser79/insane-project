type AudioPlayer = {
  context: AudioContext;
  gainNode: GainNode;
  source: AudioBufferSourceNode;
  setVolume: (volume: number) => void;
};

export const createAudioPlayer = async ({
  onEnd,
  setAudioError,
  songName = '',
  setCurrentSong,
  initialVolume = 0.5,
  audioDataUrl = null,
}: {
  onEnd: () => void;
  setAudioError: (msg: string | null) => void;
  songName?: string;
  setCurrentSong: (song: string) => void;
  initialVolume?: number;
  audioDataUrl?: string | null;
}): Promise<AudioPlayer | null> => {
  try {
    try {
      const ctx = new AudioContext();
      const gainNode = ctx.createGain();
      gainNode.gain.value = initialVolume;
      gainNode.connect(ctx.destination);

      let arrayBuffer: ArrayBuffer;

      if (audioDataUrl) {
        // Use the uploaded audio data URL
        const response = await fetch(audioDataUrl);
        if (!response.ok) throw new Error('Could not load uploaded audio');
        arrayBuffer = await response.arrayBuffer();
      } else {
        // Fallback to static files
        const base = (import.meta as any).env?.BASE_URL || '/';
        const songToPlay = songName;
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
            if (r.ok) {
              response = r;
              break;
            }
          } catch (_) {}
        }

        if (!response) throw new Error('Could not load music file');
        arrayBuffer = await response.arrayBuffer();
      }

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      let playCount = 0;

      const playAudio = () => {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.start(0);

        source.onended = () => {
          playCount++;
          console.log(`Music finished playing. Play count: ${playCount} (infinite loop)`);
          
          // Play again infinitely
          playAudio();
        };

        return source;
      };

      const source = playAudio();

      setAudioError(null);

      return {
        context: ctx,
        gainNode,
        source,
        setVolume: (volume: number) => {
          if (gainNode) {
            gainNode.gain.value = Math.min(1, Math.max(0, volume));
          }
        }
      };
    } catch (err) {
      console.error('Error creating audio player:', err);
      throw err;
    }
  } catch (err) {
    console.error('Audio playback error:', err);
    setAudioError('Unable to play background music. Please click anywhere to try again.');
    return null;
  }
};
