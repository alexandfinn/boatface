import { create } from "zustand";
import * as THREE from "three";

export enum CoinType {
  REGULAR = "regular",
  SPECIAL = "special",
}

interface Coin {
  id: number;
  position: THREE.Vector3;
  collected: boolean;
  respawnTime: number;
  rotationSpeed: number;
  bobFrequency: number;
  bobPhase: number;
  type: CoinType;
  value: number;
  timeToLive?: number; // For special coins that disappear after a time
  createdAt?: number; // For special coins to track when they were created
}

interface CoinState {
  coins: Coin[];
  collectedCount: number;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  initializeCoins: (regularCount: number, specialCount?: number) => void;
  collectCoin: (id: number) => void;
  updateCoin: (id: number, updates: Partial<Coin>) => void;
  respawnCoin: (id: number) => void;
  spawnSpecialCoin: () => void;
  removeTimedOutCoins: () => void;
}

export const useCoinStore = create<CoinState>((set) => ({
  coins: [],
  collectedCount: 0,
  bounds: {
    minX: -100,
    maxX: 100,
    minZ: -100,
    maxZ: 100,
  },

  initializeCoins: (regularCount, specialCount = 0) => {
    const coins: Coin[] = [];

    // Create one regular coin near the boat's starting position
    coins.push({
      id: 0,
      position: new THREE.Vector3(0, 0, 20),
      collected: false,
      respawnTime: 0,
      rotationSpeed: 0.02 + Math.random() * 0.02,
      bobFrequency: 0.002 + Math.random() * 0.001,
      bobPhase: Math.random() * Math.PI * 2,
      type: CoinType.REGULAR,
      value: 10,
    });

    // Create the rest of regular coins around the starting area
    for (let i = 1; i < regularCount; i++) {
      coins.push({
        id: i,
        position: getRandomPosition(),
        collected: false,
        respawnTime: 0,
        rotationSpeed: 0.02 + Math.random() * 0.02,
        bobFrequency: 0.002 + Math.random() * 0.001,
        bobPhase: Math.random() * Math.PI * 2,
        type: CoinType.REGULAR,
        value: 10,
      });
    }

    // Create special coins if specified
    const now = Date.now();
    for (let i = 0; i < specialCount; i++) {
      coins.push({
        id: regularCount + i,
        position: getRandomPosition(),
        collected: false,
        respawnTime: 0,
        rotationSpeed: 0.03 + Math.random() * 0.02, // Slightly faster rotation
        bobFrequency: 0.003 + Math.random() * 0.001, // Slightly faster bobbing
        bobPhase: Math.random() * Math.PI * 2,
        type: CoinType.SPECIAL,
        value: 50,
        timeToLive: 15000, // 15 seconds
        createdAt: now,
      });
    }

    set({ coins });
  },

  collectCoin: (id) =>
    set((state) => {
      const coin = state.coins.find((c) => c.id === id);
      if (!coin || coin.collected) return state;

      const updatedCoins = state.coins.map((coin) => {
        if (coin.id === id && !coin.collected) {
          return {
            ...coin,
            collected: true,
            respawnTime: coin.type === CoinType.REGULAR ? Date.now() + 3000 : 0, // Only respawn regular coins
          };
        }
        return coin;
      });

      return {
        coins: updatedCoins,
        collectedCount: state.collectedCount + 1,
      };
    }),

  updateCoin: (id, updates) =>
    set((state) => ({
      coins: state.coins.map((coin) =>
        coin.id === id ? { ...coin, ...updates } : coin
      ),
    })),

  respawnCoin: (id) =>
    set((state) => ({
      coins: state.coins.map((coin) => {
        if (
          coin.id === id &&
          coin.collected &&
          coin.type === CoinType.REGULAR
        ) {
          return {
            ...coin,
            collected: false,
            position: getRandomPosition(),
            respawnTime: 0,
          };
        }
        return coin;
      }),
    })),

  spawnSpecialCoin: () =>
    set((state) => {
      const now = Date.now();
      const maxId = Math.max(...state.coins.map((coin) => coin.id), 0);

      const newSpecialCoin: Coin = {
        id: maxId + 1,
        position: getRandomPosition(),
        collected: false,
        respawnTime: 0,
        rotationSpeed: 0.03 + Math.random() * 0.02,
        bobFrequency: 0.003 + Math.random() * 0.001,
        bobPhase: Math.random() * Math.PI * 2,
        type: CoinType.SPECIAL,
        value: 50,
        timeToLive: 15000, // 15 seconds
        createdAt: now,
      };

      return {
        coins: [...state.coins, newSpecialCoin],
      };
    }),

  removeTimedOutCoins: () =>
    set((state) => {
      const now = Date.now();
      const updatedCoins = state.coins.filter((coin) => {
        // Keep the coin if it's not a special coin or if it hasn't timed out
        if (coin.type !== CoinType.SPECIAL) return true;
        if (coin.collected) return false; // Remove collected special coins

        // Check if the special coin should still exist
        if (coin.createdAt && coin.timeToLive) {
          return now - coin.createdAt < coin.timeToLive;
        }

        return true;
      });

      return { coins: updatedCoins };
    }),
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
