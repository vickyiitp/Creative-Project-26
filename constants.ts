import { CellType } from './types';

export const GRID_SIZE = 16;
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32; // Isometric ratio 2:1

export const MAX_TOWERS = 5;
export const TOWER_RANGE = 8; // Grid cells

export const COLORS = {
  background: '#0f172a', // Slate 900
  gridLines: '#1e293b',
  
  // Buildings
  buildingWireframe: '#38bdf8', // Sky 400
  buildingSide: '#1e293b', // Slate 800
  buildingTop: '#334155', // Slate 700
  buildingWindowOn: '#facc15', // Yellow
  buildingWindowOff: '#0f172a', // Slate 900
  
  // Environment
  street: '#0f172a',
  park: '#0f172a', // Darker park for neon contrast
  parkHighlight: '#059669', // Emerald
  
  // Tower & Effects
  tower: '#22d3ee', // Cyan 400
  towerPulse: '#67e8f9', // Cyan 300
  ray: 'rgba(34, 211, 238, 0.2)', 
  coverageOverlay: 'rgba(6, 182, 212, 0.3)', // Cyan tint
  blockedOverlay: 'rgba(239, 68, 68, 0.2)', 
  
  // UI / Preview
  ghostTower: 'rgba(255, 255, 255, 0.5)',
  ghostCoverage: 'rgba(255, 255, 255, 0.1)',
};

// Default map if generation fails or for initial load
export const DEFAULT_GRID: number[][] = Array(GRID_SIZE).fill(0).map((_, y) => 
  Array(GRID_SIZE).fill(0).map((_, x) => {
    // Simple procedural generation for fallback
    if (Math.random() > 0.85) return CellType.BUILDING_HIGH;
    if (Math.random() > 0.7) return CellType.BUILDING_LOW;
    if (Math.random() > 0.95) return CellType.PARK;
    return CellType.STREET;
  })
);