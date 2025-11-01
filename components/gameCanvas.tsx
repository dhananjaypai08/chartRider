'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BlockData, GameState, Controls } from '@/types/game';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  createPlatformsFromBlocks,
  initializePlayer,
  updatePlayer,
  checkGameOver,
  calculateScore,
  getCameraX,
} from '@/utils/gameEngine';

interface GameCanvasProps {
  blocks: BlockData[];
  onGameOver: (score: number, time: number) => void;
  xConnected?: boolean;
  xUsername?: string;
  xProfilePic?: string;
}

const CRYPTO_MEMES = [
  '🚀 TO THE MOON!',
  '💎 DIAMOND HANDS',
  '📈 WAGMI',
  '🔥 GM EVERYONE',
  '⚡ LFG!',
  '🌙 MOON SOON',
  '💪 HODL STRONG',
  '🎯 BULLISH AF',
  '🦾 STAYING STRONG',
  '✨ WEN LAMBO',
];

// Helper to format timestamp
function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor(Date.now() / 1000 - Number(timestamp));
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean
) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = Math.min(radius, width / 2, height / 2);
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

export default function GameCanvas({ blocks, onGameOver, xConnected, xUsername, xProfilePic }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [controls, setControls] = useState<Controls>({
    left: false,
    right: false,
    jump: false,
  });
  const [showMeme, setShowMeme] = useState(false);
  const [currentMeme, setCurrentMeme] = useState('');
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const audioContextRef = useRef<AudioContext | null>(null);
  const profileImageRef = useRef<HTMLImageElement | null>(null);
  const gameOverSoundPlayedRef = useRef(false);

  // Load profile picture
  useEffect(() => {
    if (xConnected && xProfilePic) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = xProfilePic;
      img.onload = () => {
        profileImageRef.current = img;
      };
    }
  }, [xConnected, xProfilePic]);

  // Audio functions
  const playJumpSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  const playLandSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }, []);

  const playGameOverSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    
    // Create a descending tone sequence for "defeat" sound
    const times = [0, 0.15, 0.3, 0.45];
    const frequencies = [300, 250, 200, 150];
    
    times.forEach((time, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);
      oscillator.frequency.exponentialRampToValueAtTime(frequencies[index] * 0.8, audioContext.currentTime + time + 0.15);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.15);
      
      oscillator.start(audioContext.currentTime + time);
      oscillator.stop(audioContext.currentTime + time + 0.15);
    });
  }, []);

  // Show random crypto meme
  const showRandomMeme = useCallback(() => {
    const randomMeme = CRYPTO_MEMES[Math.floor(Math.random() * CRYPTO_MEMES.length)];
    setCurrentMeme(randomMeme);
    setShowMeme(true);
    setTimeout(() => setShowMeme(false), 2000);
  }, []);

  // Initialize game
  useEffect(() => {
    const platforms = createPlatformsFromBlocks(blocks);
    const player = initializePlayer();
    
    setGameState({
      player,
      platforms,
      score: 0,
      time: 0,
      isGameOver: false,
      gameStarted: true,
      cameraX: 0,
    });
    
    startTimeRef.current = Date.now();
    gameOverSoundPlayedRef.current = false;
  }, [blocks]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setControls(prev => ({ ...prev, left: true }));
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setControls(prev => ({ ...prev, right: true }));
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setControls(prev => {
          if (!prev.jump) {
            playJumpSound();
          }
          return { ...prev, jump: true };
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setControls(prev => ({ ...prev, left: false }));
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setControls(prev => ({ ...prev, right: false }));
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setControls(prev => ({ ...prev, jump: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playJumpSound]);

  // Track previous grounded state for landing sound
  const prevGroundedRef = useRef(false);

  // Game loop
  useEffect(() => {
    if (!gameState || gameState.isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const newPlayer = updatePlayer(gameState.player, controls, gameState.platforms);
      const newScore = calculateScore(newPlayer, gameState.platforms);
      const newCameraX = getCameraX(newPlayer, canvas.width);
      const newTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Play landing sound
      if (!prevGroundedRef.current && newPlayer.isGrounded) {
        playLandSound();
      }
      prevGroundedRef.current = newPlayer.isGrounded;

      // Show crypto meme occasionally
      if (Math.random() < 0.002) {
        showRandomMeme();
      }

      // Check game over
      const isGameOver = checkGameOver(newPlayer, canvas.height);

      if (isGameOver) {
        if (!gameOverSoundPlayedRef.current) {
          playGameOverSound();
          gameOverSoundPlayedRef.current = true;
        }
        setGameState(prev => prev ? { ...prev, isGameOver: true } : null);
        onGameOver(newScore, newTime);
        return;
      }

      setGameState({
        ...gameState,
        player: newPlayer,
        score: newScore,
        time: newTime,
        cameraX: newCameraX,
      });

      renderGame(
        ctx,
        canvas,
        gameState,
        newPlayer,
        newCameraX,
        newScore,
        newTime,
        xConnected || false,
        xUsername || '',
        profileImageRef.current
      );

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, controls, onGameOver, playLandSound, playGameOverSound, showRandomMeme, xConnected, xUsername]);

  return (
    <div className="relative">
      {/* HUD */}
      <div className="mb-4 flex justify-between items-center gap-4">
        {xConnected && (
          <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 shadow-sm">
            <Avatar className="w-10 h-10 border-2 border-purple-300">
              <AvatarImage src={xProfilePic} />
              <AvatarFallback className="bg-slate-700 text-white">
                {xUsername?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs text-slate-500 font-medium">Ninja Runner</div>
              <div className="text-sm font-bold text-slate-900">@{xUsername}</div>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 ml-auto">
          <div className="px-4 py-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Score</div>
            <div className="text-xl font-bold text-slate-700">{gameState?.score || 0}</div>
          </div>
          
          <div className="px-4 py-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Time</div>
            <div className="text-lg font-bold text-slate-700">
              {Math.floor((gameState?.time || 0) / 60)}:{((gameState?.time || 0) % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="w-full h-full"
          style={{ imageRendering: 'auto' }}
        />
        
        {/* Crypto Meme Overlay */}
        {showMeme && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 text-white px-8 py-4 rounded-lg text-3xl font-bold animate-pulse pointer-events-none">
            {currentMeme}
          </div>
        )}
      </div>
    </div>
  );
}

function renderGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gameState: GameState,
  player: any,
  cameraX: number,
  score: number,
  time: number,
  xConnected: boolean,
  xUsername: string,
  profileImage: HTMLImageElement | null
) {
  // Clear with gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#f1f5f9');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle floating particles
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 30; i++) {
    const particleX = (cameraX * 0.3 + i * 80) % canvas.width;
    const particleY = 50 + Math.sin((cameraX + i * 50) * 0.02) * 40;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Draw platforms
  gameState.platforms.forEach((platform) => {
    if (
      platform.x + platform.width > cameraX - 100 &&
      platform.x < cameraX + canvas.width + 100
    ) {
      // Platform shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Platform gradient - subtle colors
      const platGrad = ctx.createLinearGradient(
        platform.x,
        platform.y,
        platform.x,
        platform.y + platform.height
      );
      
      if (platform.type === 'meme') {
        platGrad.addColorStop(0, '#f59e0b');
        platGrad.addColorStop(1, '#d97706');
      } else {
        platGrad.addColorStop(0, '#94a3b8');
        platGrad.addColorStop(1, '#64748b');
      }
      
      ctx.fillStyle = platGrad;
      roundRect(ctx, platform.x, platform.y, platform.width, platform.height, 12, true, false);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Platform border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, platform.x, platform.y, platform.width, platform.height, 12, false, true);

      // Gas info and timestamp
      const gasUsed = parseInt(platform.blockData.gasUsed);
      const timeAgo = formatTimeAgo(platform.blockData.timestamp);
      
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = '#475569';
      ctx.fillText(
        `Gas: ${gasUsed.toLocaleString()}`,
        platform.x + platform.width / 2,
        platform.y + platform.height + 16
      );
      ctx.font = '10px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(
        timeAgo,
        platform.x + platform.width / 2,
        platform.y + platform.height + 30
      );
    }
  });

  // Draw ninja character
  const ninjaX = player.x + player.width / 2;
  const ninjaY = player.y + player.height / 2;
  const ninjaRadius = player.width / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(ninjaX, ninjaY + ninjaRadius + 5, ninjaRadius * 0.8, ninjaRadius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head circle
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(ninjaX, ninjaY, ninjaRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Profile picture overlay if X connected
  if (xConnected && profileImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ninjaX, ninjaY, ninjaRadius - 2, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw profile image to fill the circle
    ctx.drawImage(
      profileImage,
      ninjaX - ninjaRadius,
      ninjaY - ninjaRadius,
      ninjaRadius * 2,
      ninjaRadius * 2
    );
    ctx.restore();
    
    // Add subtle border around profile pic
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ninjaX, ninjaY, ninjaRadius - 1, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Headband
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(ninjaX - ninjaRadius, ninjaY - ninjaRadius * 0.5, ninjaRadius * 2, 8);
  
  // Headband knot
  ctx.beginPath();
  ctx.arc(ninjaX + ninjaRadius + 4, ninjaY - ninjaRadius * 0.46, 4, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (only if no profile pic)
  if (!xConnected || !profileImage) {
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(ninjaX - ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.1, 4, 0, Math.PI * 2);
    ctx.arc(ninjaX + ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.1, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(ninjaX - ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.1, 2, 0, Math.PI * 2);
    ctx.arc(ninjaX + ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Katana sword
  ctx.save();
  ctx.translate(ninjaX, ninjaY);
  ctx.rotate(-0.4);
  
  const bladeGrad = ctx.createLinearGradient(0, 0, 50, 0);
  bladeGrad.addColorStop(0, '#cbd5e1');
  bladeGrad.addColorStop(0.5, '#f1f5f9');
  bladeGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bladeGrad;
  ctx.fillRect(10, -2, 50, 4);
  
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(5, -4, 10, 8);
  
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(14, -5, 3, 10);
  
  ctx.restore();

  // Arms
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ninjaX - ninjaRadius * 0.6, ninjaY + ninjaRadius * 0.3);
  ctx.lineTo(ninjaX - ninjaRadius * 1.2, ninjaY + ninjaRadius * 0.8);
  ctx.moveTo(ninjaX + ninjaRadius * 0.6, ninjaY + ninjaRadius * 0.3);
  ctx.lineTo(ninjaX + ninjaRadius * 1.2, ninjaY + ninjaRadius * 0.6);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(ninjaX - ninjaRadius * 0.3, ninjaY + ninjaRadius);
  ctx.lineTo(ninjaX - ninjaRadius * 0.5, ninjaY + ninjaRadius * 1.8);
  ctx.moveTo(ninjaX + ninjaRadius * 0.3, ninjaY + ninjaRadius);
  ctx.lineTo(ninjaX + ninjaRadius * 0.5, ninjaY + ninjaRadius * 1.8);
  ctx.stroke();

  ctx.restore();
}