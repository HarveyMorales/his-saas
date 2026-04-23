"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "clasico" | "bienestar" | "carbono";

export const THEMES: Record<ThemeId, {
  id: ThemeId;
  name: string;
  tagline: string;
  emoji: string;
  preview: { sidebar: string; bg: string; accent: string; card: string; text: string };
}> = {
  clasico: {
    id: "clasico",
    name: "HIS Clásico",
    tagline: "Profesional · Navy · Teal",
    emoji: "🏥",
    preview: {
      sidebar: "#0B1D35",
      bg: "#F1F5F9",
      accent: "#00BFA6",
      card: "#FFFFFF",
      text: "#1E293B",
    },
  },
  bienestar: {
    id: "bienestar",
    name: "Bienestar",
    tagline: "Fresco · Coral · Wellness",
    emoji: "🌿",
    preview: {
      sidebar: "#0C3547",
      bg: "#EDFAF6",
      accent: "#F0846A",
      card: "#FFFFFF",
      text: "#0F3330",
    },
  },
  carbono: {
    id: "carbono",
    name: "Carbono",
    tagline: "Urbano · Ámbar · Contraste",
    emoji: "⚡",
    preview: {
      sidebar: "#18181B",
      bg: "#F4F4F5",
      accent: "#F59E0B",
      card: "#FFFFFF",
      text: "#27272A",
    },
  },
};

const STORAGE_KEY = "his-theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  isFirstTime: boolean;
  confirmTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "clasico",
  setTheme: () => {},
  isFirstTime: false,
  confirmTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("clasico");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES[stored]) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      setIsFirstTime(true);
    }
    setMounted(true);
  }, []);

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  const confirmTheme = () => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    setIsFirstTime(false);
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isFirstTime, confirmTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
