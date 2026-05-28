import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './VirtualPet.css';

// Palette for our pixel cat
const PALETTE = [
  'transparent',
  '#1e293b', // 1: outline (slate-800)
  '#f59e0b', // 2: main body (amber-500)
  '#fcd34d', // 3: highlight/belly (amber-300)
  '#ffffff', // 4: eye
  '#f472b6', // 5: pink nose/ears
];

// 12x12 pixel art frames
const SPRITES = {
  idle: [
    [0,0,0,1,0,0,0,1,0,0,0,0],
    [0,0,1,2,1,0,1,2,1,0,0,0],
    [0,0,1,2,2,1,2,2,1,0,0,0],
    [0,1,5,2,2,2,2,5,1,0,0,0],
    [0,1,2,4,1,2,4,1,1,0,0,0],
    [0,1,2,2,5,2,2,1,0,1,0,0],
    [0,0,1,2,2,2,2,1,1,1,1,0],
    [0,0,1,2,3,3,2,2,2,2,1,0],
    [0,0,1,2,3,3,2,2,2,2,1,0],
    [0,0,1,1,2,2,1,2,2,1,1,0],
    [0,0,0,1,1,1,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  walk1: [
    [0,0,0,1,0,0,0,1,0,0,0,0],
    [0,0,1,2,1,0,1,2,1,0,0,0],
    [0,0,1,2,2,1,2,2,1,0,0,0],
    [0,1,5,2,2,2,2,5,1,0,0,0],
    [0,1,2,4,1,2,4,1,1,0,0,1],
    [0,1,2,2,5,2,2,1,0,1,1,0],
    [0,0,1,2,2,2,2,1,1,1,0,0],
    [0,0,1,2,3,3,2,2,2,2,1,0],
    [0,0,1,2,3,3,2,2,2,2,1,0],
    [0,0,0,1,1,2,1,1,2,1,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  walk2: [
    [0,0,0,1,0,0,0,1,0,0,0,0],
    [0,0,1,2,1,0,1,2,1,0,0,0],
    [0,0,1,2,2,1,2,2,1,0,0,0],
    [0,1,5,2,2,2,2,5,1,0,0,0],
    [0,1,2,4,1,2,4,1,1,0,0,0],
    [0,1,2,2,5,2,2,1,0,1,0,0],
    [0,0,1,2,2,2,2,1,1,1,1,0],
    [0,0,1,2,3,3,2,2,2,2,1,0],
    [0,0,1,2,3,3,2,2,2,2,1,0],
    [0,0,1,1,2,1,1,2,1,1,0,0],
    [0,0,0,1,1,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sleep: [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0,0,0],
    [0,1,2,1,0,1,2,1,0,0,0,0],
    [1,2,2,2,1,2,2,2,1,1,1,0],
    [1,2,1,1,2,1,1,2,2,2,2,1],
    [1,2,2,5,2,2,2,2,2,2,2,1],
    [0,1,2,2,2,2,3,3,2,2,1,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ]
};

type PetState = 'idle' | 'walk' | 'sleep';

export const VirtualPet: React.FC = () => {
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [x, setX] = useState(() => Math.random() * 200 + 50);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [petState, setPetState] = useState<PetState>('idle');
  const [frameIndex, setFrameIndex] = useState(0);
  
  const [hearts, setHearts] = useState<{id: number}[]>([]);
  const [zzzs, setZzzs] = useState<{id: number}[]>([]);
  const heartIdRef = useRef(0);
  const zzzIdRef = useRef(0);

  // Hidden on admin & display routes
  const isHidden = location.pathname.startsWith('/admin') || location.pathname.startsWith('/display');

  const SCALE = 4;
  const SPRITE_SIZE = 12;
  const CANVAS_SIZE = SPRITE_SIZE * SCALE; // 48px

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isHidden) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    let currentSprite = SPRITES.idle;
    if (petState === 'walk') {
      currentSprite = frameIndex % 2 === 0 ? SPRITES.walk1 : SPRITES.walk2;
    } else if (petState === 'sleep') {
      currentSprite = SPRITES.sleep;
    }

    ctx.save();
    // Flip if going left
    if (direction === -1) {
      ctx.translate(CANVAS_SIZE, 0);
      ctx.scale(-1, 1);
    }

    // Draw pixels
    for (let y = 0; y < SPRITE_SIZE; y++) {
      for (let x = 0; x < SPRITE_SIZE; x++) {
        const colorIdx = currentSprite[y][x];
        if (colorIdx > 0) {
          ctx.fillStyle = PALETTE[colorIdx];
          ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
        }
      }
    }
    ctx.restore();
  }, [petState, frameIndex, direction, isHidden]);

  // Main game loop
  useEffect(() => {
    if (isHidden) return;

    const tickMs = 200; // Frame duration
    const interval = setInterval(() => {
      setFrameIndex(f => f + 1);

      setPetState(currentState => {
        setX(prevX => {
          let nextX = prevX;
          let nextDir = direction;

          // Movement
          if (currentState === 'walk') {
            const speed = 6;
            nextX = prevX + (speed * direction);
            
            // Boundaries
            const maxW = window.innerWidth - CANVAS_SIZE - 20;
            if (nextX < 20) {
              nextX = 20;
              nextDir = 1;
            } else if (nextX > maxW) {
              nextX = maxW;
              nextDir = -1;
            }
          }

          // Randomly change state sometimes (approx 1 in 20 ticks -> every 4s)
          if (Math.random() < 0.05) {
            const r = Math.random();
            let nextState: PetState = 'idle';
            if (r < 0.4) nextState = 'walk';
            else if (r < 0.6) nextState = 'sleep';
            else nextState = 'idle';

            // Randomly turn around sometimes when walking/idling
            if (Math.random() < 0.3) {
              nextDir = nextDir === 1 ? -1 : 1;
            }

            setPetState(nextState);
            setDirection(nextDir);
          } else {
            setDirection(nextDir);
          }

          return nextX;
        });

        return currentState; // keeping current state if no random change occurred
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [direction, isHidden]);

  // Sleep ZZZ particles
  useEffect(() => {
    if (isHidden || petState !== 'sleep') return;
    
    const interval = setInterval(() => {
      const id = zzzIdRef.current++;
      setZzzs(prev => [...prev, { id }]);
      setTimeout(() => {
        setZzzs(prev => prev.filter(z => z.id !== id));
      }, 2500); // match animation duration
    }, 1500);

    return () => clearInterval(interval);
  }, [petState, isHidden]);

  const handleInteract = () => {
    if (petState === 'sleep') {
      setPetState('idle'); // Wake up
    }
    
    // Spawn heart
    const id = heartIdRef.current++;
    setHearts(prev => [...prev, { id }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 1000);
  };

  if (isHidden) return null;

  return (
    <div className="virtual-pet-container">
      <div 
        className="virtual-pet-wrapper"
        style={{ left: `${x}px` }}
        onClick={handleInteract}
      >
        <div className="pet-name-tooltip">Kitty</div>
        
        {hearts.map(h => (
          <div key={h.id} className="pet-heart">❤️</div>
        ))}
        
        {zzzs.map(z => (
          <div key={z.id} className="pet-zzz">Z</div>
        ))}
        
        <canvas 
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="virtual-pet-canvas"
        />
        <div className="pet-shadow" />
      </div>
    </div>
  );
};
