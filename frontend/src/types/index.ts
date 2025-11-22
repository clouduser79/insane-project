export interface SparkleConfig {
  id: number;
  left: number;
  top: number;
  delay: number;
  size: number;
  duration: number;
  opacity: number;
  blur: number;
}

export interface SparkleBackgroundProps {
  count?: number;
  startTime: number | null;
  defaultPalette?: number;
  forcePalette?: number;
}

export interface AudioPlayerProps {
  onEnd: () => void;
  setAudioError: (msg: string | null) => void;
  songName?: string;
  setCurrentSong: (song: string) => void;
}
