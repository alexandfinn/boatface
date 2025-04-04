import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useBoatStore } from '../store/boatStore'

export const Controls: React.FC = () => {
  const { camera, gl } = useThree()
  const controlsRef = useRef<OrbitControls>()
  const { position } = useBoatStore()
  
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.maxPolarAngle = Math.PI * 0.495
    controls.minDistance = 10.0
    controls.maxDistance = 100.0
    controls.target.set(0, 2, 0)
    controls.update()
    
    controlsRef.current = controls
    
    return () => {
      controls.dispose()
    }
  }, [camera, gl])
  
  useFrame(() => {
    if (controlsRef.current) {
      // Update target to follow boat
      controlsRef.current.target.set(
        position.x,
        position.y + 2,
        position.z
      )
      controlsRef.current.update()
    }
  })
  
  return null
} 