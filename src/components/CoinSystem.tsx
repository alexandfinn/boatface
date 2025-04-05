import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBoatStore } from "../store/boatStore";
import { useCoinStore, CoinType } from "../store/coinStore";
import { useGameStore } from "../store/gameStore";
import { Coin } from "./Coin";
import * as THREE from "three";

// Notification component for screen effects
const createNotification = (message: string) => {
  // Create notification element
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.position = "absolute";
  notification.style.left = "50%";
  notification.style.top = "30%";
  notification.style.transform = "translate(-50%, -50%)";
  notification.style.color = "#FFD700";
  notification.style.fontFamily = "Arial, sans-serif";
  notification.style.fontSize = "28px";
  notification.style.fontWeight = "bold";
  notification.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.7)";
  notification.style.pointerEvents = "none";
  notification.style.opacity = "0";
  notification.style.transition = "all 0.5s ease-out";

  // Add to DOM
  document.body.appendChild(notification);

  // Animate
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.top = "25%";
  }, 10);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.top = "20%";
  }, 800);

  // Remove from DOM after animation
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 1500);
};

// Collection effect
const createCollectionEffect = (
  scene: THREE.Scene,
  position: THREE.Vector3
) => {
  // Create sparkle particles
  const particleCount = 20;
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < particleCount; i++) {
    const x = position.x + (Math.random() - 0.5) * 2;
    const y = position.y + (Math.random() - 0.5) * 2;
    const z = position.z + (Math.random() - 0.5) * 2;
    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 0.3,
    transparent: true,
    opacity: 1,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Remove after animation
  setTimeout(() => {
    scene.remove(particles);
    geometry.dispose();
    material.dispose();
  }, 500);
};

// Countdown effect
const createCountdownEffect = (number: number) => {
  // Create countdown element
  const countdownEl = document.createElement("div");
  countdownEl.textContent = number.toString();
  countdownEl.style.position = "absolute";
  countdownEl.style.left = "50%";
  countdownEl.style.top = "50%";
  countdownEl.style.transform = "translate(-50%, -50%)";
  countdownEl.style.color = "#FFFFFF";
  countdownEl.style.fontFamily = "Arial, sans-serif";
  countdownEl.style.fontSize = "120px";
  countdownEl.style.fontWeight = "bold";
  countdownEl.style.textShadow = "2px 2px 8px rgba(0, 0, 0, 0.7)";
  countdownEl.style.pointerEvents = "none";
  countdownEl.style.opacity = "0";
  countdownEl.style.transition = "all 0.8s ease-out";

  // Add to DOM
  document.body.appendChild(countdownEl);

  // Animate
  setTimeout(() => {
    countdownEl.style.opacity = "1";
    countdownEl.style.fontSize = "150px";
  }, 10);

  setTimeout(() => {
    countdownEl.style.opacity = "0";
    countdownEl.style.fontSize = "180px";
  }, 800);

  // Remove from DOM after animation
  setTimeout(() => {
    document.body.removeChild(countdownEl);
  }, 1000);
};

// Go effect at the end of countdown
const createGoEffect = () => {
  const goEl = document.createElement("div");
  goEl.textContent = "GO!";
  goEl.style.position = "absolute";
  goEl.style.left = "50%";
  goEl.style.top = "50%";
  goEl.style.transform = "translate(-50%, -50%)";
  goEl.style.color = "#4eff4e";
  goEl.style.fontFamily = "Arial, sans-serif";
  goEl.style.fontSize = "140px";
  goEl.style.fontWeight = "bold";
  goEl.style.textShadow = "0 0 20px rgba(78, 255, 78, 0.8)";
  goEl.style.pointerEvents = "none";
  goEl.style.opacity = "0";
  goEl.style.transition = "all 1s ease-out";

  // Add to DOM
  document.body.appendChild(goEl);

  // Animate
  setTimeout(() => {
    goEl.style.opacity = "1";
    goEl.style.fontSize = "180px";
  }, 10);

  setTimeout(() => {
    goEl.style.opacity = "0";
    goEl.style.fontSize = "250px";
  }, 800);

  // Remove from DOM after animation
  setTimeout(() => {
    document.body.removeChild(goEl);
  }, 1500);
};

export const CoinSystem: React.FC = () => {
  const { position: boatPosition } = useBoatStore();
  const {
    coins,
    collectCoin,
    respawnCoin,
    initializeCoins,
    spawnSpecialCoin,
    removeTimedOutCoins,
  } = useCoinStore();

  const {
    mode,
    isPlaying,
    isCountingDown,
    countdown,
    decrementCountdown,
    decrementTimer,
    addScore,
  } = useGameStore();

  const coinSound = useRef<HTMLAudioElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const specialCoinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef<boolean>(false);

  // Initialize coin sound
  useEffect(() => {
    if (mode === "collect-mrr") {
      coinSound.current = new Audio("/applepay.mp3");
      coinSound.current.volume = 0.3;
    }

    return () => {
      // Cleanup timers
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (specialCoinTimerRef.current)
        clearInterval(specialCoinTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [mode]);

  // Initialize coins only in collect-mrr mode
  useEffect(() => {
    if (isPlaying && mode === "collect-mrr") {
      // Initialize coins for collect-mrr mode
      initializeCoins(25, 3);
      hasStartedRef.current = true;
    }
  }, [isPlaying, mode, initializeCoins]);

  // Handle game mode changes and countdown only in collect-mrr mode
  useEffect(() => {
    // Don't run this effect in free-roam mode
    if (mode !== "collect-mrr") return;

    // Clean up previous timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (specialCoinTimerRef.current) clearInterval(specialCoinTimerRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    // Setup for collect-mrr mode when the game is started
    if (isPlaying && isCountingDown) {
      // Start with showing the initial countdown
      createCountdownEffect(countdown);

      // Start countdown timer
      countdownIntervalRef.current = setInterval(() => {
        decrementCountdown();

        // Get the current countdown value
        const currentCountdown = useGameStore.getState().countdown;

        if (currentCountdown > 0) {
          // Show countdown effect
          createCountdownEffect(currentCountdown);
        } else {
          // Countdown finished, clear interval and show GO!
          if (countdownIntervalRef.current)
            clearInterval(countdownIntervalRef.current);
          createGoEffect();

          // Start game timer for 1 minute countdown
          gameTimerRef.current = setInterval(() => {
            // Call decrement timer directly to update game state immediately
            decrementTimer();

            // Log to verify timer is working
            console.log("Timer tick: ", useGameStore.getState().timeRemaining);

            // Check if game is still playing
            if (!useGameStore.getState().isPlaying) {
              // Game ended, clear interval
              if (gameTimerRef.current) clearInterval(gameTimerRef.current);
              if (specialCoinTimerRef.current)
                clearInterval(specialCoinTimerRef.current);
            }
          }, 1000);

          // Spawn special coins periodically during gameplay
          specialCoinTimerRef.current = setInterval(() => {
            if (
              useGameStore.getState().isPlaying &&
              !useGameStore.getState().isCountingDown
            ) {
              spawnSpecialCoin();
            } else {
              // Game ended, clear interval
              if (specialCoinTimerRef.current)
                clearInterval(specialCoinTimerRef.current);
            }
          }, 8000); // Spawn a special coin every 8 seconds
        }
      }, 1000);
    }

    return () => {
      // Clean up timers when component unmounts or mode changes
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (specialCoinTimerRef.current)
        clearInterval(specialCoinTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [
    mode,
    isPlaying,
    isCountingDown,
    countdown,
    decrementCountdown,
    decrementTimer,
    spawnSpecialCoin,
  ]);

  // Create a separate timer effect to ensure it runs consistently
  useEffect(() => {
    // Only run timer in collect-mrr mode and when the game is playing but not in countdown
    if (mode === "collect-mrr" && isPlaying && !isCountingDown) {
      console.log("Starting main game timer");

      // Clear any existing timer
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }

      // Create a new game timer that decrements every second
      gameTimerRef.current = setInterval(() => {
        decrementTimer();
        console.log("Timer tick:", useGameStore.getState().timeRemaining);
      }, 1000);

      // Cleanup on unmount or when conditions change
      return () => {
        if (gameTimerRef.current) {
          console.log("Clearing game timer");
          clearInterval(gameTimerRef.current);
        }
      };
    }
  }, [mode, isPlaying, isCountingDown, decrementTimer]);

  // Get scene reference and handle coin logic
  useFrame((state) => {
    // Don't process coins in free-roam mode
    if (mode !== "collect-mrr") return;

    sceneRef.current = state.scene;
    const now = Date.now();

    // Only process coin logic when the game is playing and not in countdown
    const shouldProcessCoins = isPlaying && !isCountingDown;

    // Only run coin logic at a reasonable interval to avoid performance issues
    if (shouldProcessCoins && now - lastUpdateTimeRef.current > 100) {
      // 10 times per second is enough
      lastUpdateTimeRef.current = now;

      // Check for coin respawns
      coins.forEach((coin) => {
        if (coin.collected && coin.respawnTime > 0 && now >= coin.respawnTime) {
          respawnCoin(coin.id);
        }
      });

      // Check for special coins that should disappear
      removeTimedOutCoins();

      // Check for collisions with boat
      const collisionRadius = 6;
      coins.forEach((coin) => {
        if (!coin.collected) {
          const distance = coin.position.distanceTo(boatPosition);
          if (distance < collisionRadius) {
            // Collect the coin
            collectCoin(coin.id);

            // Add to score
            const value =
              coin.value || (coin.type === CoinType.SPECIAL ? 50 : 10);
            addScore(value);

            // Play sound
            if (coinSound.current) {
              coinSound.current.currentTime = 0;
              coinSound.current
                .play()
                .catch((e) => console.log("Error playing sound:", e));
            }

            // Show notification
            createNotification(`+$${value} MRR`);

            // Create collection effect
            if (sceneRef.current) {
              createCollectionEffect(sceneRef.current, coin.position.clone());
            }
          }
        }
      });
    }
  });

  // Only render coins in collect-mrr mode
  if (mode !== "collect-mrr") return null;

  return (
    <>
      {coins.map(
        (coin) =>
          !coin.collected && (
            <Coin
              key={coin.id}
              id={coin.id}
              position={coin.position}
              rotationSpeed={coin.rotationSpeed}
              bobFrequency={coin.bobFrequency}
              bobPhase={coin.bobPhase}
              type={coin.type}
              value={coin.value}
              timeToLive={coin.timeToLive}
              createdAt={coin.createdAt}
            />
          )
      )}
    </>
  );
};
