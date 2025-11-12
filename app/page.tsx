'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { fetchKatanaBlocks } from './graphql';
import GameCanvas from '@/components/gameCanvas';
import GameOverModal from '@/components/GameoverModal';
import LoadingScreen from '@/components/LoadingScreen';
import { BlockData } from '@/types/game';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);

  const startGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKatanaBlocks();
      setBlocks(res.data.blocks || []);
      setGameStarted(true);
    } catch (e) {
      setError('Failed to load blocks. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = (score: number, time: number) => {
    setFinalScore(score);
    setFinalTime(time);
    setGameOver(true);
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    setGameStarted(false);
    setBlocks([]);
  };

  if (loading) return <LoadingScreen />;

  if (gameStarted && blocks.length > 0)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <GameCanvas blocks={blocks} onGameOver={handleGameOver} />
        </div>
        {gameOver && (
          <GameOverModal score={finalScore} time={finalTime} onPlayAgain={handlePlayAgain} />
        )}
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <Image
            src="/Katana-banner.png"
            alt="Katana Banner"
            width={220}
            height={120}
            className="mx-auto object-contain drop-shadow-[0_0_18px_rgba(11,154,237,0.25)] rounded"
            priority
          />
          <h1 className="text-5xl font-light mt-4 tracking-tight text-white">
            Katana Block Rider
          </h1>
          <p className="text-white/65 mt-2 text-base font-light">
            A smooth on-chain adventure across Katana blocks
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/15 border border-red-400/25 backdrop-blur-md rounded-xl p-3">
            <p className="text-white/90 text-sm">{error}</p>
          </div>
        )}

        <Card className="p-8 bg-[var(--katana-card)] border border-[var(--katana-border)] rounded-2xl shadow-2xl backdrop-blur-xl">
          <Button
            onClick={startGame}
            className="w-full h-14 text-base font-semibold bg-[var(--katana-yellow)] hover:bg-[var(--katana-yellow-soft)] text-[var(--katana-blue-dark)] rounded-xl shadow-lg hover:shadow-xl transition-all tracking-wide"
          >
            Start Game
          </Button>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-left">
              <h3 className="text-sm font-semibold mb-1">Controls</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                ← / A : Move Left <br />
                → / D : Move Right <br />
                Space / W / ↑ : Jump
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-left">
              <h3 className="text-sm font-semibold mb-1">Features</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Real gas data, dynamic blocks, crypto memes, and subtle soundscapes.
              </p>
            </div>
          </div>

          <div className="pt-5 text-center">
            <p className="text-xs text-white/45 font-light">Powered by Katana Network</p>
            <a
              href="https://app.katana.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--katana-yellow)] hover:text-[var(--katana-yellow-soft)] text-xs transition-colors"
            >
              Visit Katana →
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
