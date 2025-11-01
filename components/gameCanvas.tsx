'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BlockData, GameState, Controls } from '@/types/game';
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
}

// Helper: draw rounded rectangle (filled and/or stroked)
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

export default function GameCanvas({ blocks, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [controls, setControls] = useState<Controls>({
    left: false,
    right: false,
    jump: false,
  });
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

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
        setControls(prev => ({ ...prev, jump: true }));
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
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState || gameState.isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Update game state
      const newPlayer = updatePlayer(gameState.player, controls, gameState.platforms);
      const newScore = calculateScore(newPlayer, gameState.platforms);
      const newCameraX = getCameraX(newPlayer, canvas.width);
      const newTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Check game over
      const isGameOver = checkGameOver(newPlayer, canvas.height);

      if (isGameOver) {
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

      // Render
      renderGame(ctx, canvas, gameState, newPlayer, newCameraX, newScore, newTime);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, controls, onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={600}
      className="w-full h-full rounded-lg"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

function renderGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gameState: GameState,
  player: any,
  cameraX: number,
  score: number,
  time: number
) {
  // Clear canvas with subtle light background
  // Background gradient inspired by katana-banner colors
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#f8fafc');
  bgGrad.addColorStop(1, '#eef2ff');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft parallax shapes (very subtle hills) for visual depth
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#e6eefb';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.25 - (cameraX % 300), canvas.height - 30, 420, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f1f5fb';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.75 - (cameraX % 450), canvas.height - 18, 360, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Draw platforms
  gameState.platforms.forEach(platform => {
    if (platform.x + platform.width > cameraX && platform.x < cameraX + canvas.width) {
      // Platform shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);

      // Smoothly transition platform color from light blue through blue, purple, and subtle yellow
      const palette = [
        [224, 242, 254], // light blue (#e0f2fe)
        [165, 180, 252], // blue (#a5b4fc)
        [196, 181, 253], // purple (#c4b5fd)
        [253, 224, 71],  // yellow (#fde047)
      ];
      const idx = gameState.platforms.indexOf(platform);
      const t = (idx + cameraX / 600) / (gameState.platforms.length / 1.5);
      // Interpolate between palette colors
      const seg = Math.floor(t * (palette.length - 1));
      const segT = (t * (palette.length - 1)) - seg;
      const colorA = palette[seg] || palette[0];
      const colorB = palette[seg + 1] || palette[palette.length - 1];
      const r = Math.round(colorA[0] * (1 - segT) + colorB[0] * segT);
      const g = Math.round(colorA[1] * (1 - segT) + colorB[1] * segT);
      const b = Math.round(colorA[2] * (1 - segT) + colorB[2] * segT);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

      // Platform border
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

      // Block info: show block number badge, gas and timestamp (subtle)
      ctx.font = '11px monospace';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      const gasUsed = parseInt(platform.blockData.gasUsed || '0');
  // Block number may not be present in the typed BlockData - cast to any to safely access
  const blockNum = ((platform.blockData as any).number as string) || ((platform.blockData as any).blockNumber as string) || '';
      const blockTime = new Date(Number(platform.blockData.timestamp) * 1000);
      const timeStr = `${blockTime.getHours().toString().padStart(2,'0')}:${blockTime.getMinutes().toString().padStart(2,'0')}`;

  // Removed block number badge for cleaner look

      // Gas and time under platform
      ctx.textAlign = 'center';
      ctx.fillStyle = '#475569';
      ctx.fillText(`Gas: ${gasUsed.toLocaleString()}`, platform.x + platform.width / 2, platform.y + platform.height + 16);
      ctx.fillText(`Time: ${timeStr}`, platform.x + platform.width / 2, platform.y + platform.height + 32);
    }
  });

  // Draw ninja character
  const ninjaX = player.x + player.width / 2;
  const ninjaY = player.y + player.height / 2;
  const ninjaRadius = player.width / 2;

  // Head (dark gray)
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(ninjaX, ninjaY, ninjaRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ninja band (yellow accent)
  ctx.save();
  ctx.beginPath();
  ctx.arc(ninjaX, ninjaY, ninjaRadius * 0.85, Math.PI * 0.75, Math.PI * 1.25);
  ctx.lineWidth = ninjaRadius * 0.35;
  ctx.strokeStyle = '#facc15';
  ctx.stroke();
  ctx.restore();

  // Katana (slung behind head) - subtle, stylized
  ctx.save();
  ctx.translate(ninjaX, ninjaY);
  const angle = -0.45; // tilt up-left
  ctx.rotate(angle);
  const bladeLen = ninjaRadius * 2.8;
  const bladeW = Math.max(3, ninjaRadius * 0.22);
  // Blade (light metallic)
  const bladeGrad = ctx.createLinearGradient(0, -bladeW / 2, bladeLen, bladeW / 2);
  bladeGrad.addColorStop(0, '#e6eefb');
  bladeGrad.addColorStop(0.5, '#f8fafc');
  bladeGrad.addColorStop(1, '#dbe7ff');
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.rect(-bladeLen * 0.25, -bladeW / 2, bladeLen, bladeW);
  ctx.fill();
  // Handle
  ctx.fillStyle = '#334155';
  ctx.fillRect(-bladeLen * 0.35 - 8, -bladeW / 2 - 4, 16, bladeW + 8);
  // Small accent on handle
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-bladeLen * 0.35 - 6, -bladeW / 2 + 2, 6, 6);
  ctx.restore();

  // Torso (subtle) to give silhouette
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(ninjaX, ninjaY + ninjaRadius * 0.9, ninjaRadius * 0.7, ninjaRadius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (white)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(ninjaX - ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.15, ninjaRadius * 0.18, ninjaRadius * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(ninjaX + ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.15, ninjaRadius * 0.18, ninjaRadius * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (dark)
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(ninjaX - ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.15, ninjaRadius * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ninjaX + ninjaRadius * 0.35, ninjaY - ninjaRadius * 0.15, ninjaRadius * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Draw UI overlay
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillRect(0, 0, canvas.width, 60);

  // Score
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 30, 30);

  // Time
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  ctx.fillText(
    `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    30,
    50
  );

  // Instructions hint
  ctx.font = '14px Arial';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('Arrow Keys / WASD to move • SPACE to jump', canvas.width / 2, canvas.height - 20);
}