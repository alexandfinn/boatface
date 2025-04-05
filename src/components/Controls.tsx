import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useBoatStore } from "../store/boatStore";
import { useGameStore } from "../store/gameStore";

export const Controls: React.FC = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>();
  const { position, rotation } = useBoatStore();
  const { isPlaying, isCountingDown, mode, timeRemaining } = useGameStore();
  const initializedRef = useRef(false);

  // Initialize controls
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minDistance = 10.0;
    controls.maxDistance = 100.0;
    controls.target.set(0, 2, 0);
    controls.update();

    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  // Initial camera positioning when game starts
  useEffect(() => {
    if (isPlaying && !initializedRef.current) {
      initializedRef.current = true;
      console.log("Initializing camera for mode:", mode);

      // For free-roam mode, position camera above and slightly behind boat
      if (mode === "free-roam") {
        const distanceBehind = 20;
        const heightAbove = 15;

        // Calculate the position behind and above the boat
        const behindX =
          position.x + Math.sin(rotation.y) * distanceBehind * 0.5;
        const behindZ =
          position.z + Math.cos(rotation.y) * distanceBehind * 0.5;

        // Set camera position
        camera.position.set(behindX, position.y + heightAbove, behindZ);
        camera.lookAt(position.x, position.y, position.z);

        if (controlsRef.current) {
          // Enable controls immediately in free-roam
          controlsRef.current.enabled = true;
          controlsRef.current.target.set(
            position.x,
            position.y + 2,
            position.z
          );
          controlsRef.current.update();
        }
      }
      // For collect-mrr mode, position camera directly behind boat for countdown
      else if (mode === "collect-mrr") {
        const distanceBehind = 15;
        const heightAbove = 8;

        // Calculate the position behind the boat
        const behindX = position.x - Math.sin(rotation.y) * distanceBehind;
        const behindZ = position.z - Math.cos(rotation.y) * distanceBehind;

        // Set camera position
        camera.position.set(behindX, position.y + heightAbove, behindZ);
        camera.lookAt(position.x, position.y + 2, position.z);

        if (controlsRef.current) {
          // Disable controls during countdown
          controlsRef.current.enabled = false;
        }
      }
    }

    // Reset initialization flag when game ends
    if (!isPlaying) {
      initializedRef.current = false;
    }
  }, [isPlaying, camera, position, rotation, mode]);

  useFrame(() => {
    if (!controlsRef.current) return;

    // Check if game is over (timed mode and time is up)
    const isGameOver =
      mode === "collect-mrr" && timeRemaining === 0 && isPlaying;

    // Handle different camera states
    if (mode === "collect-mrr" && isCountingDown) {
      // In collect-mrr mode during countdown, position camera behind the boat
      const distanceBehind = 15;
      const heightAbove = 8;

      // Calculate the position behind the boat - face boat's back
      const behindX = position.x - Math.sin(rotation.y) * distanceBehind;
      const behindZ = position.z - Math.cos(rotation.y) * distanceBehind;

      // Set camera position
      camera.position.set(behindX, position.y + heightAbove, behindZ);

      // Make the camera look at the boat
      camera.lookAt(position.x, position.y + 2, position.z);

      // Disable controls during countdown
      controlsRef.current.enabled = false;
    } else if (isPlaying && !isGameOver) {
      // Game is active and not over - enable controls and follow boat
      controlsRef.current.enabled = true;

      // Update target to follow boat
      controlsRef.current.target.set(position.x, position.y + 2, position.z);
      controlsRef.current.update();
    } else if (isGameOver) {
      // Game over - keep following boat but disable rotation controls
      controlsRef.current.enabled = false;
      controlsRef.current.target.set(position.x, position.y + 2, position.z);
      controlsRef.current.update();
    } else {
      // When not playing, keep controls enabled but fixed on initial position
      controlsRef.current.enabled = true;
      controlsRef.current.target.set(0, 2, 0);
      controlsRef.current.update();
    }
  });

  return null;
};
