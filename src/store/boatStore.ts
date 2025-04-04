import { create } from 'zustand'
import * as THREE from 'three'

interface BoatState {
  position: THREE.Vector3
  rotation: THREE.Euler
  keys: {
    w: boolean
    a: boolean
    s: boolean
    d: boolean
  }
  setKey: (key: string, isPressed: boolean) => void
  updatePosition: (newPosition: THREE.Vector3) => void
  updateRotation: (newRotation: THREE.Euler) => void
}

export const useBoatStore = create<BoatState>((set) => ({
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  keys: {
    w: false,
    a: false,
    s: false,
    d: false
  },
  setKey: (key, isPressed) => 
    set((state) => ({
      keys: {
        ...state.keys,
        [key]: isPressed
      }
    })),
  updatePosition: (newPosition) => 
    set(() => ({ position: newPosition })),
  updateRotation: (newRotation) => 
    set(() => ({ rotation: newRotation }))
})) 