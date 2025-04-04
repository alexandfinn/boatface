import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { Sky, Environment } from '@react-three/drei'
import { Water } from 'three/examples/jsm/objects/Water.js'

// Extend Three.js with Water
extend({ Water })

// Add TypeScript support for JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      water: any;
    }
  }
}

export const Ocean: React.FC = () => {
  const waterRef = useRef<Water>(null)
  const { scene } = useThree()
  
  // Load water normal texture
  const waterNormals = useLoader(
    THREE.TextureLoader, 
    '/textures/waternormals.jpg',
    undefined,
    (error) => {
      console.error('Error loading water texture:', error)
    }
  )
  
  useEffect(() => {
    if (waterNormals) {
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
    }
  }, [waterNormals])
  
  // Set up sun parameters
  const sunPosition = useMemo(() => {
    const elevation = 2
    const azimuth = 180
    
    const phi = THREE.MathUtils.degToRad(90 - elevation)
    const theta = THREE.MathUtils.degToRad(azimuth)
    const sun = new THREE.Vector3()
    sun.setFromSphericalCoords(1, phi, theta)
    return sun
  }, [])
  
  // Make sure the water is properly animated
  const waterGeometry = useMemo(() => new THREE.PlaneGeometry(10000, 10000), [])
  const waterOptions = useMemo(() => ({
    textureWidth: 512,
    textureHeight: 512,
    waterNormals,
    sunDirection: sunPosition.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  }), [waterNormals, sunPosition, scene.fog])
  
  // Update water animation
  useFrame((_, delta) => {
    if (waterRef.current) {
      // Explicitly update the time uniform to animate the water
      waterRef.current.material.uniforms['time'].value += delta;
    }
  })
  
  return (
    <>
      {/* Use Sky component from drei */}
      <Sky 
        distance={450000} 
        sunPosition={[sunPosition.x, sunPosition.y, sunPosition.z]}
        inclination={0.03}
        azimuth={180}
        rayleigh={2}
        turbidity={10}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      {/* Add environment for PBR lighting */}
      <Environment preset="sunset" />
      
      <water
        ref={waterRef}
        args={[waterGeometry, waterOptions]}
        rotation-x={-Math.PI / 2}
        position={[0, 0, 0]}
      />
      
      <directionalLight 
        position={[
          sunPosition.x * 100,
          sunPosition.y * 100,
          sunPosition.z * 100
        ]} 
        intensity={1} 
        castShadow
      />
      <ambientLight intensity={0.5} />
    </>
  )
} 