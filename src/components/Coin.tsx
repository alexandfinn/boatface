import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CoinProps {
  id: number
  position: THREE.Vector3
  rotationSpeed: number
  bobFrequency: number
  bobPhase: number
}

export const Coin: React.FC<CoinProps> = ({ 
  position, 
  rotationSpeed, 
  bobFrequency, 
  bobPhase 
}) => {
  const coinRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null)
  
  // Set initial position
  useEffect(() => {
    if (coinRef.current) {
      coinRef.current.position.copy(position)
    }
  }, [position])
  
  // Animation frame update
  useFrame((_, delta) => {
    if (coinRef.current) {
      // Rotate the coin around Y axis (vertical axis)
      coinRef.current.rotation.y += rotationSpeed * delta * 20
      
      // Bob up and down
      const time = Date.now()
      const newY = 1.5 + Math.sin(time * bobFrequency + bobPhase) * 0.3
      coinRef.current.position.y = newY
      
      // Pulse the glow effect
      if (glowMaterialRef.current) {
        glowMaterialRef.current.opacity = 0.4 + Math.sin(time * 0.003) * 0.3
        
        // Scale the glow
        if (glowRef.current) {
          glowRef.current.scale.setScalar(1.0 + Math.sin(time * 0.002) * 0.2)
        }
      }
    }
  })
  
  return (
    <group ref={coinRef}>
      {/* Main coin mesh */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
        <meshStandardMaterial 
          color="#ffd700" 
          metalness={0.8}
          roughness={0.2}
          emissive="#ffaa00"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.1, 32]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color="#ffdf4d"
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Light source */}
      <pointLight 
        color="#ffaa00"
        intensity={1}
        distance={10}
      />
    </group>
  )
} 