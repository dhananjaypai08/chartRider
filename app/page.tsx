'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { fetchKatanaBlocks } from './graphql';
import GameCanvas from '@/components/gameCanvas';
import GameOverModal from '@/components/GameoverModal';
import LoadingScreen from '@/components/LoadingScreen';
import { BlockData } from '@/types/game';
import { createPublicClient, http, parseAbi } from 'viem';

// ✅ Define outside component (prevents re-creation)
const KATANA_RPC = 'https://rpc.katana.network';
const CONTRACT_ADDRESS = '0x722CEa3909349018E69113227353da768adDb3eB' as const;
const CONTRACT_ABI = parseAbi([
  'function getUsers() view returns (address[])',
  'function getUserScore(address user) view returns (uint256 score, uint256 time)',
]);

const publicClient = createPublicClient({
  transport: http(KATANA_RPC),
});

interface LeaderboardEntry {
  user: string;
  score: number;
  time: number;
}

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // ✅ Fetch leaderboard only once
  useEffect(() => {
    let mounted = true;
    const fetchLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        const users = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getUsers',
        });

        if (!users || users.length === 0) {
          if (mounted) setLeaderboard([]);
          return;
        }

        const entries = await Promise.all(
          users.map(async (user: any) => {
            try {
              const [score, time] = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getUserScore',
                args: [user],
              });
              return { user, score: Number(score), time: Number(time) };
            } catch {
              return { user, score: 0, time: 0 };
            }
          })
        );

        const sorted = entries
          .filter((e) => e.score > 0)
          .sort((a, b) => b.score - a.score);

        if (mounted) setLeaderboard(sorted);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        if (mounted) setLeaderboard([]);
      } finally {
        if (mounted) setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
    return () => {
      mounted = false;
    };
  }, []); // ✅ Empty dependency array → runs once only

  // ✅ Memoized canvas (prevents re-renders)
  const memoizedCanvas = useMemo(
    () => (
      <GameCanvas
        blocks={blocks}
        onGameOver={(score: number, time: number) => {
          setFinalScore(score);
          setFinalTime(time);
          setGameOver(true);
        }}
      />
    ),
    [blocks]
  );

  // ✅ Start game (no visual reflows)
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

  const handlePlayAgain = () => {
    setGameOver(false);
    setGameStarted(false);
    setBlocks([]);
  };

  if (loading) return <LoadingScreen />;

  if (gameStarted && blocks.length > 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--katana-bg)] p-4">
        <div className="w-full max-w-6xl mx-auto relative">
          {memoizedCanvas}
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 gap-8 bg-[var(--katana-bg)]">
      {/* Left Leaderboard Panel */}
      <aside className="w-full max-w-xs bg-[var(--katana-card)] border border-[var(--katana-border)] rounded-2xl shadow-lg backdrop-blur-md p-6">
        <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">
          🏆 Leaderboard
        </h3>

        {leaderboardLoading ? (
          <p className="text-white/60 text-sm">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-white/60 text-sm">
            No players yet — be the first ninja!
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, idx) => (
              <div
                key={entry.user}
                className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2 border border-white/10"
              >
                <span className="text-sm text-white/80 font-medium">
                  #{idx + 1} {entry.user.slice(0, 6)}…{entry.user.slice(-4)}
                </span>
                <span className="text-sm font-semibold text-[#F4FF00]">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Game Intro */}
      <div className="flex-1 w-full max-w-2xl text-center">
        <div className="mb-8">
          <Image
            src="/Katana-banner.png"
            alt="Katana Banner"
            width={220}
            height={120}
            className="mx-auto object-contain drop-shadow-[0_0_12px_rgba(11,154,237,0.25)] rounded"
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
          <div className="mb-5 bg-red-500/15 border border-red-400/25 backdrop-blur-sm rounded-xl p-3">
            <p className="text-white/90 text-sm">{error}</p>
          </div>
        )}

        <Card className="p-8 bg-[var(--katana-card)] border border-[var(--katana-border)] rounded-2xl shadow-md backdrop-blur-md">
          <Button
            onClick={startGame}
            className="w-full h-14 text-base font-semibold bg-[var(--katana-yellow)] hover:bg-[var(--katana-yellow-soft)] text-[var(--katana-blue-dark)] rounded-xl shadow-md hover:shadow-lg transition-all tracking-wide"
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
            <p className="text-xs text-white/45 font-light">
              Powered by Katana Network
            </p>
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
