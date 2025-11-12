'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAccount, useWriteContract } from 'wagmi';
import { parseAbi } from 'viem';

const CONTRACT_ADDRESS = '0x64E3b356f15c93BE5548806E5bbee0AA2f0bf2d5' as const;
const CONTRACT_ABI = parseAbi([
  'function safeMint(uint256 time, uint256 score) external',
]);

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
  xProfilePic,
}: GameOverModalProps) {
  const { isConnected } = useAccount();
  const {
    writeContract,
    isPending,
    isSuccess,
    isError,
    error,
  } = useWriteContract();

  const handleClaimSBT = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'safeMint',
        args: [BigInt(time), BigInt(score)],
      });
    } catch (err: any) {
      if (
        err.message?.includes('User rejected') ||
        err.message?.includes('user rejected') ||
        err.shortMessage?.includes('User rejected')
      ) {
        alert('Transaction rejected.');
      } else {
        alert('Transaction failed. Please try again.');
      }
      console.warn('SBT claim failed:', err.message);
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const shareOnX = () => {
    const text = `I just conquered the Katana blockchain! 🥷\n\nScore: ${score}\nTime: ${minutes}:${seconds
      .toString()
      .padStart(2, '0')}\n\nJoin the adventure at `;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const tradeOnKatana = () => {
    window.open('https://app.katana.network/', '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0c1a43]/85 backdrop-blur-lg flex items-center justify-center z-40 p-4">
        <div className="max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-300">
          <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-[#0b9aed]/20 to-[#0c1a43]/40 backdrop-blur-xl p-7 border border-[#aee6fc]/15 relative z-50">
            {/* Header */}
            <div className="text-center mb-5">
              {xConnected && xUsername && (
                <h2 className="text-2xl font-light text-white mb-1">
                  @{xUsername},
                </h2>
              )}
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Epic Run, Ninja!
              </h1>
            </div>

            {/* Character Display */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-32 h-32 bg-white/8 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-[#aee6fc]/12">
                  {xConnected && xProfilePic ? (
                    <div className="relative">
                      <Avatar className="w-28 h-28 border-3 border-[#F4FF00]/40">
                        <AvatarImage src={xProfilePic} />
                        <AvatarFallback className="bg-[#053b9a] text-white text-2xl">
                          {xUsername?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute top-7 left-0 right-0 h-3 bg-[#F4FF00] rounded shadow-sm"></div>
                    </div>
                  ) : (
                    <div className="text-7xl">🥷</div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 mb-5 border border-[#aee6fc]/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-white/60 font-light mb-1">Track</p>
                  <p className="text-sm font-semibold text-white">Katana Arena</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 font-light mb-1">
                    Final Time
                  </p>
                  <p className="text-xl font-semibold text-[#F4FF00]">
                    {minutes.toString().padStart(2, '0')}:
                    {seconds.toString().padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/60 font-light mb-1">Score</p>
                  <p className="text-xl font-semibold text-[#F4FF00]">
                    {score}
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2.5">

              <Button
                onClick={handleClaimSBT}
                disabled={isPending || isSuccess}
                className={`w-full h-12 text-sm font-semibold rounded-lg border-none shadow-lg hover:shadow-xl transition-all tracking-wide ${
                  isPending
                    ? 'bg-[#FFF9B3] text-[#0c1a43] cursor-wait'
                    : isSuccess
                    ? 'bg-green-400 text-[#0c1a43]'
                    : 'bg-[#F4FF00] hover:bg-[#FFF9B3] text-[#0c1a43]'
                }`}
              >
                {isPending
                  ? 'Claiming...'
                  : isSuccess
                  ? 'SBT Claimed!'
                  : 'Claim SBT'}
              </Button>

              {isError && !isPending && !isSuccess && (
                <p className="text-red-400 text-xs text-center">
                  {error?.message?.includes('User rejected')
                    ? 'Transaction rejected'
                    : 'Transaction failed. Try again.'}
                </p>
              )}

              <Button
                onClick={shareOnX}
                variant="outline"
                className="w-full h-12 text-sm font-medium bg-white/5 hover:bg-white/10 text-white border border-[#aee6fc]/15 backdrop-blur-sm transition-all rounded-lg"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </Button>

              <Button
                onClick={tradeOnKatana}
                className="w-full h-12 text-sm font-semibold bg-[#F4FF00] hover:bg-[#FFF9B3] text-[#0c1a43] border-none shadow-lg hover:shadow-xl transition-all rounded-lg"
              >
                Trade on Katana
              </Button>

              <Button
                onClick={onPlayAgain}
                className="w-full h-12 text-sm font-medium bg-white/5 hover:bg-white/10 text-white border border-[#aee6fc]/15 backdrop-blur-sm transition-all rounded-lg"
              >
                Play Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
