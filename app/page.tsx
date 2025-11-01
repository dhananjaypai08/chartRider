'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { fetchKatanaBlocks } from './graphql';
import { BlockData } from '@/types/game';
import GameCanvas from '@/components/gameCanvas';
import GameOverModal from '@/components/GameoverModal';
import LoadingScreen from '@/components/LoadingScreen';
import Image from 'next/image';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  
  // X (Twitter) connection state
  const [xConnected, setXConnected] = useState(false);
  const [xUsername, setXUsername] = useState('');
  const [xProfilePic, setXProfilePic] = useState('');
  const [xConnecting, setXConnecting] = useState(false);

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

  const connectX = async () => {
    setXConnecting(true);
    
    try {
      // X OAuth 2.0 Flow
      const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
      
      if (!clientId || clientId === 'YOUR_CLIENT_ID') {
        // Development fallback with realistic avatar
        const randomSeed = Math.random().toString(36).substring(7);
        setXConnected(true);
        setXUsername('KatanaNinja');
        // Using DiceBear Personas for realistic human-like avatars
        setXProfilePic(`https://api.dicebear.com/7.x/personas/svg?seed=${randomSeed}`);
        setXConnecting(false);
        return;
      }
      
      // Production OAuth Flow
      const state = Math.random().toString(36).substring(7);
      sessionStorage.setItem('oauth_state', state);
      
      const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/callback');
      const scope = encodeURIComponent('tweet.read users.read');
      
      const authUrl = `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `state=${state}&` +
        `code_challenge=challenge&` +
        `code_challenge_method=plain`;
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'X OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth-success') {
          const { username, profilePicUrl } = event.data;
          setXConnected(true);
          setXUsername(username);
          setXProfilePic(profilePicUrl);
          setXConnecting(false);
          window.removeEventListener('message', handleMessage);
          popup?.close();
        } else if (event.data.type === 'oauth-error') {
          console.error('OAuth error:', event.data.error);
          setXConnecting(false);
          setError('Failed to connect X account. Please try again.');
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setXConnecting(false);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Error connecting X:', err);
      setError('Failed to initiate X connection. Please try again.');
      setXConnecting(false);
    }
  };

  const disconnectX = () => {
    setXConnected(false);
    setXUsername('');
    setXProfilePic('');
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <GameCanvas 
            blocks={blocks} 
            onGameOver={handleGameOver}
            xConnected={xConnected}
            xUsername={xUsername}
            xProfilePic={xProfilePic}
          />
        </div>
        {gameOver && (
          <GameOverModal
            score={finalScore}
            time={finalTime}
            onPlayAgain={handlePlayAgain}
            xConnected={xConnected}
            xUsername={xUsername}
            xProfilePic={xProfilePic}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header with Katana Banner */}
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <Image 
              src="/Katana-banner.png" 
              alt="Katana Banner" 
              width={240} 
              height={160} 
              className="object-contain rounded-2xl shadow-lg"
              priority
            />
          </div>
          <h1 className="text-6xl font-bold text-slate-800 mb-3 tracking-tight">
            Katana Block Rider
          </h1>
          <p className="text-xl text-slate-600">
            Master the art of blockchain navigation
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-red-700 font-medium text-center">{error}</p>
          </div>
        )}

        {/* Main Menu Card */}
        <Card className="p-8 bg-white/90 backdrop-blur shadow-xl border border-slate-200">
          <div className="space-y-6">
            {/* Start Button - Light and subtle */}
            <Button
              onClick={startGame}
              disabled={loading}
              className="w-full h-16 text-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-sm transition-all"
            >
              {loading ? 'Loading Blocks...' : 'Start Game'}
            </Button>

            {/* X Connection - Light purple */}
            {!xConnected ? (
              <Button
                onClick={connectX}
                disabled={xConnecting}
                variant="outline"
                className="w-full h-16 text-lg font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {xConnecting ? 'Connecting...' : 'Connect X Account'}
              </Button>
            ) : (
              <div className="flex items-center justify-between gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-purple-300">
                    <AvatarImage src={xProfilePic} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {xUsername.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">@{xUsername}</p>
                    <p className="text-sm text-emerald-600 font-medium">✓ Connected</p>
                  </div>
                </div>
                <Button
                  onClick={disconnectX}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                >
                  Disconnect
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">Controls</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>← / A - Move Left</li>
                  <li>→ / D - Move Right</li>
                  <li>SPACE / W / ↑ - Jump</li>
                </ul>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">Features</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>Real blockchain data</li>
                  <li>Dynamic platforms</li>
                  <li>Crypto memes</li>
                  <li>Audio effects</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 text-center">
              <p className="text-sm text-slate-500 mb-2">Powered by Katana Network</p>
              <a
                href="https://app.katana.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-800 underline font-medium text-sm"
              >
                Visit Katana Network →
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}