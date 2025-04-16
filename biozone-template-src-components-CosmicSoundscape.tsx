import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface CosmicSoundscapeProps {
  autoplay?: boolean;
  initialVolume?: number;
}

const CosmicSoundscape: React.FC<CosmicSoundscapeProps> = ({
  autoplay = false,
  initialVolume = 0.3
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [activeSound, setActiveSound] = useState<"redshift" | "blueshift" | "greenshift" | "cosmic">("cosmic");
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(20).fill(0));
  
  // Audio element references
  const redshiftRef = useRef<HTMLAudioElement | null>(null);
  const blueshiftRef = useRef<HTMLAudioElement | null>(null);
  const greenshiftRef = useRef<HTMLAudioElement | null>(null);
  const cosmicRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Base audio URLs (these would need to be actually created and hosted)
  const audioSources = {
    redshift: "https://example.com/sounds/redshift-expansion.mp3",
    blueshift: "https://example.com/sounds/blueshift-contraction.mp3",
    greenshift: "https://example.com/sounds/greenshift-convergence.mp3",
    cosmic: "https://example.com/sounds/cosmic-harmony.mp3"
  };
  
  // Set up audio context for visualization
  useEffect(() => {
    // We're creating a mock visualization here since we don't have real audio files
    // In a real implementation, this would use Web Audio API's analyzer node to get frequency data
    
    if (isPlaying) {
      const updateVisualizer = () => {
        // Create a new array of random values that somewhat aligns with the active sound type
        const newData = Array(20).fill(0).map(() => {
          let height = 0;
          switch (activeSound) {
            case "redshift":
              // More activity in the higher frequencies (right side)
              height = Math.random() * (Math.random() > 0.6 ? 0.8 : 0.3);
              break;
            case "blueshift":
              // More activity in the lower frequencies (left side)
              height = Math.random() * (Math.random() < 0.4 ? 0.8 : 0.3);
              break;
            case "greenshift":
              // Balanced with occasional peaks
              height = Math.random() * (Math.random() > 0.8 ? 0.9 : 0.5);
              break;
            case "cosmic":
              // Full range with harmonic patterns
              height = Math.sin(Date.now() / 500 + Math.random()) * 0.4 + 0.5;
              break;
          }
          return height;
        });
        
        setVisualizerData(newData);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      updateVisualizer();
      
      return () => {
        cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, [isPlaying, activeSound]);
  
  // Functions to handle audio controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Update all audio elements
    const elements = [redshiftRef.current, blueshiftRef.current, greenshiftRef.current, cosmicRef.current];
    elements.forEach(el => {
      if (el) {
        el.muted = !isMuted;
      }
    });
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // Update all audio elements
    const elements = [redshiftRef.current, blueshiftRef.current, greenshiftRef.current, cosmicRef.current];
    elements.forEach(el => {
      if (el) {
        el.volume = newVolume;
      }
    });
  };
  
  const changeSound = (sound: "redshift" | "blueshift" | "greenshift" | "cosmic") => {
    setActiveSound(sound);
    
    // In a real implementation, you would fade between audio elements
    // For now, we just update the visualization
  };
  
  const getActiveColor = (sound: string) => {
    if (sound === activeSound) {
      switch (sound) {
        case "redshift": return "bg-[hsl(var(--redshift))]";
        case "blueshift": return "bg-[hsl(var(--blueshift))]";
        case "greenshift": return "bg-[hsl(var(--greenshift))]";
        case "cosmic": return "bg-gradient-to-r from-[hsl(var(--redshift))] via-[hsl(var(--greenshift))] to-[hsl(var(--blueshift))]";
      }
    }
    return "bg-muted";
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-background/80 backdrop-blur-md rounded-lg border border-border/40 p-4 shadow-lg max-w-xs w-full"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Cosmic Soundscape</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-muted transition"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full hover:bg-muted transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>
        
        {/* Audio visualizer */}
        <div className="h-12 mb-3 rounded-md overflow-hidden bg-background/50 flex items-end justify-between px-0.5 pb-0.5">
          {visualizerData.map((height, index) => (
            <div
              key={index}
              className="w-1 rounded-t"
              style={{
                height: `${height * 100}%`,
                background: activeSound === "cosmic"
                  ? `hsl(var(--${index < 7 ? "redshift" : index < 14 ? "greenshift" : "blueshift"}))`
                  : activeSound === "redshift"
                    ? "hsl(var(--redshift))"
                    : activeSound === "blueshift"
                      ? "hsl(var(--blueshift))"
                      : "hsl(var(--greenshift))",
                transition: "height 0.1s ease-in-out"
              }}
            />
          ))}
        </div>
        
        {/* Volume slider */}
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 size={14} className="text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 rounded-full accent-primary"
          />
        </div>
        
        {/* Sound type selection */}
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => changeSound("redshift")}
            className={`rounded py-1 px-2 text-xs transition-colors ${getActiveColor("redshift")} ${activeSound === "redshift" ? "text-white" : "text-foreground"}`}
          >
            Redshift
          </button>
          <button
            onClick={() => changeSound("blueshift")}
            className={`rounded py-1 px-2 text-xs transition-colors ${getActiveColor("blueshift")} ${activeSound === "blueshift" ? "text-white" : "text-foreground"}`}
          >
            Blueshift
          </button>
          <button
            onClick={() => changeSound("greenshift")}
            className={`rounded py-1 px-2 text-xs transition-colors ${getActiveColor("greenshift")} ${activeSound === "greenshift" ? "text-white" : "text-foreground"}`}
          >
            Greenshift
          </button>
          <button
            onClick={() => changeSound("cosmic")}
            className={`rounded py-1 px-2 text-xs transition-colors ${getActiveColor("cosmic")} text-white`}
          >
            Cosmic
          </button>
        </div>
        
        {/* Hidden audio elements (would work with actual audio files) */}
        <audio ref={redshiftRef} src={audioSources.redshift} loop preload="none" />
        <audio ref={blueshiftRef} src={audioSources.blueshift} loop preload="none" />
        <audio ref={greenshiftRef} src={audioSources.greenshift} loop preload="none" />
        <audio ref={cosmicRef} src={audioSources.cosmic} loop preload="none" />
        
        <div className="mt-3 text-[10px] text-muted-foreground text-center">
          Note: This is a visual mock-up. Add real audio files to enable sound.
        </div>
      </motion.div>
    </div>
  );
};

export default CosmicSoundscape;