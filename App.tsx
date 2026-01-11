import React, { useState, useMemo } from 'react';
import { GRID_SIZE, DEFAULT_GRID, MAX_TOWERS, TOWER_RANGE } from './constants';
import { Grid, Point, Tower, CellType } from './types';
import GameCanvas from './components/GameCanvas';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { generateCityLayout } from './services/levelGenerator';
import { RadioTower, RefreshCw, Info, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const [view, setView] = useState<'landing' | 'game'>('landing');
  const [grid, setGrid] = useState<Grid>(DEFAULT_GRID);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [hoveredCell, setHoveredCell] = useState<Point | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Raycasting Logic
  const coverage = useMemo(() => {
    const map = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));

    towers.forEach(tower => {
      for (let y = Math.max(0, tower.y - TOWER_RANGE); y < Math.min(GRID_SIZE, tower.y + TOWER_RANGE + 1); y++) {
        for (let x = Math.max(0, tower.x - TOWER_RANGE); x < Math.min(GRID_SIZE, tower.x + TOWER_RANGE + 1); x++) {
          
          if (x === tower.x && y === tower.y) {
            map[y][x] = true;
            continue;
          }

          const dx = x - tower.x;
          const dy = y - tower.y;
          if (dx*dx + dy*dy > TOWER_RANGE * TOWER_RANGE) continue;

          if (hasLineOfSight(grid, tower.x, tower.y, x, y)) {
            map[y][x] = true;
          }
        }
      }
    });

    return map;
  }, [grid, towers]);

  // Score Calculation
  const stats = useMemo(() => {
    let totalStreet = 0;
    let coveredStreet = 0;
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x] === CellType.STREET || grid[y][x] === CellType.PARK) {
          totalStreet++;
          if (coverage[y][x]) {
            coveredStreet++;
          }
        }
      }
    }
    
    return {
      percent: totalStreet === 0 ? 0 : Math.round((coveredStreet / totalStreet) * 100),
      usedTowers: towers.length
    };
  }, [grid, coverage, towers]);

  const handleTileClick = (p: Point) => {
    if (grid[p.y][p.x] === CellType.BUILDING_HIGH || grid[p.y][p.x] === CellType.BUILDING_LOW) {
      return;
    }

    const existingTowerIndex = towers.findIndex(t => t.x === p.x && t.y === p.y);

    if (existingTowerIndex >= 0) {
      const newTowers = [...towers];
      newTowers.splice(existingTowerIndex, 1);
      setTowers(newTowers);
    } else {
      if (towers.length >= MAX_TOWERS) return; 
      
      setTowers([...towers, {
        id: `${Date.now()}`,
        x: p.x,
        y: p.y,
        range: TOWER_RANGE
      }]);
    }
  };

  const handleGenerate = async (diff: 'easy' | 'medium' | 'hard') => {
    setLoading(true);
    setError(null);
    try {
      const newGrid = await generateCityLayout(diff);
      if (newGrid) {
          setGrid(newGrid);
          setTowers([]); 
      } else {
          setError("Generation returned empty grid.");
      }
    } catch (e) {
      setError("Failed to generate city. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('game')} />;
  }

  return (
    <div className="relative w-full h-[100dvh] bg-slate-900 text-slate-100 overflow-hidden font-mono selection:bg-cyan-500/30">
      {/* Background Canvas */}
      <div className="absolute inset-0 z-0">
        <GameCanvas 
          grid={grid} 
          towers={towers} 
          coverage={coverage} 
          onTileClick={handleTileClick}
          hoveredCell={hoveredCell}
          setHoveredCell={setHoveredCell}
        />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6 relative z-10" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-[0.2em] animate-pulse">GENERATING CITY</h2>
            <div className="w-64 h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 animate-loading-bar"></div>
            </div>
            <p className="text-cyan-500/80 text-xs mt-2 font-mono">Neural Network Processing...</p>
        </div>
      )}

      {/* HUD - Header */}
      <div className="absolute top-0 left-0 w-full p-2 md:p-6 flex flex-col md:flex-row justify-between pointer-events-none z-10 gap-2 transition-all">
        {/* Title Bar */}
        <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 p-3 md:p-4 rounded-xl shadow-2xl pointer-events-auto flex items-center gap-4 w-full md:w-auto min-w-[200px] animate-slide-down">
          <button 
            onClick={() => setView('landing')}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg group"
            aria-label="Back to Menu"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wider flex items-center gap-2 font-display">
                <RadioTower className="w-5 h-5 text-cyan-400" />
                <span>SPECTRUM CITY</span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">5G NETWORK OPTIMIZATION PROTOCOL</p>
          </div>
          
          {/* Mobile Quick Stats */}
          <div className="flex md:hidden ml-auto gap-4 text-sm items-center">
               <div className={`font-bold ${stats.percent === 100 ? 'text-green-400' : 'text-cyan-400'}`}>
                    {stats.percent}%
               </div>
               <div className={`font-bold px-2 py-1 rounded bg-slate-800 ${stats.usedTowers === MAX_TOWERS ? 'text-red-400 border border-red-500/30' : 'text-yellow-400 border border-yellow-500/30'}`}>
                    {stats.usedTowers}/{MAX_TOWERS}
               </div>
          </div>
        </div>

        {/* Desktop Stats Panel */}
        <div className="hidden md:flex bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 p-4 rounded-xl shadow-2xl gap-8 pointer-events-auto animate-slide-down delay-100">
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Coverage</p>
            <div className="flex items-end gap-1 justify-center relative group">
              <span className={`text-4xl font-bold font-display ${stats.percent === 100 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]'} transition-all`}>
                {stats.percent}
              </span>
              <span className="text-sm mb-2 font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="w-px bg-slate-700/50"></div>
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Towers</p>
            <div className="flex items-end gap-1 justify-center">
              <span className={`text-4xl font-bold font-display ${stats.usedTowers === MAX_TOWERS ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]'} transition-all`}>
                {stats.usedTowers}
              </span>
              <span className="text-sm mb-2 text-slate-500 font-bold">/{MAX_TOWERS}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-0 w-full flex flex-col items-center gap-4 pointer-events-auto z-10 px-4">
        
        {/* Hover Tooltip */}
        {hoveredCell && (
            <div className="bg-slate-900/90 text-white text-xs px-4 py-2 rounded-lg mb-2 backdrop-blur-md border border-slate-700 shadow-xl flex items-center gap-3 animate-fade-in-up">
                <span className="text-slate-400 font-mono">COORD: [{hoveredCell.x}, {hoveredCell.y}]</span>
                <span className="w-px h-3 bg-slate-600"></span>
                <span className="font-bold tracking-wide text-cyan-300">{CellType[grid[hoveredCell.y][hoveredCell.x]].replace('_', ' ')}</span>
            </div>
        )}

        {/* Action Bar */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl shadow-2xl flex flex-wrap justify-center items-center gap-2 max-w-full animate-slide-up">
            <button 
              onClick={() => handleGenerate('easy')}
              disabled={loading}
              className="px-6 py-2.5 hover:bg-emerald-900/30 rounded-xl text-xs font-bold text-emerald-400 border border-transparent hover:border-emerald-500/30 transition-all flex items-center gap-2 active:scale-95"
            >
               EASY
            </button>
            <button 
              onClick={() => handleGenerate('medium')}
              disabled={loading}
              className="px-6 py-2.5 hover:bg-yellow-900/30 rounded-xl text-xs font-bold text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-all active:scale-95"
            >
              MEDIUM
            </button>
            <button 
              onClick={() => handleGenerate('hard')}
              disabled={loading}
              className="px-6 py-2.5 hover:bg-red-900/30 rounded-xl text-xs font-bold text-red-400 border border-transparent hover:border-red-500/30 transition-all active:scale-95"
            >
              HARD
            </button>
            <div className="w-px h-8 bg-slate-700 mx-2 hidden sm:block"></div>
             <button 
              onClick={() => { setTowers([]); }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-xl text-xs font-bold transition-all w-full sm:w-auto mt-1 sm:mt-0 flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-3 h-3" /> RESET
            </button>
        </div>
        
        {error && (
            <div className="text-red-400 text-xs bg-red-950/80 px-4 py-2 rounded-lg border border-red-500/30 flex items-center gap-2 animate-bounce">
                <AlertTriangle className="w-3 h-3" />
                {error}
            </div>
        )}
      </div>
      
      {/* Help Modal Trigger */}
      <div className="absolute bottom-24 right-6 md:bottom-8 md:right-8 pointer-events-auto group z-10">
        <div className="bg-slate-800 p-3 rounded-full hover:bg-cyan-600 cursor-help shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all border border-slate-600 hover:border-cyan-400 group-hover:scale-110">
            <Info className="w-6 h-6 text-slate-300 group-hover:text-white" />
        </div>
        <div className="absolute bottom-full right-0 mb-4 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-600 p-6 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-4 group-hover:translate-y-0 origin-bottom-right">
            <h3 className="text-sm font-bold text-white mb-4 font-display border-b border-slate-700 pb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                MISSION PROTOCOLS
            </h3>
            <ul className="text-xs text-slate-300 space-y-3 pl-1">
                <li className="flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">01.</span>
                    <span>Maximize <span className="text-cyan-400 font-bold">Coverage</span> by placing 5G nodes on street tiles.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">02.</span>
                    <span>Signals are blocked by <span className="text-slate-200">Buildings</span>. Use Raycasting visual to find dead zones.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">03.</span>
                    <span>Budget limited to <span className="text-yellow-400 font-bold">{MAX_TOWERS} Towers</span>. Efficiency is paramount.</span>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};

// Utils
function hasLineOfSight(grid: Grid, x0: number, y0: number, x1: number, y1: number): boolean {
   let dx = Math.abs(x1 - x0);
   let dy = Math.abs(y1 - y0);
   let sx = (x0 < x1) ? 1 : -1;
   let sy = (y0 < y1) ? 1 : -1;
   let err = dx - dy;

   let x = x0;
   let y = y0;

   while (true) {
     if (x === x1 && y === y1) return true; 

     if (x !== x0 || y !== y0) {
        const cell = grid[y][x];
        if (cell === CellType.BUILDING_HIGH || cell === CellType.BUILDING_LOW) {
            return false;
        }
     }

     let e2 = 2 * err;
     if (e2 > -dy) {
       err -= dy;
       x += sx;
     }
     if (e2 < dx) {
       err += dx;
       y += sy;
     }
   }
}

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
};

export default App;