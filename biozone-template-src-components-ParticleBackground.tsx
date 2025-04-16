import React, { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  pulse: boolean;
  pulseSpeed: number;
  growing: boolean;
}

interface ParticleBackgroundProps {
  colorTheme?: "redshift" | "blueshift" | "greenshift" | "cosmic";
  density?: number;
  interactive?: boolean;
  className?: string;
  speed?: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  colorTheme = "cosmic",
  density = 30,
  interactive = true,
  className = "",
  speed = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const animationRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  
  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Initialize particles
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const newParticles: Particle[] = [];
    const particleCount = Math.floor((dimensions.width * dimensions.height) / (20000 / density));
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(createParticle(dimensions.width, dimensions.height, colorTheme));
    }
    
    setParticles(newParticles);
  }, [dimensions, density, colorTheme]);
  
  // Animation loop
  useEffect(() => {
    if (particles.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      frameCountRef.current += 1;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      const updatedParticles = [...particles];
      
      updatedParticles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX * speed;
        particle.y += particle.speedY * speed;
        
        // Pulse animation
        if (particle.pulse) {
          if (particle.growing) {
            particle.size += particle.pulseSpeed;
            if (particle.size > particle.pulseSpeed * 10) {
              particle.growing = false;
            }
          } else {
            particle.size -= particle.pulseSpeed;
            if (particle.size < particle.pulseSpeed * 5) {
              particle.growing = true;
            }
          }
        }
        
        // Mouse interaction
        if (interactive && mousePosition) {
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distance) / 100;
            
            particle.speedX -= Math.cos(angle) * force * 0.2;
            particle.speedY -= Math.sin(angle) * force * 0.2;
            
            // Increase opacity when mouse is near
            particle.opacity = Math.min(1, particle.opacity + 0.05);
          } else {
            // Gradually return to original opacity
            particle.opacity = Math.max(particle.opacity - 0.01, 0.2 + Math.random() * 0.3);
          }
        }
        
        // Boundary checks with wrapping
        if (particle.x < 0) particle.x = dimensions.width;
        if (particle.x > dimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = dimensions.height;
        if (particle.y > dimensions.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace("opacity", particle.opacity.toString());
        ctx.fill();
        
        // Draw connections (only every few frames to improve performance)
        if (frameCountRef.current % 2 === 0) {
          drawConnections(ctx, particle, updatedParticles, index);
        }
      });
      
      setParticles(updatedParticles);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [particles, dimensions, mousePosition, interactive, speed]);
  
  // Mouse event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  const handleMouseLeave = () => {
    setMousePosition(null);
  };
  
  // Helper functions
  const createParticle = (width: number, height: number, theme: string): Particle => {
    // Determine color based on theme
    let color: string;
    
    if (theme === "cosmic") {
      const colorOption = Math.random();
      if (colorOption < 0.33) {
        color = "hsla(var(--redshift), opacity)"; // Redshift
      } else if (colorOption < 0.66) {
        color = "hsla(var(--blueshift), opacity)"; // Blueshift
      } else {
        color = "hsla(var(--greenshift), opacity)"; // Greenshift
      }
    } else if (theme === "redshift") {
      color = "hsla(var(--redshift), opacity)";
    } else if (theme === "blueshift") {
      color = "hsla(var(--blueshift), opacity)";
    } else {
      color = "hsla(var(--greenshift), opacity)";
    }
    
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color,
      opacity: 0.2 + Math.random() * 0.3,
      pulse: Math.random() > 0.9, // 10% of particles will pulse
      pulseSpeed: 0.02 + Math.random() * 0.03,
      growing: true
    };
  };
  
  const drawConnections = (
    ctx: CanvasRenderingContext2D,
    particle: Particle,
    particles: Particle[],
    currentIndex: number
  ) => {
    for (let i = currentIndex + 1; i < particles.length; i++) {
      const otherParticle = particles[i];
      const dx = particle.x - otherParticle.x;
      const dy = particle.y - otherParticle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only draw connections for nearby particles
      if (distance < 100) {
        // Calculate opacity based on distance (closer = more opaque)
        const opacity = (1 - distance / 100) * 0.2;
        
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(otherParticle.x, otherParticle.y);
        
        // Match connection color to particles
        const colorStart = particle.color.replace("opacity", opacity.toString());
        const colorEnd = otherParticle.color.replace("opacity", opacity.toString());
        
        const gradient = ctx.createLinearGradient(
          particle.x, particle.y, otherParticle.x, otherParticle.y
        );
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 ${className}`}
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
    />
  );
};

export default ParticleBackground;