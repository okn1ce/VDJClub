
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Palette } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const GRID_SIZE = 50;
const TOTAL_PIXELS = GRID_SIZE * GRID_SIZE;
const PIXEL_COST = 5;

const COLORS = [
  '#000000', '#FFFFFF', '#6d758d', '#808080', 
  '#FF4500', '#FFA800', '#FFD635', '#00A368', 
  '#7EED56', '#2450A4', '#3690EA', '#51E9F4', 
  '#811E9F', '#B44AC0', '#FF99AA', '#9C6926'
];

const CanvasClash: React.FC = () => {
  const { setView, setActiveGameId, user, canvasPixels, placePixel } = useGame();
  
  const [selectedColor, setSelectedColor] = useState(COLORS[4]); // Default Orange
  const [zoom, setZoom] = useState(1);
  const [notification, setNotification] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const handlePixelClick = (index: number) => {
    if (!user) return;
    
    // Check if pixel is already this color (save money)
    if (canvasPixels[index] === selectedColor) return;

    if (user.credits < PIXEL_COST) {
        showNotification("Not enough credits! (Need 5)");
        return;
    }

    const success = placePixel(index, selectedColor);
    if (!success) {
        showNotification("Error placing pixel");
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="flex flex-col h-screen w-full bg-[#1e1e1e] overflow-hidden relative">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 flex items-center justify-between pointer-events-none">
        <button 
            onClick={() => { setView('HOME'); setActiveGameId(null); }}
            className="pointer-events-auto bg-slate-900/80 hover:bg-slate-800 text-white px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all border border-slate-700 shadow-xl"
        >
            <ArrowLeft size={18} /> Exit Canvas
        </button>

        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-xl text-white font-bold text-sm pointer-events-auto flex items-center gap-2">
           <Palette size={16} className="text-pink-400"/> {PIXEL_COST} Credits / Pixel
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-xl animate-fade-in pointer-events-none">
            {notification}
        </div>
      )}

      {/* Canvas Container (Scrollable/Zoomable) */}
      <div 
        className="flex-1 overflow-auto flex items-center justify-center p-10 bg-[#121212] cursor-grab active:cursor-grabbing relative"
        ref={containerRef}
      >
        <div 
            style={{ 
                transform: `scale(${zoom})`, 
                transition: 'transform 0.2s ease-out',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: '600px', // Base size
                height: '600px',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)',
            }}
            className="shrink-0"
        >
            {Array.from({ length: TOTAL_PIXELS }).map((_, i) => (
                <div 
                    key={i}
                    onClick={() => handlePixelClick(i)}
                    style={{ backgroundColor: canvasPixels[i] || '#ffffff' }}
                    className="w-full h-full hover:brightness-90 hover:outline hover:outline-1 hover:outline-black/20 cursor-crosshair transition-colors duration-200"
                    title={`Pixel ${i}`}
                />
            ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full max-w-2xl px-4 pointer-events-none">
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur rounded-lg p-1 shadow-xl border border-slate-700 pointer-events-auto">
             <button onClick={handleZoomOut} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded"><ZoomOut size={18}/></button>
             <span className="text-xs font-mono w-12 text-center text-slate-400">{Math.round(zoom * 100)}%</span>
             <button onClick={handleZoomIn} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded"><ZoomIn size={18}/></button>
             <div className="w-px h-6 bg-slate-700 mx-1"></div>
             <button onClick={handleResetZoom} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded" title="Reset Zoom"><Maximize size={16}/></button>
          </div>

          {/* Color Palette */}
          <div className="bg-slate-900/90 backdrop-blur rounded-2xl p-3 shadow-2xl border border-slate-700 pointer-events-auto flex flex-wrap justify-center gap-2">
             {COLORS.map(color => (
                 <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 border-2 ${selectedColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
                 />
             ))}
          </div>
      </div>

    </div>
  );
};

export default CanvasClash;
