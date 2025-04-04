import { create } from 'zustand'
import * as THREE from 'three'

interface Coin {
  id: number
  position: THREE.Vector3
  collected: boolean
  respawnTime: number
  rotationSpeed: number
  bobFrequency: number
  bobPhase: number
}

interface CoinState {
  coins: Coin[]
  collectedCount: number
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
  }
  initializeCoins: (count: number) => void
  collectCoin: (id: number) => void
  updateCoin: (id: number, updates: Partial<Coin>) => void
  respawnCoin: (id: number) => void
}

export const useCoinStore = create<CoinState>((set) => ({
  coins: [],
  collectedCount: 0,
  bounds: {
    minX: -100,
    maxX: 100,
    minZ: -100,
    maxZ: 100
  },
  
  initializeCoins: (count) => {
    const coins: Coin[] = [];
    
    // Create one coin near the boat's starting position
    coins.push({
      id: 0,
      position: new THREE.Vector3(0, 0, 20),
      collected: false,
      respawnTime: 0,
      rotationSpeed: 0.02 + Math.random() * 0.02,
      bobFrequency: 0.002 + Math.random() * 0.001,
      bobPhase: Math.random() * Math.PI * 2
    });
    
    // Create the rest around the starting area
    for (let i = 1; i < count; i++) {
      coins.push({
        id: i,
        position: getRandomPosition(),
        collected: false,
        respawnTime: 0,
        rotationSpeed: 0.02 + Math.random() * 0.02,
        bobFrequency: 0.002 + Math.random() * 0.001,
        bobPhase: Math.random() * Math.PI * 2
      });
    }
    
    set({ coins });
  },
  
  collectCoin: (id) => set((state) => {
    const updatedCoins = state.coins.map(coin => {
      if (coin.id === id && !coin.collected) {
        return {
          ...coin,
          collected: true,
          respawnTime: Date.now() + 3000 // 3 seconds respawn time
        };
      }
      return coin;
    });
    
    return { 
      coins: updatedCoins,
      collectedCount: state.collectedCount + 1
    };
  }),
  
  updateCoin: (id, updates) => set((state) => ({
    coins: state.coins.map(coin => 
      coin.id === id ? { ...coin, ...updates } : coin
    )
  })),
  
  respawnCoin: (id) => set((state) => ({
    coins: state.coins.map(coin => {
      if (coin.id === id && coin.collected) {
        return {
          ...coin,
          collected: false,
          position: getRandomPosition(),
          respawnTime: 0
        };
      }
      return coin;
    })
  }))
}));

// Helper function to get random position within bounds
function getRandomPosition() {
  const bounds = useCoinStore.getState().bounds;
  return new THREE.Vector3(
    Math.random() * (bounds.maxX - bounds.minX) + bounds.minX,
    1.5, // Height above water
    Math.random() * (bounds.maxZ - bounds.minZ) + bounds.minZ
  );
} 