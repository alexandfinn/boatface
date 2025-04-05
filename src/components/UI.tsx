import React, { useState, useEffect } from "react";
import { useGameStore, GameMode } from "../store/gameStore";

export const UI: React.FC = () => {
  const {
    mode,
    setMode,
    isPlaying,
    startGame,
    endGame,
    timeRemaining,
    score,
    isCountingDown,
  } = useGameStore();

  // State to detect if using mobile device
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile("ontouchstart" in window || window.innerWidth <= 768);
    };

    // Check on initial load
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Log time remaining for debugging
  React.useEffect(() => {
    if (isPlaying && mode === "collect-mrr" && !isCountingDown) {
      console.log("UI Timer update:", timeRemaining);
    }
  }, [timeRemaining, isPlaying, mode, isCountingDown]);

  // Handle game start with selected mode
  const handleStartGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    startGame();
  };

  return (
    <>
      {/* ZeroToShipped branding in top left */}
      <div className="absolute top-0 left-0 p-3 bg-black/50 text-white rounded-br-md font-semibold z-10">
        <a
          href="https://zerotoshipped.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-yellow-300"
        >
          ZeroToShipped.com - The ultimate starter
        </a>
      </div>

      {/* Top left popup - Only shows End Game button during gameplay */}
      {isPlaying && mode === "collect-mrr" && !isCountingDown && (
        <div className="absolute top-4 left-4 mt-12 p-3 bg-black/50 text-white rounded-md flex flex-col gap-2">
          <button
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold text-sm"
            onClick={endGame}
          >
            End Game Early
          </button>
        </div>
      )}

      {/* Top center score and timer display - only in collect-mrr mode AND after countdown */}
      {isPlaying && mode === "collect-mrr" && !isCountingDown && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="text-3xl font-bold text-yellow-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            ${score} MRR
          </div>

          {/* Timer for collect-mrr mode */}
          <div className="text-2xl font-bold text-white mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </div>
      )}

      {/* Full-screen overlay when no game is active */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-black/80 p-8 rounded-lg max-w-md text-center">
            {/* Title with ZeroToShipped clickable link */}
            <div className="mb-4">
              <a
                href="https://zerotoshipped.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl text-white font-bold hover:text-yellow-300"
              >
                ZeroToShipped
              </a>
            </div>

            {/* Boatface title */}
            <h1 className="text-3xl text-white font-bold mb-2">Boatface</h1>

            <h2 className="text-xl text-white font-bold mb-6">
              Choose Your Experience
            </h2>

            {/* Instructions - only visible on initial screen and only on desktop */}
            {!isMobile && (
              <div className="mb-6 text-white text-sm bg-black/50 p-3 rounded-md">
                <p className="mb-1">Use WASD to move the boat</p>
                <p>Use mouse to look around</p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <button
                className="px-8 py-5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl"
                onClick={() => handleStartGame("free-roam")}
              >
                🚤 Free Roaming
              </button>

              <div className="relative mb-28">
                <button
                  className="w-full px-8 py-5 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xl"
                  onClick={() => handleStartGame("collect-mrr")}
                >
                  💰 Collect MRR Challenge
                </button>

                <div className="absolute top-full left-0 right-0 mt-4 text-white text-sm bg-black/50 p-3 rounded-md">
                  <p className="mb-1">
                    60-second challenge to collect as many coins as possible!
                  </p>
                  <p className="mb-1">Regular Coins: +$10 MRR</p>
                  <p>Special Coins: +$50 MRR (Disappear quickly!)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game over overlay for collect-mrr mode */}
      {mode === "collect-mrr" && !isPlaying && score > 0 && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <h1 className="text-4xl text-white font-bold mb-4">Time's Up!</h1>
          <p className="text-3xl text-yellow-400 font-bold mb-8">
            You collected ${score} MRR
          </p>
          <button
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-md font-bold text-xl"
            onClick={() => handleStartGame("collect-mrr")}
          >
            Play Again
          </button>
        </div>
      )}
    </>
  );
};
