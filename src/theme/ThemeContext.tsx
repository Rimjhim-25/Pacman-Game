import React, { createContext, useContext, useEffect, useState } from "react";

export type GameTheme = "classic" | "neon" | "cyberpunk";

interface ThemeContextValue {
  theme: GameTheme;
  setTheme: (theme: GameTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<GameTheme>("classic");

  useEffect(() => {
    const stored = window.localStorage.getItem("game-theme") as GameTheme | null;
    if (stored) {
      setThemeState(stored);
      applyThemeClass(stored);
    } else {
      applyThemeClass("classic");
    }
  }, []);

  const applyThemeClass = (themeName: GameTheme) => {
    const body = document.body;
    body.classList.remove("theme-classic", "theme-neon", "theme-cyberpunk");
    body.classList.add(`theme-${themeName}`);
  };

  const setTheme = (next: GameTheme) => {
    setThemeState(next);
    applyThemeClass(next);
    window.localStorage.setItem("game-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useGameTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useGameTheme must be used inside ThemeProvider");
  return ctx;
};
