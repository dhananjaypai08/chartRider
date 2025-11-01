import { BlockData, Platform, Player, GameState, Controls } from '@/types/game';

const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const MAX_VELOCITY_Y = 20;
const PLATFORM_SPACING = 200;
const BASE_PLATFORM_WIDTH = 150;
const PLATFORM_HEIGHT = 20;

const MEME_IMAGES = [
  '🚀',
  '💎',
  '🌙',
  '⚡',
  '🔥',
  '💪',
  '🎯',
  '⭐',
];

export function createPlatformsFromBlocks(blocks: BlockData[]): Platform[] {
  const platforms: Platform[] = [];
  let currentX = 150; // Start first platform under player

  blocks.forEach((block, index) => {
    const gasUsed = parseInt(block.gasUsed);
    const size = parseInt(block.size);

    // Use gasUsed to determine platform height variation
    const heightVariation = (gasUsed % 200) - 100;
    // First platform is always at y=400 for safe landing
    const y = index === 0 ? 400 : 400 + heightVariation;

    // Use size to determine platform width
    const width = Math.max(BASE_PLATFORM_WIDTH, Math.min(size / 5, 300));

    // Every 8th platform is a meme platform for fun
    const isMeme = index % 8 === 0 && index > 0;

    platforms.push({
      x: currentX,
      y,
      width,
      height: PLATFORM_HEIGHT,
      blockData: block,
      type: isMeme ? 'meme' : 'normal',
      memeImage: isMeme ? MEME_IMAGES[index % MEME_IMAGES.length] : undefined,
    });

    currentX += width + PLATFORM_SPACING;
  });

  return platforms;
}

export function initializePlayer(): Player {
  return {
    x: 170, // Start above first platform
    y: 340, // Just above y=400
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    isGrounded: false,
  };
}

export function updatePlayer(
  player: Player,
  controls: Controls,
  platforms: Platform[]
): Player {
  const newPlayer = { ...player };

  // Horizontal movement
  if (controls.left) {
    newPlayer.velocityX = -MOVE_SPEED;
  } else if (controls.right) {
    newPlayer.velocityX = MOVE_SPEED;
  } else {
    newPlayer.velocityX = 0;
  }

  // Apply gravity
  newPlayer.velocityY = Math.min(newPlayer.velocityY + GRAVITY, MAX_VELOCITY_Y);

  // Jump
  if (controls.jump && newPlayer.isGrounded) {
    newPlayer.velocityY = JUMP_FORCE;
    newPlayer.isJumping = true;
    newPlayer.isGrounded = false;
  }

  // Update position
  newPlayer.x += newPlayer.velocityX;
  newPlayer.y += newPlayer.velocityY;

  // Check platform collisions
  newPlayer.isGrounded = false;
  
  for (const platform of platforms) {
    if (
      newPlayer.x + newPlayer.width > platform.x &&
      newPlayer.x < platform.x + platform.width &&
      newPlayer.y + newPlayer.height > platform.y &&
      newPlayer.y + newPlayer.height < platform.y + platform.height + 10 &&
      newPlayer.velocityY >= 0
    ) {
      newPlayer.y = platform.y - newPlayer.height;
      newPlayer.velocityY = 0;
      newPlayer.isGrounded = true;
      newPlayer.isJumping = false;
    }
  }

  return newPlayer;
}

export function checkGameOver(player: Player, canvasHeight: number): boolean {
  return player.y > canvasHeight + 100;
}

export function calculateScore(player: Player, platforms: Platform[]): number {
  const passedPlatforms = platforms.filter(
    platform => platform.x + platform.width < player.x
  );
  return passedPlatforms.length * 100;
}

export function getCameraX(player: Player, canvasWidth: number): number {
  return Math.max(0, player.x - canvasWidth / 3);
}