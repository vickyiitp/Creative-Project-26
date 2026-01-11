import React, { useRef, useEffect, useState } from 'react';
import { GRID_SIZE, TILE_WIDTH, TILE_HEIGHT, TOWER_RANGE, COLORS } from '../constants';
import { Grid, Point, Tower, CellType } from '../types';

interface GameCanvasProps {
  grid: Grid;
  towers: Tower[];
  coverage: boolean[][];
  onTileClick: (p: Point) => void;
  hoveredCell: Point | null;
  setHoveredCell: (p: Point | null) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  grid, 
  towers, 
  coverage, 
  onTileClick,
  hoveredCell,
  setHoveredCell
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle Resize Logic
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Coordinate Conversion
  const cartToIso = (x: number, y: number): Point => {
    const startX = dimensions.width / 2;
    const startY = dimensions.height / 8; // Moved up slightly to fit better

    return {
      x: (x - y) * (TILE_WIDTH / 2) + startX, 
      y: (x + y) * (TILE_HEIGHT / 2) + startY 
    };
  };

  const isPointInTile = (px: number, py: number, tx: number, ty: number): boolean => {
    const iso = cartToIso(tx, ty);
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;
    const cx = iso.x;
    const cy = iso.y + halfH;
    const dist = Math.abs(px - cx) / halfW + Math.abs(py - cy) / halfH;
    return dist <= 1;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: Point | null = null;
    
    // Reverse iteration for hit testing (top-most tiles first)
    for (let y = GRID_SIZE - 1; y >= 0; y--) {
      for (let x = GRID_SIZE - 1; x >= 0; x--) {
        if (isPointInTile(mx, my, x, y)) {
          found = { x, y };
          break;
        }
      }
      if (found) break;
    }
    setHoveredCell(found);
  };

  const handleClick = () => {
    if (hoveredCell) {
      onTileClick(hoveredCell);
    }
  };

  // Helper: Draw an isometric tile
  const drawIsoPoly = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, stroke: string | null = null) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.lineTo(x, y + TILE_HEIGHT);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const drawBuilding = (
    ctx: CanvasRenderingContext2D, 
    iso: Point, 
    type: CellType, 
    time: number,
    xIndex: number,
    yIndex: number
  ) => {
    const height = type === CellType.BUILDING_HIGH ? TILE_HEIGHT * 3 : TILE_HEIGHT * 1.5;
    const topY = iso.y - height;
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;

    // Right Face
    ctx.fillStyle = COLORS.buildingSide;
    ctx.beginPath();
    ctx.moveTo(iso.x, iso.y + TILE_HEIGHT);
    ctx.lineTo(iso.x + halfW, iso.y + halfH);
    ctx.lineTo(iso.x + halfW, topY + halfH);
    ctx.lineTo(iso.x, topY + TILE_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.gridLines;
    ctx.stroke();

    // Left Face
    ctx.fillStyle = COLORS.buildingTop; // Slightly lighter
    ctx.beginPath();
    ctx.moveTo(iso.x, iso.y + TILE_HEIGHT);
    ctx.lineTo(iso.x - halfW, iso.y + halfH);
    ctx.lineTo(iso.x - halfW, topY + halfH);
    ctx.lineTo(iso.x, topY + TILE_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top Face
    ctx.fillStyle = type === CellType.BUILDING_HIGH ? '#475569' : '#64748b';
    ctx.beginPath();
    ctx.moveTo(iso.x, topY);
    ctx.lineTo(iso.x + halfW, topY + halfH);
    ctx.lineTo(iso.x, topY + TILE_HEIGHT);
    ctx.lineTo(iso.x - halfW, topY + halfH);
    ctx.closePath();
    ctx.fill();
    
    // Wireframe highlight
    ctx.strokeStyle = COLORS.buildingWireframe;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Windows (Procedural)
    if (type === CellType.BUILDING_HIGH) {
      ctx.fillStyle = COLORS.buildingWindowOn;
      const seed = (xIndex * 31 + yIndex * 17); // Deterministic seed per building
      const rows = 6;
      const cols = 2;
      
      // Draw windows on Left Face
      for(let r=0; r<rows; r++) {
         for(let c=0; c<cols; c++) {
             // Random flicker based on time
             const isLit = Math.sin(seed + r * c + time * 0.002) > 0.6; 
             if (!isLit) continue;

             const wx = iso.x - halfW + 4 + (c * 10);
             const wy = iso.y + TILE_HEIGHT - 10 - (r * 12);
             
             // Skew calculation for isometric "up" on left face
             // Simplified: draw small skewed rects
             ctx.globalAlpha = 0.6 + Math.sin(time * 0.01) * 0.2;
             ctx.fillRect(wx, wy - height + TILE_HEIGHT, 4, 6);
             ctx.globalAlpha = 1;
         }
      }
    }
  };

  const drawTower = (ctx: CanvasRenderingContext2D, x: number, y: number, isGhost: boolean, time: number) => {
    const iso = cartToIso(x, y);
    const topY = iso.y - TILE_HEIGHT * 2.5; 
    const color = isGhost ? COLORS.ghostTower : COLORS.tower;
    
    if (isGhost) {
        ctx.globalAlpha = 0.5;
    }

    // Glow
    if (!isGhost) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.tower;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Structure
    ctx.beginPath();
    ctx.moveTo(iso.x, iso.y + TILE_HEIGHT / 2);
    ctx.lineTo(iso.x, topY);
    ctx.stroke();
    
    // Cross beams
    ctx.beginPath();
    ctx.moveTo(iso.x - 5, iso.y - 10);
    ctx.lineTo(iso.x + 5, iso.y - 10);
    ctx.stroke();

    // Top Unit
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(iso.x, topY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Radar/Pulse Animation
    if (!isGhost) {
        const angle = (time * 0.003) % (Math.PI * 2);
        
        ctx.strokeStyle = COLORS.towerPulse;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(iso.x, topY, 15, 7.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Spinning Radar Dish (Simulated)
        const rx = iso.x + Math.cos(angle) * 15;
        const ry = topY + Math.sin(angle) * 7.5;
        ctx.beginPath();
        ctx.moveTo(iso.x, topY);
        ctx.lineTo(rx, ry);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate Ghost Range (Simple Euclidean for preview)
      let ghostPoints: Point[] = [];
      if (hoveredCell && grid[hoveredCell.y][hoveredCell.x] === CellType.STREET) {
          const isExisting = towers.some(t => t.x === hoveredCell.x && t.y === hoveredCell.y);
          if (!isExisting) {
             // Pre-calculate ghost range highlight
             for (let y = 0; y < GRID_SIZE; y++) {
                 for (let x = 0; x < GRID_SIZE; x++) {
                     const dx = x - hoveredCell.x;
                     const dy = y - hoveredCell.y;
                     if (dx*dx + dy*dy <= TOWER_RANGE * TOWER_RANGE) {
                         ghostPoints.push({x, y});
                     }
                 }
             }
          }
      }

      // Painter's Algorithm: Draw back to front (Y then X)
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cellType = grid[y][x];
            const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
            const isCovered = coverage[y][x];
            const isGhostRange = ghostPoints.some(p => p.x === x && p.y === y);
            
            const iso = cartToIso(x, y);

            // 1. Draw Floor Tile
            let floorColor = COLORS.street;
            if (cellType === CellType.PARK) floorColor = COLORS.park;
            
            // Grid Pulse Effect
            if (cellType === CellType.STREET && !isCovered && Math.random() > 0.995) {
                // Occasional flicker
                floorColor = '#1e293b';
            }

            drawIsoPoly(ctx, iso.x, iso.y, floorColor, COLORS.gridLines);

            // 2. Draw Park Detail (Trees as simple triangles)
            if (cellType === CellType.PARK) {
                ctx.fillStyle = COLORS.parkHighlight;
                ctx.beginPath();
                ctx.moveTo(iso.x, iso.y + TILE_HEIGHT/2 - 5);
                ctx.lineTo(iso.x + 4, iso.y + TILE_HEIGHT/2 + 2);
                ctx.lineTo(iso.x - 4, iso.y + TILE_HEIGHT/2 + 2);
                ctx.fill();
            }

            // 3. Draw Overlays (Coverage / Ghost)
            if (isCovered && cellType !== CellType.BUILDING_HIGH && cellType !== CellType.BUILDING_LOW) {
                drawIsoPoly(ctx, iso.x, iso.y, COLORS.coverageOverlay);
            } else if (isGhostRange && cellType === CellType.STREET) {
                drawIsoPoly(ctx, iso.x, iso.y, COLORS.ghostCoverage);
            }

            // 4. Draw Cursor Hover
            if (isHovered) {
                drawIsoPoly(ctx, iso.x, iso.y, 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.5)');
            }

            // 5. Draw Objects
            if (cellType === CellType.BUILDING_LOW || cellType === CellType.BUILDING_HIGH) {
                drawBuilding(ctx, iso, cellType, time, x, y);
            }

            // 6. Draw Towers
            const towerHere = towers.find(t => t.x === x && t.y === y);
            if (towerHere) {
                drawTower(ctx, x, y, false, time);
            }
            
            // 7. Draw Ghost Tower
            if (isHovered && !towerHere && (cellType === CellType.STREET || cellType === CellType.PARK)) {
                 drawTower(ctx, x, y, true, time);
            }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [grid, towers, coverage, hoveredCell, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="cursor-crosshair block touch-none outline-none"
    />
  );
};

export default GameCanvas;