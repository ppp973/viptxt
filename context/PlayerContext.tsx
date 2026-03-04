'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface PlayerContextType {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  showControls: boolean;
  isTheaterMode: boolean;
  loading: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  
  togglePlay: () => void;
  skip: (seconds: number) => void;
  setVolume: (val: number) => void;
  setIsMuted: (val: boolean) => void;
  setPlaybackSpeed: (val: number) => void;
  setIsTheaterMode: (val: boolean) => void;
  setShowControls: (val: boolean) => void;
  handleProgressChange: (val: number) => void;
  formatTime: (time: number) => string;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ 
  children, 
  batchId, 
  itemUrl, 
  initialPosition 
}: { 
  children: React.ReactNode;
  batchId: string;
  itemUrl: string;
  initialPosition?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const lastSyncTime = useRef<number>(0);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const handleProgressChange = useCallback((val: number) => {
    const newTime = (val / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setProgress(val);
    }
  }, [duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      setProgress((time / video.duration) * 100);
      
      if (Date.now() - lastSyncTime.current > 10000) {
        lastSyncTime.current = Date.now();
        fetch(`/api/batches/${batchId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: itemUrl, position: time }),
        }).catch(console.error);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
      if (initialPosition) {
        video.currentTime = initialPosition;
        setCurrentTime(initialPosition);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', () => setLoading(true));
    video.addEventListener('playing', () => setLoading(false));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [batchId, itemUrl, initialPosition]);

  const value = {
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackSpeed,
    showControls,
    isTheaterMode,
    loading,
    videoRef,
    togglePlay,
    skip,
    setVolume,
    setIsMuted,
    setPlaybackSpeed,
    setIsTheaterMode,
    setShowControls,
    handleProgressChange,
    formatTime
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
