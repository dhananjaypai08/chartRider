'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchKatanaBlocks } from './graphql';
import { BlockData } from '@/types/game';
import GameCanvas from '@/components/gameCanvas';
import GameOverModal from '@/components/GameoverModal';
import LoadingScreen from '@/components/LoadingScreen';

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
      const response = await fetchKatanaBlocks();
      
      if (!response.data.blocks || response.data.blocks.length === 0) {
        throw new Error('No blocks found');
      }
      
      setBlocks(response.data.blocks);
      setGameStarted(true);
      setGameOver(false);
    } catch (err) {
      setError('Failed to load blocks. Please try again.');
      console.error(err);
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (gameStarted && blocks.length > 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="w-full max-w-5xl mx-auto rounded-xl shadow-lg bg-white border border-[#e5e7eb] p-6">
          <GameCanvas blocks={blocks} onGameOver={handleGameOver} />
        </div>
        {gameOver && (
          <GameOverModal
            score={finalScore}
            time={finalTime}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <img src="/Katana-banner.png" alt="Katana Banner" className="w-56 h-40 object-contain mb-4 rounded-xl shadow-lg" />
          <h1 className="text-5xl font-extrabold text-[#334155] mb-2 tracking-tight">Katana Block Rider</h1>
          <p className="text-lg text-[#64748b] mb-4">Surf the blocks like never before</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center mb-8">
          <Button
            onClick={startGame}
            disabled={loading}
            className="text-lg px-8 py-4 bg-[#facc15] hover:bg-yellow-300 text-[#334155] font-bold rounded-xl shadow-md border border-[#e5e7eb]"
            variant="default"
          >
            {loading ? 'Loading...' : 'Start Game'}
          </Button>
        </div>

        {/* Instructions & Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 border border-[#e5e7eb] bg-white text-[#334155] shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-center">How to Play</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold">→ / D</span> - Move Right</li>
              <li><span className="font-semibold">← / A</span> - Move Left</li>
              <li><span className="font-semibold">SPACE / W / ↑</span> - Jump</li>
            </ul>
          </Card>
          <Card className="p-6 border border-[#e5e7eb] bg-white text-[#334155] shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-center">Game Features</h3>
            <ul className="space-y-2 text-sm">
              <li>Jump across real Katana network blocks</li>
              <li>Platform heights = Gas usage</li>
              <li>Platform widths = Block size</li>
              <li>+100 points per block passed</li>
              <li>Live Katana network data</li>
            </ul>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-[#64748b]">
          <p className="mb-2">Powered by Katana Network</p>
          <a
            href="https://app.katana.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#facc15] hover:text-yellow-400 underline font-semibold"
          >
            Visit Katana Network
          </a>
        </div>
      </div>
    </div>
  );
}