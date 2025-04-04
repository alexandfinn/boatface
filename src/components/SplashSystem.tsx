import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type Particle = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
}

interface SplashSystemProps {
  isMoving: boolean
  position: THREE.Vector3
  direction: THREE.Vector3
}

export const SplashSystem: React.FC<SplashSystemProps> = ({ isMoving, position, direction }) => {
  const particlesRef = useRef<Particle[]>([])
  const pointsRef = useRef<THREE.Points>(null)
  
  const pointsMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0x55aaff,
      size: 0.4,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
  }, [])

  const addParticles = (pos: THREE.Vector3, dir: THREE.Vector3) => {
    for (let i = 0; i < 5; i++) {
      particlesRef.current.push({
        position: new THREE.Vector3(
          pos.x + (Math.random() - 0.5) * 2,
          pos.y + Math.random() * 0.5,
          pos.z + (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          dir.x * (Math.random() + 0.5) * 0.3,
          Math.random() * 0.2,
          dir.z * (Math.random() + 0.5) * 0.3
        ),
        life: 1.0
      })
    }
  }

  useEffect(() => {
    if (isMoving) {
      const behindBoat = new THREE.Vector3(
        position.x - direction.x * 2,
        position.y,
        position.z - direction.z * 2
      )
      addParticles(behindBoat, direction)
    }
  }, [isMoving, position, direction])

  useFrame(() => {
    // Filter out dead particles
    particlesRef.current = particlesRef.current.filter(p => p.life > 0)
    
    if (particlesRef.current.length === 0 || !pointsRef.current) {
      if (pointsRef.current) {
        pointsRef.current.geometry.setAttribute(
          'position', 
          new THREE.BufferAttribute(new Float32Array(0), 3)
        )
      }
      return
    }

    const positions = new Float32Array(particlesRef.current.length * 3)
    
    for (let i = 0; i < particlesRef.current.length; i++) {
      const particle = particlesRef.current[i]
      
      // Update position
      particle.position.add(particle.velocity)
      particle.velocity.y -= 0.01 // Gravity
      particle.life -= 0.02 // Fade out
      
      // Set position in buffer
      positions[i * 3] = particle.position.x
      positions[i * 3 + 1] = particle.position.y
      positions[i * 3 + 2] = particle.position.z
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointsRef.current.geometry.dispose()
    pointsRef.current.geometry = geometry
  })

  return (
    <points ref={pointsRef} material={pointsMaterial}>
      <bufferGeometry />
    </points>
  )
} 