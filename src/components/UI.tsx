import React from 'react'
import { useCoinStore } from '../store/coinStore'

export const UI: React.FC = () => {
  const { collectedCount } = useCoinStore()
  
  return (
    <>
      <div className="absolute top-4 left-4 p-3 bg-black/50 text-white rounded-md">
        <p>Use WASD to move the boat</p>
        <p>Use mouse to look around</p>
      </div>
      
      <div className="absolute top-4 right-4 p-3 bg-black/50 text-yellow-400 font-bold rounded-md">
        <p>${collectedCount} MRR</p>
      </div>
    </>
  )
} 