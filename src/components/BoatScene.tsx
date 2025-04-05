import React, { useMemo } from "react";
import { Boat } from "./Boat";
import { Ocean } from "./Ocean";
import { Controls } from "./Controls";
import { SplashSystem } from "./SplashSystem";
import { CoinSystem } from "./CoinSystem";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useTouchControls } from "../hooks/useTouchControls";
import { useBoatStore } from "../store/boatStore";
import * as THREE from "three";

export const BoatScene: React.FC = () => {
  // Initialize keyboard controls
  useKeyboardControls();

  // Initialize touch controls for mobile devices
  useTouchControls();

  const { keys, position, rotation } = useBoatStore();

  // Determine if the boat is moving and in which direction
  const { isMoving, direction } = useMemo(() => {
    let isMoving = false;
    let direction = new THREE.Vector3(0, 0, 0);

    if (keys.w) {
      direction.set(-Math.sin(rotation.y), 0, -Math.cos(rotation.y));
      isMoving = true;
    } else if (keys.s) {
      direction.set(Math.sin(rotation.y), 0, Math.cos(rotation.y));
      isMoving = true;
    }

    return { isMoving, direction };
  }, [keys.w, keys.s, rotation.y]);

  return (
    <>
      <Ocean />
      <Boat />
      <Controls />
      <CoinSystem />
      <SplashSystem
        isMoving={isMoving}
        position={position}
        direction={direction}
      />
    </>
  );
};
