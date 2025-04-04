import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { TextureLoader } from "three";
import * as THREE from "three";
import { useBoatStore } from "../store/boatStore";

export const Boat: React.FC = () => {
  const boatModel = useLoader(OBJLoader, "/models/boat.obj");
  const boatTexture = useLoader(TextureLoader, "/models/boat.png");
  const boatRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  const { keys, position, rotation, updatePosition, updateRotation } =
    useBoatStore();

  // Apply texture to boat model
  useEffect(() => {
    if (boatModel) {
      boatModel.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshPhongMaterial({
            map: boatTexture,
            shininess: 30,
          });
        }
      });
    }
  }, [boatModel, boatTexture]);

  useFrame(() => {
    if (!boatRef.current) return;

    const moveSpeed = 0.5;
    const turnSpeed = 0.02;

    let newPosition = position.clone();
    let newRotation = rotation.clone();

    // Handle movement
    if (keys.w) {
      newPosition.z += Math.cos(rotation.y) * moveSpeed;
      newPosition.x += Math.sin(rotation.y) * moveSpeed;
    }
    if (keys.s) {
      newPosition.z -= Math.cos(rotation.y) * moveSpeed;
      newPosition.x -= Math.sin(rotation.y) * moveSpeed;
    }
    if (keys.a) {
      newRotation.y += turnSpeed;
    }
    if (keys.d) {
      newRotation.y -= turnSpeed;
    }

    // Update boat position and rotation
    boatRef.current.position.copy(newPosition);
    boatRef.current.rotation.copy(newRotation);

    // Update spotlight position
    if (spotlightRef.current) {
      // Position the spotlight in front of the boat at a 45-degree angle
      const offsetX = Math.sin(newRotation.y) * 10; // Front direction X
      const offsetZ = Math.cos(newRotation.y) * 10; // Front direction Z

      spotlightRef.current.position.set(
        newPosition.x + offsetX,
        newPosition.y + 10, // Reduced height for 45-degree angle
        newPosition.z + offsetZ
      );

      // Make spotlight look at the boat
      spotlightRef.current.target.position.copy(newPosition);
      spotlightRef.current.target.updateMatrixWorld();
    }

    // Update store
    updatePosition(newPosition);
    updateRotation(newRotation);
  });

  return (
    <>
      <spotLight
        ref={spotlightRef}
        position={[10, 10, 10]} // Initial position at 45 degrees from front
        angle={Math.PI / 4}
        penumbra={0.5}
        decay={1}
        distance={50}
        intensity={15}
        castShadow
      >
        <object3D position={[0, 0, 0]} /> {/* Target for the spotlight */}
      </spotLight>

      <primitive
        ref={boatRef}
        object={boatModel.clone()}
        scale={[5, 5, 5]}
        position={[0, 0, 0]}
      />
    </>
  );
};
