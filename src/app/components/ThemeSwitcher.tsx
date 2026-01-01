import React, { useEffect, useRef } from "react";
import { useGameTheme, GameTheme } from "../../theme/ThemeContext";
import gsap from "gsap";

const themes: { id: GameTheme; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "neon", label: "Neon" },
  { id: "cyberpunk", label: "Cyberpunk" },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useGameTheme();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // subtle "pulse" when theme changes (CSS only)
  useEffect(() => {
    if (!wrapperRef.current) return;
    gsap.fromTo(
      wrapperRef.current,
      { scale: 1, boxShadow: "0 0 0px rgba(250, 250, 250, 0)" },
      {
        scale: 1.04,
        boxShadow: "0 0 30px rgba(244, 114, 182, 0.9)",
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      }
    );
  }, [theme])

  return (
    <div ref={wrapperRef} className="theme-switcher">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`theme-btn ${theme === t.id ? "active" : ""}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
