import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBoatStore } from "../store/boatStore";
import { useCoinStore } from "../store/coinStore";
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

export const CoinSystem: React.FC = () => {
  const { position: boatPosition } = useBoatStore();
  const { coins, collectCoin, respawnCoin, initializeCoins } = useCoinStore();
  const coinSound = useRef<HTMLAudioElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Initialize coin sound
  useEffect(() => {
    coinSound.current = new Audio("/applepay.mp3");
    coinSound.current.volume = 0.3;

    // Initialize coins
    initializeCoins(10);

    return () => {
      // Cleanup
    };
  }, [initializeCoins]);

  // Get scene reference
  useFrame((state) => {
    sceneRef.current = state.scene;

    // Check for coin respawns
    const now = Date.now();
    coins.forEach((coin) => {
      if (coin.collected && coin.respawnTime > 0 && now >= coin.respawnTime) {
        respawnCoin(coin.id);
      }
    });

    // Check for collisions with boat
    const collisionRadius = 6;
    coins.forEach((coin) => {
      if (!coin.collected) {
        const distance = coin.position.distanceTo(boatPosition);
        if (distance < collisionRadius) {
          // Collect the coin
          collectCoin(coin.id);

          // Play sound
          if (coinSound.current) {
            coinSound.current.currentTime = 0;
            coinSound.current
              .play()
              .catch((e) => console.log("Error playing sound:", e));
          }

          // Show notification
          createNotification("+$1 MRR");

          // Create collection effect
          if (sceneRef.current) {
            createCollectionEffect(sceneRef.current, coin.position.clone());
          }
        }
      }
    });
  });

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
            />
          )
      )}
    </>
  );
};
