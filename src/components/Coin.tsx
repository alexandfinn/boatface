import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CoinType } from "../store/coinStore";

interface CoinProps {
  id: number;
  position: THREE.Vector3;
  rotationSpeed: number;
  bobFrequency: number;
  bobPhase: number;
  type?: CoinType;
  value?: number;
  timeToLive?: number;
  createdAt?: number;
}

export const Coin: React.FC<CoinProps> = ({
  position,
  rotationSpeed,
  bobFrequency,
  bobPhase,
  type = CoinType.REGULAR,
  value = 10,
  timeToLive,
  createdAt,
}) => {
  const coinRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const mainMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // Set initial position
  useEffect(() => {
    if (coinRef.current) {
      coinRef.current.position.copy(position);
    }
  }, [position]);

  // Animation frame update
  useFrame((_, delta) => {
    if (coinRef.current) {
      // Rotate the coin around Y axis (vertical axis)
      coinRef.current.rotation.y += rotationSpeed * delta * 20;

      // Bob up and down
      const time = Date.now();
      const newY = 1.5 + Math.sin(time * bobFrequency + bobPhase) * 0.3;
      coinRef.current.position.y = newY;

      // Special coin logic
      if (type === CoinType.SPECIAL && createdAt && timeToLive) {
        const elapsedTime = time - createdAt;
        const timeRemaining = timeToLive - elapsedTime;

        // Start blinking in the last 5 seconds
        if (timeRemaining < 5000 && !isBlinking) {
          setIsBlinking(true);
        }

        // Handle blinking effect
        if (isBlinking && mainMaterialRef.current) {
          // Faster blink as time decreases
          const blinkSpeed = Math.max(2, 10 - timeRemaining / 500);
          const blinkFactor = Math.sin(time * 0.01 * blinkSpeed) > 0 ? 1 : 0.2;

          // Update main material
          mainMaterialRef.current.opacity = blinkFactor;

          // Update glow material
          if (glowMaterialRef.current) {
            glowMaterialRef.current.opacity = 0.6 * blinkFactor;
          }
        }
      }

      // Regular pulse effect for all coins
      if (glowMaterialRef.current && !isBlinking) {
        glowMaterialRef.current.opacity = 0.4 + Math.sin(time * 0.003) * 0.3;

        // Scale the glow
        if (glowRef.current) {
          glowRef.current.scale.setScalar(1.0 + Math.sin(time * 0.002) * 0.2);
        }
      }
    }
  });

  // All coins use the same colors, just different sizes
  const coinColor = "#ffd700";
  const glowColor = "#ffdf4d";
  const emissiveColor = "#ffaa00";

  // Determine size based on type - special coins are larger
  const size = type === CoinType.SPECIAL ? 3.5 : 1.5;
  const thickness = type === CoinType.SPECIAL ? 0.4 : 0.2;

  return (
    <group ref={coinRef}>
      {/* Main coin mesh */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size, size, thickness, 32]} />
        <meshStandardMaterial
          ref={mainMaterialRef}
          color={coinColor}
          metalness={0.8}
          roughness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={0.8}
          transparent={type === CoinType.SPECIAL}
        />
      </mesh>

      {/* $ Symbol for special coins */}
      {type === CoinType.SPECIAL && (
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.2, 1.2, 0.1]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Glow effect */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[size * 1.3, size * 1.3, thickness * 0.5, 32]}
        />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color={glowColor}
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Light source - slightly stronger for special coins due to size */}
      <pointLight
        color="#ffaa00"
        intensity={type === CoinType.SPECIAL ? 1.5 : 1}
        distance={type === CoinType.SPECIAL ? 15 : 10}
      />
    </group>
  );
};
