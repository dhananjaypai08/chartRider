'use client';

interface GameOverModalProps {
  score: number;
  time: number;
  onPlayAgain: () => void;
}

export default function GameOverModal({ score, time, onPlayAgain }: GameOverModalProps) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const shareOnX = () => {
    const text = `I just rode the Katana blockchain! 🚀\n\nScore: ${score}\nTime: ${minutes}:${seconds.toString().padStart(2, '0')}\n\nRide the blocks at `;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const tradeOnKatana = () => {
    window.open('https://app.katana.network/', '_blank');
  };

  // Use shadcn/ui Card and Button components
  // Subtle palette: #f8fafc (light gray), #e5e7eb (gray), #facc15 (yellow accent)
  return (
    <div className="fixed inset-0 bg-[#f8fafc] bg-opacity-95 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-2xl shadow-xl border border-[#e5e7eb] bg-white p-8">
          <h2 className="text-3xl font-bold text-[#facc15] mb-2">Game Over</h2>
          <p className="text-lg text-[#334155] mb-6">Your Katana ride is complete!</p>
          <div className="bg-[#f8fafc] rounded-xl p-6 mb-6 border border-[#e5e7eb]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Final Score</p>
                <p className="text-2xl font-bold text-[#facc15]">{score}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Time</p>
                <p className="text-2xl font-bold text-[#334155]">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={shareOnX}
              className="w-full bg-[#e5e7eb] hover:bg-[#f8fafc] text-[#334155] font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Share on X
            </button>
            <button
              onClick={tradeOnKatana}
              className="w-full bg-[#facc15] hover:bg-yellow-300 text-[#334155] font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Trade on Katana
            </button>
            <button
              onClick={onPlayAgain}
              className="w-full bg-[#334155] hover:bg-[#64748b] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}