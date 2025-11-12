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
  radius = Math.min(radius, width / 2, height / 2);
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

  const showRandomMeme = useCallback(() => {
    const randomMeme = CRYPTO_MEMES[Math.floor(Math.random() * CRYPTO_MEMES.length)];
    setCurrentMeme(randomMeme);
    setShowMeme(true);
    setTimeout(() => setShowMeme(false), 2000);
  }, []);

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

  const prevGroundedRef = useRef(false);

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

      if (!prevGroundedRef.current && newPlayer.isGrounded) {
        playLandSound();
      }
      prevGroundedRef.current = newPlayer.isGrounded;

      if (Math.random() < 0.002) {
        showRandomMeme();
      }

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
      {/* HUD - Sleek and Minimal */}
      <div className="mb-4 flex justify-between items-center gap-4">
        {xConnected && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg">
            <Avatar className="w-9 h-9 border-2 border-[#F4FF00]/50">
              <AvatarImage src={xProfilePic} />
              <AvatarFallback className="bg-[#2C5F8D] text-white text-sm">
                {xUsername?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-[10px] text-white/60 font-light uppercase tracking-wide">Rider</div>
              <div className="text-sm font-medium text-white">@{xUsername}</div>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 ml-auto">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg">
            <div className="text-[10px] text-white/60 font-light uppercase tracking-wide mb-0.5">Score</div>
            <div className="text-2xl font-bold text-[#F4FF00] tabular-nums">{gameState?.score || 0}</div>
          </div>
          
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg">
            <div className="text-[10px] text-white/60 font-light uppercase tracking-wide mb-0.5">Time</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {Math.floor((gameState?.time || 0) / 60)}:{((gameState?.time || 0) % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas - Professional Design */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="w-full h-full"
          style={{ imageRendering: 'auto' }}
        />
        
        {/* Crypto Meme Overlay */}
        {showMeme && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0E1633]/90 backdrop-blur-sm text-white px-8 py-4 rounded-2xl text-2xl font-bold animate-pulse pointer-events-none border border-[#F4FF00]/30">
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
  // Professional gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#5B99C2');
  bgGrad.addColorStop(0.5, '#4A7FA7');
  bgGrad.addColorStop(1, '#2C5F8D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle floating particles
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 40; i++) {
    const particleX = (cameraX * 0.2 + i * 60) % canvas.width;
    const particleY = 30 + Math.sin((cameraX + i * 40) * 0.015) * 30;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Draw platforms - sleek and modern
  gameState.platforms.forEach((platform) => {
    if (
      platform.x + platform.width > cameraX - 100 &&
      platform.x < cameraX + canvas.width + 100
    ) {
      // Platform shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 5;

      // Platform gradient
      const platGrad = ctx.createLinearGradient(
        platform.x,
        platform.y,
        platform.x,
        platform.y + platform.height
      );
      
      if (platform.type === 'meme') {
        // Yellow accent for special platforms
        platGrad.addColorStop(0, '#F4FF00');
        platGrad.addColorStop(1, '#E0E800');
      } else {
        // White/glass platforms
        platGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        platGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
      }
      
      ctx.fillStyle = platGrad;
      roundRect(ctx, platform.x, platform.y, platform.width, platform.height, 8, true, false);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Platform border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, platform.x, platform.y, platform.width, platform.height, 8, false, true);

      // Minimalist data display
      const gasUsed = parseInt(platform.blockData.gasUsed);
      const timeAgo = formatTimeAgo(platform.blockData.timestamp);
      
      ctx.textAlign = 'center';
      ctx.font = '500 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(
        `${gasUsed.toLocaleString()} gas`,
        platform.x + platform.width / 2,
        platform.y + platform.height + 14
      );
      ctx.font = '400 9px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(
        timeAgo,
        platform.x + platform.width / 2,
        platform.y + platform.height + 26
      );
    }
  });

  // Draw ninja character - sleeker design
  const ninjaX = player.x + player.width / 2;
  const ninjaY = player.y + player.height / 2;
  const ninjaRadius = player.width / 2;

  // Character shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(ninjaX, ninjaY + ninjaRadius + 5, ninjaRadius * 0.9, ninjaRadius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Character body
  if (xConnected && profileImage) {
    // Profile picture
    ctx.save();
    ctx.beginPath();
    ctx.arc(ninjaX, ninjaY, ninjaRadius, 0, Math.PI * 2);
    ctx.clip();
    
    ctx.drawImage(
      profileImage,
      ninjaX - ninjaRadius,
      ninjaY - ninjaRadius,
      ninjaRadius * 2,
      ninjaRadius * 2
    );
    ctx.restore();
    
    // Yellow border
    ctx.strokeStyle = '#F4FF00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ninjaX, ninjaY, ninjaRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Default ninja
    const charGrad = ctx.createRadialGradient(ninjaX, ninjaY, 0, ninjaX, ninjaY, ninjaRadius);
    charGrad.addColorStop(0, '#1A4971');
    charGrad.addColorStop(1, '#0E1633');
    ctx.fillStyle = charGrad;
    ctx.beginPath();
    ctx.arc(ninjaX, ninjaY, ninjaRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ninjaX - ninjaRadius * 0.3, ninjaY - ninjaRadius * 0.1, 3, 0, Math.PI * 2);
    ctx.arc(ninjaX + ninjaRadius * 0.3, ninjaY - ninjaRadius * 0.1, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Yellow headband
  ctx.fillStyle = '#F4FF00';
  ctx.fillRect(ninjaX - ninjaRadius, ninjaY - ninjaRadius * 0.5, ninjaRadius * 2, 6);
  
  // Headband knot
  ctx.beginPath();
  ctx.arc(ninjaX + ninjaRadius + 3, ninjaY - ninjaRadius * 0.47, 3, 0, Math.PI * 2);
  ctx.fill();

  // Simple limbs
  ctx.strokeStyle = 'rgba(14, 22, 51, 0.8)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ninjaX - ninjaRadius * 0.5, ninjaY + ninjaRadius * 0.3);
  ctx.lineTo(ninjaX - ninjaRadius * 1, ninjaY + ninjaRadius * 0.7);
  ctx.moveTo(ninjaX + ninjaRadius * 0.5, ninjaY + ninjaRadius * 0.3);
  ctx.lineTo(ninjaX + ninjaRadius * 1, ninjaY + ninjaRadius * 0.7);
  ctx.moveTo(ninjaX - ninjaRadius * 0.2, ninjaY + ninjaRadius);
  ctx.lineTo(ninjaX - ninjaRadius * 0.4, ninjaY + ninjaRadius * 1.6);
  ctx.moveTo(ninjaX + ninjaRadius * 0.2, ninjaY + ninjaRadius);
  ctx.lineTo(ninjaX + ninjaRadius * 0.4, ninjaY + ninjaRadius * 1.6);
  ctx.stroke();

  ctx.restore();
}