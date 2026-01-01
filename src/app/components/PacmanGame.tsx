import { useEffect, useRef, useState } from 'react';


const CELL_SIZE = 25;
const GAME_SPEED = 150; // milliseconds per move

// Maze layout (1 = wall, 0 = path with dot, 2 = path without dot, 3 = ghost house)
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,3,3,1,1,0,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,1,3,3,3,3,1,0,0,0,0,0,0,0],
  [1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  row: number;
  col: number;
}

interface Ghost extends Position {
  color: string;
  direction: Direction;
}

export function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'win'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const pacmanRef = useRef<Position & { direction: Direction; nextDirection: Direction | null; mouthOpen: number }>({ 
    row: 1, 
    col: 1, 
    direction: 'RIGHT',
    nextDirection: null,
    mouthOpen: 0 
  });
  
  const ghostsRef = useRef<Ghost[]>([
    { row: 9, col: 9, color: '#FF0000', direction: 'LEFT' },
    { row: 9, col: 10, color: '#FFB8FF', direction: 'RIGHT' },
    { row: 8, col: 9, color: '#00FFFF', direction: 'UP' },
    { row: 8, col: 10, color: '#FFB851', direction: 'DOWN' },
  ]);
  
  const dotsRef = useRef<boolean[][]>([]);
  const invincibleRef = useRef(false);
  const invincibleTimerRef = useRef(0);
  const nextDirectionRef = useRef<Direction | null>(null);

  // Initialize dots
  useEffect(() => {
    const dots: boolean[][] = [];
    for (let row = 0; row < MAZE.length; row++) {
      dots[row] = [];
      for (let col = 0; col < MAZE[row].length; col++) {
        dots[row][col] = MAZE[row][col] === 0;
      }
    }
    dotsRef.current = dots;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const key = e.key.toLowerCase();
      
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        
        switch (key) {
          case 'arrowup':
          case 'w':
            nextDirectionRef.current = 'UP';
            break;
          case 'arrowdown':
          case 's':
            nextDirectionRef.current = 'DOWN';
            break;
          case 'arrowleft':
          case 'a':
            nextDirectionRef.current = 'LEFT';
            break;
          case 'arrowright':
          case 'd':
            nextDirectionRef.current = 'RIGHT';
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let gameInterval: number;
    let animationFrameId: number;

    const isWall = (row: number, col: number): boolean => {
      if (row < 0 || row >= MAZE.length || col < 0 || col >= MAZE[0].length) {
        return false; // Allow tunnel wrapping
      }
      return MAZE[row][col] === 1;
    };

    const getNextPosition = (pos: Position, direction: Direction): Position => {
      let newRow = pos.row;
      let newCol = pos.col;

      switch (direction) {
        case 'UP':
          newRow--;
          break;
        case 'DOWN':
          newRow++;
          break;
        case 'LEFT':
          newCol--;
          break;
        case 'RIGHT':
          newCol++;
          break;
      }

      // Handle wrapping
      if (newCol < 0) newCol = MAZE[0].length - 1;
      if (newCol >= MAZE[0].length) newCol = 0;
      if (newRow < 0) newRow = MAZE.length - 1;
      if (newRow >= MAZE.length) newRow = 0;

      return { row: newRow, col: newCol };
    };

    const canMove = (pos: Position, direction: Direction): boolean => {
      const nextPos = getNextPosition(pos, direction);
      return !isWall(nextPos.row, nextPos.col);
    };

    const movePacman = () => {
      const pacman = pacmanRef.current;
      
      // Try to change direction
      if (nextDirectionRef.current && canMove(pacman, nextDirectionRef.current)) {
        pacman.direction = nextDirectionRef.current;
        nextDirectionRef.current = null;
      }

      // Move in current direction
      if (canMove(pacman, pacman.direction)) {
        const nextPos = getNextPosition(pacman, pacman.direction);
        pacman.row = nextPos.row;
        pacman.col = nextPos.col;

        // Eat dot
        if (dotsRef.current[pacman.row]?.[pacman.col]) {
          dotsRef.current[pacman.row][pacman.col] = false;
          setScore(prev => prev + 10);

          // Check win
          const hasDotsLeft = dotsRef.current.some(row => row.some(dot => dot));
          if (!hasDotsLeft) {
            setGameState('win');
          }
        }
      }
    };

    const moveGhost = (ghost: Ghost) => {
      // Try current direction first
      if (!canMove(ghost, ghost.direction)) {
        // Pick a random valid direction
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const validDirections = directions.filter(dir => canMove(ghost, dir));
        
        if (validDirections.length > 0) {
          ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        }
      }

      // Move
      if (canMove(ghost, ghost.direction)) {
        const nextPos = getNextPosition(ghost, ghost.direction);
        ghost.row = nextPos.row;
        ghost.col = nextPos.col;
      }

      // Occasionally change direction
      if (Math.random() < 0.1) {
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const validDirections = directions.filter(dir => canMove(ghost, dir));
        
        if (validDirections.length > 1) {
          ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        }
      }
    };

    const checkCollisions = () => {
      if (invincibleRef.current) {
        invincibleTimerRef.current--;
        if (invincibleTimerRef.current <= 0) {
          invincibleRef.current = false;
        }
        return;
      }

      const pacman = pacmanRef.current;
      for (const ghost of ghostsRef.current) {
        if (pacman.row === ghost.row && pacman.col === ghost.col) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
            } else {
              // Reset positions
              pacmanRef.current.row = 1;
              pacmanRef.current.col = 1;
              pacmanRef.current.direction = 'RIGHT';
              nextDirectionRef.current = null;

              ghostsRef.current[0].row = 9;
              ghostsRef.current[0].col = 9;
              ghostsRef.current[1].row = 9;
              ghostsRef.current[1].col = 10;
              ghostsRef.current[2].row = 8;
              ghostsRef.current[2].col = 9;
              ghostsRef.current[3].row = 8;
              ghostsRef.current[3].col = 10;

              invincibleRef.current = true;
              invincibleTimerRef.current = 10;
            }
            return newLives;
          });
          break;
        }
      }
    };

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw maze
      for (let row = 0; row < MAZE.length; row++) {
        for (let col = 0; col < MAZE[row].length; col++) {
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;

          if (MAZE[row][col] === 1) {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          } else if (MAZE[row][col] === 3) {
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      // Draw dots
      ctx.fillStyle = '#FFD700';
      for (let row = 0; row < dotsRef.current.length; row++) {
        for (let col = 0; col < dotsRef.current[row].length; col++) {
          if (dotsRef.current[row][col]) {
            ctx.beginPath();
            ctx.arc(
              col * CELL_SIZE + CELL_SIZE / 2, 
              row * CELL_SIZE + CELL_SIZE / 2, 
              3, 
              0, 
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }

      // Draw Pacman
      const pacman = pacmanRef.current;
      const pacX = pacman.col * CELL_SIZE + CELL_SIZE / 2;
      const pacY = pacman.row * CELL_SIZE + CELL_SIZE / 2;
      
      pacman.mouthOpen += 0.3;
      const mouthAngle = Math.abs(Math.sin(pacman.mouthOpen)) * 0.4;
      
      let rotation = 0;
      switch (pacman.direction) {
        case 'RIGHT': rotation = 0; break;
        case 'LEFT': rotation = Math.PI; break;
        case 'UP': rotation = Math.PI * 1.5; break;
        case 'DOWN': rotation = Math.PI * 0.5; break;
      }

      const blinking = invincibleRef.current && invincibleTimerRef.current % 2 === 0;
      ctx.fillStyle = blinking ? '#888888' : '#FFFF00';
      ctx.beginPath();
      ctx.arc(pacX, pacY, CELL_SIZE / 2 - 2, rotation + mouthAngle, rotation + Math.PI * 2 - mouthAngle);
      ctx.lineTo(pacX, pacY);
      ctx.fill();

      // Draw ghosts
      for (const ghost of ghostsRef.current) {
        const ghostX = ghost.col * CELL_SIZE + CELL_SIZE / 2;
        const ghostY = ghost.row * CELL_SIZE + CELL_SIZE / 2;

        // Ghost body
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghostX, ghostY - 3, CELL_SIZE / 2 - 2, Math.PI, 0);
        ctx.lineTo(ghostX + CELL_SIZE / 2 - 2, ghostY + CELL_SIZE / 2 - 2);
        
        // Wavy bottom
        const waveSize = 3;
        ctx.lineTo(ghostX + waveSize * 2, ghostY + CELL_SIZE / 2 - 5);
        ctx.lineTo(ghostX + waveSize, ghostY + CELL_SIZE / 2 - 2);
        ctx.lineTo(ghostX, ghostY + CELL_SIZE / 2 - 5);
        ctx.lineTo(ghostX - waveSize, ghostY + CELL_SIZE / 2 - 2);
        ctx.lineTo(ghostX - waveSize * 2, ghostY + CELL_SIZE / 2 - 5);
        
        ctx.lineTo(ghostX - CELL_SIZE / 2 + 2, ghostY + CELL_SIZE / 2 - 2);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ghostX - 4, ghostY - 2, 3, 0, Math.PI * 2);
        ctx.arc(ghostX + 4, ghostY - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000080';
        ctx.beginPath();
        ctx.arc(ghostX - 4, ghostY - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(ghostX + 4, ghostY - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const gameUpdate = () => {
      movePacman();
      ghostsRef.current.forEach(moveGhost);
      checkCollisions();
    };

    gameInterval = window.setInterval(gameUpdate, GAME_SPEED);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      clearInterval(gameInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  const startGame = () => {
    // Reset
    pacmanRef.current = { 
      row: 1, 
      col: 1, 
      direction: 'RIGHT',
      nextDirection: null,
      mouthOpen: 0 
    };
    
    ghostsRef.current = [
      { row: 9, col: 9, color: '#FF0000', direction: 'LEFT' },
      { row: 9, col: 10, color: '#FFB8FF', direction: 'RIGHT' },
      { row: 8, col: 9, color: '#00FFFF', direction: 'UP' },
      { row: 8, col: 10, color: '#FFB851', direction: 'DOWN' },
    ];

    const dots: boolean[][] = [];
    for (let row = 0; row < MAZE.length; row++) {
      dots[row] = [];
      for (let col = 0; col < MAZE[row].length; col++) {
        dots[row][col] = MAZE[row][col] === 0;
      }
    }
    dotsRef.current = dots;

    setScore(0);
    setLives(3);
    invincibleRef.current = false;
    invincibleTimerRef.current = 0;
    nextDirectionRef.current = null;

    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-8">
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <h1 className="text-7xl font-bold text-yellow-400 mb-12 tracking-widest" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              PAC-MAN
            </h1>
            <button
              onClick={startGame}
              className="px-16 py-5 bg-yellow-400 text-black text-3xl font-bold rounded-xl hover:bg-yellow-300 active:scale-95 transition-all shadow-lg"
            >
              START NOW
            </button>
            <div className="mt-10 text-white text-xl">
              <p>Use Arrow Keys or WASD to move</p>
              <p className="mt-2 text-gray-400">Eat all dots and avoid the ghosts!</p>
            </div>
          </div>
        </div>
      )}

      {(gameState === 'gameOver' || gameState === 'win') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-10">
          <div className="text-center">
            <h1 className="text-7xl font-bold text-yellow-400 mb-6 animate-pulse">
              {gameState === 'win' ? '🎉 YOU WIN! 🎉' : 'GAME OVER'}
            </h1>
            <p className="text-white text-4xl mb-10">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="px-16 py-5 bg-yellow-400 text-black text-3xl font-bold rounded-xl hover:bg-yellow-300 active:scale-95 transition-all shadow-lg"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between w-full max-w-[500px] text-white text-2xl font-bold mb-4">
        <div className="bg-blue-900 px-6 py-2 rounded-lg">SCORE: {score}</div>
        <div className="bg-red-900 px-6 py-2 rounded-lg">LIVES: {'❤️'.repeat(lives)}</div>
      </div>

      <canvas
        ref={canvasRef}
        width={MAZE[0].length * CELL_SIZE}
        height={MAZE.length * CELL_SIZE}
        className="border-4 border-blue-500 shadow-2xl rounded-lg"
      />

      {gameState === 'playing' && (
        <div className="text-white text-center mt-4">
          <p className="text-xl">🕹️ Use Arrow Keys or WASD to move Pac-Man</p>
          <p className="text-gray-400 mt-2">Collect all the dots while avoiding the ghosts!</p>
        </div>
      )}
    </div>
  );
}
