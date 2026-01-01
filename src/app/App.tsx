// src/app/App.tsx
import React from "react";
import { PacmanGame } from "./components/PacmanGame";
import { ThemeProvider } from "../theme/ThemeContext";
import ThemeSwitcher from "./components/ThemeSwitcher";

export default function App() {
  return (
    <ThemeProvider>
      <div
        id="game-root"
        className="min-h-screen bg-black flex flex-col items-center justify-center gap-4"
      >
        {/* HUD – you can connect these to real score/lives later */}
        <div className="hud flex justify-between w-[520px] px-6 py-3 rounded-xl">
          <div className="font-bold">Pac-Man : Reliving Childhood</div>
        
        </div>

        <div className="game-wrapper rounded-2xl">
          <PacmanGame />
        </div>

        <ThemeSwitcher />
      </div>
    </ThemeProvider>
  );
}
