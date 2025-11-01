'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface GameOverModalProps {
  score: number;
  time: number;
  onPlayAgain: () => void;
  xConnected?: boolean;
  xUsername?: string;
  xProfilePic?: string;
}

export default function GameOverModal({ 
  score, 
  time, 
  onPlayAgain,
  xConnected,
  xUsername,
  xProfilePic
}: GameOverModalProps) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const shareOnX = () => {
    const text = `I just conquered the Katana blockchain! 🥷\n\nScore: ${score}\nTime: ${minutes}:${seconds.toString().padStart(2, '0')}\n\nJoin the adventure at `;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const tradeOnKatana = () => {
    window.open('https://app.katana.network/', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-300">
        <div className="rounded-2xl shadow-2xl bg-white p-8 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-6">
            {xConnected && xUsername && (
              <h2 className="text-3xl font-bold text-slate-800 mb-1">
                @{xUsername},
              </h2>
            )}
            <h1 className="text-4xl font-bold text-slate-800">
              Epic Run, Ninja!
            </h1>
          </div>

          {/* Character Display */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-purple-50 to-slate-100 rounded-2xl flex items-center justify-center shadow-lg">
                {xConnected && xProfilePic ? (
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-purple-300">
                      <AvatarImage src={xProfilePic} />
                      <AvatarFallback className="bg-slate-700 text-white text-3xl">
                        {xUsername?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Ninja headband overlay */}
                    <div className="absolute top-8 left-0 right-0 h-4 bg-red-500 rounded"></div>
                  </div>
                ) : (
                  <div className="text-8xl">🥷</div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-6 mb-6 border border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Track</p>
                <p className="text-lg font-bold text-slate-800">Katana Arena</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Final Time</p>
                <p className="text-2xl font-bold text-slate-700">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Score</p>
                <p className="text-2xl font-bold text-slate-700">{score}</p>
              </div>
            </div>
          </div>

          {/* Buttons - Light and subtle */}
          <div className="space-y-3">
            <Button
              onClick={shareOnX}
              variant="outline"
              className="w-full h-14 text-base font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </Button>

            <Button
              onClick={tradeOnKatana}
              className="w-full h-14 text-base font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-sm transition-all"
            >
              Trade on Katana
            </Button>

            <Button
              onClick={onPlayAgain}
              className="w-full h-14 text-base font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-400 shadow-sm transition-all"
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}