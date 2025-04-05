import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { BoatScene } from "./components/BoatScene";
import { UI } from "./components/UI";
import { MobileControls } from "./components/MobileControls";
import * as THREE from "three";

function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 10, 30], fov: 55 }}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.5,
        }}
      >
        <Suspense fallback={null}>
          <BoatScene />
        </Suspense>
      </Canvas>
      <UI />
      <MobileControls />
    </>
  );
}

export default App;
