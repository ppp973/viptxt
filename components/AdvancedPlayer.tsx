'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  SkipBack, 
  SkipForward,
  ChevronLeft,
  Monitor,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';

interface PlayerProps {
  batchId: string;
  item: {
    title: string;
    url: string;
    type: 'video' | 'pdf' | 'notes';
  };
  initialPosition?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onBack: () => void;
}

function PlayerTopBar({ title, onBack }: { title: string; onBack: () => void }) {
  const { isTheaterMode, setIsTheaterMode } = usePlayer();
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between"
    >
      <button 
        onClick={onBack} 
        className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-xl text-white transition-all active:scale-90"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="text-center px-4 flex-1 min-w-0">
        <h2 className="text-white font-bold text-xl drop-shadow-2xl truncate">{title}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-slate-300 text-[10px] uppercase tracking-[0.2em] font-bold">Now Streaming</p>
        </div>
      </div>
      <button 
        onClick={() => setIsTheaterMode(!isTheaterMode)}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-2xl backdrop-blur-xl transition-all active:scale-90",
          isTheaterMode ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        <Monitor size={24} />
      </button>
    </motion.div>
  );
}

function PlayerCenterControls({ onNext, onPrev }: { onNext?: () => void; onPrev?: () => void }) {
  const { isPlaying, togglePlay } = usePlayer();
  return (
    <div className="flex items-center justify-center gap-12">
      <button onClick={onPrev} className="p-4 text-white/40 hover:text-white transition-all hover:scale-120 active:scale-90">
        <SkipBack size={40} />
      </button>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all"
      >
        {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} className="ml-2" fill="currentColor" />}
      </motion.button>
      <button onClick={onNext} className="p-4 text-white/40 hover:text-white transition-all hover:scale-120 active:scale-90">
        <SkipForward size={40} />
      </button>
    </div>
  );
}

function PlayerProgressBar() {
  const { progress, handleProgressChange } = usePlayer();
  return (
    <div className="group/progress relative h-2 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden">
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => handleProgressChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <motion.div 
        initial={false}
        animate={{ width: `${progress}%` }}
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]"
      />
    </div>
  );
}

function PlayerBottomControls() {
  const { 
    skip, 
    isMuted, 
    setIsMuted, 
    volume, 
    setVolume, 
    currentTime, 
    duration, 
    formatTime, 
    playbackSpeed, 
    setPlaybackSpeed, 
    videoRef 
  } = usePlayer();

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-all hover:scale-110">
            <RotateCcw size={24} />
          </button>
          <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-all hover:scale-110">
            <RotateCw size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 group/volume">
          <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              if (videoRef.current) videoRef.current.volume = val;
              setIsMuted(val === 0);
            }}
            className="w-24 accent-white opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer"
          />
        </div>

        <span className="text-white/60 text-sm font-bold tracking-widest font-mono">
          {formatTime(currentTime)} <span className="text-white/20 mx-1">/</span> {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-white/5 border border-white/5 rounded-2xl p-1.5 backdrop-blur-xl">
          {[0.5, 1, 1.5, 2].map(speed => (
            <button
              key={speed}
              onClick={() => {
                setPlaybackSpeed(speed);
                if (videoRef.current) videoRef.current.playbackRate = speed;
              }}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest",
                playbackSpeed === speed ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {speed}x
            </button>
          ))}
        </div>
        <button className="text-white/60 hover:text-white transition-all hover:rotate-90">
          <Settings size={24} />
        </button>
        <button 
          onClick={() => videoRef.current?.requestFullscreen()}
          className="text-white/60 hover:text-white transition-all hover:scale-110"
        >
          <Maximize size={24} />
        </button>
      </div>
    </motion.div>
  );
}

function PlayerContent({ item, onNext, onPrev, onBack }: Omit<PlayerProps, 'batchId' | 'initialPosition'>) {
  const { 
    videoRef, 
    togglePlay, 
    isPlaying, 
    showControls, 
    setShowControls, 
    isTheaterMode, 
    loading 
  } = usePlayer();
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      className={cn(
        "relative bg-black overflow-hidden group transition-all duration-500",
        isTheaterMode ? "h-screen w-screen fixed inset-0 z-[200]" : "aspect-video rounded-2xl shadow-2xl"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      )}

      <video
        ref={videoRef}
        src={item.url}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40 p-6"
          >
            <PlayerTopBar title={item.title} onBack={onBack} />
            <PlayerCenterControls onNext={onNext} onPrev={onPrev} />
            <div className="space-y-4">
              <PlayerProgressBar />
              <PlayerBottomControls />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdvancedPlayer(props: PlayerProps) {
  if (props.item.type === 'pdf' || props.item.type === 'notes') {
    return (
      <div className="flex flex-col h-full bg-slate-950">
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50">
          <button onClick={props.onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} /> Back to Batch
          </button>
          <h2 className="text-lg font-bold text-white truncate px-4">{props.item.title}</h2>
          <div className="w-24" />
        </div>
        <iframe 
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(props.item.url)}&embedded=true`}
          className="flex-1 w-full border-none"
          title={props.item.title}
        />
      </div>
    );
  }

  return (
    <PlayerProvider 
      batchId={props.batchId} 
      itemUrl={props.item.url} 
      initialPosition={props.initialPosition}
    >
      <PlayerContent {...props} />
    </PlayerProvider>
  );
}
