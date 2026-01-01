
# Pacman Game 🎮

A modern Pac‑Man style browser game built with React, TypeScript, Vite and HTML Canvas.  
The goal is to collect all pellets in the maze while avoiding the ghosts, with smooth animations and multiple visual themes (Classic, Neon, Cyberpunk).

## Demo

Live: https://pacman-game-y8d2.vercel.app/


## Features

- **Responsive** canvas‑based Pac‑Man gameplay.
- **Keyboard controls**: Arrow keys or WASD to move Pac‑Man.
- **Score & lives HUD** displayed above the board.
- **Themed skin system**:
  - Classic, Neon, and Cyberpunk themes.
  - Smooth transitions using CSS variables and GSAP‑style animations.
- Built from a Figma design using shadcn/ui‑style tokens and a custom theme.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS + custom CSS theme variables
- **Animation:** GSAP (for theme switcher highlight)
- **Canvas Rendering:** HTML5 Canvas API for maze, Pac‑Man and ghosts

## Project Structure

```bash
src/
  app/
    App.tsx           # App shell, HUD, and layout
    PacmanGame.tsx    # Canvas game logic & rendering
    ThemeSwitcher.tsx # UI to toggle Classic / Neon / Cyberpunk
  theme/
    ThemeContext.tsx  # React context for game themes
  styles/
    index.css         # Global styles
    theme.css         # Design tokens + Pac‑Man theme variables
  main.tsx            # React entry, renders <App />

1. Clone the repository
bash
git clone https://github.com/<your-username>/pacman-game.git
cd pacman-game
2. Install dependencies
bash
npm install
3. Run the development server
bash
npm run dev
Open the printed URL in your browser (usually http://localhost:5173) to play the game.

Theme System
The game uses a small theming setup:

CSS variables defined in theme.css for maze, pellets, Pac‑Man and ghost colors.

A ThemeContext that stores the current theme (classic, neon, cyberpunk) and syncs it with localStorage.

A ThemeSwitcher component that:

Renders buttons for each theme.

Applies the body.theme-* class.

Triggers a short GSAP animation on theme change.

This keeps the core game logic independent from the UI skin and lets new themes be added easily.

Controls
Move: Arrow keys or WASD

Objective: Eat all pellets while avoiding ghosts.

Lose a life: Colliding with a ghost.




