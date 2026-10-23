import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  src: string;
  isPlaying: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

function AudioPlayer({ src, isPlaying, onPlay, onPause }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !src) return;

    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [src]);


  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !src) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  if (!src) return null;

  return (
    <audio
      ref={audioRef}
      controls
      preload="auto"
      onPlay={onPlay}
      onPause={onPause}
    >
      <source src={src} type="audio/mpeg" />
      <source src={src} type="audio/mp3" />
      <source src={src} type="audio/wav" />
      <source src={src} type="audio/ogg" />
      <source src={src} type="audio/flac" />
      Tu navegador no soporta el elemento de audio.
    </audio>
  );
}

export default AudioPlayer;
