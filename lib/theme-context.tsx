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
    name: "Atardecer",
    tagline: "Naranja cálido · Difuminado · Teal",
    emoji: "🌅",
    preview: {
      sidebar: "#1A0900",
      bg: "#E88050",
      accent: "#00BFA6",
      card: "rgba(255,249,244,0.85)",
      text: "#0B1D35",
    },
  },
  bienestar: {
    id: "bienestar",
    name: "Hierbas",
    tagline: "Verde fresco · Bosque · Coral",
    emoji: "🌿",
    preview: {
      sidebar: "#001408",
      bg: "#1E8E52",
      accent: "#F0846A",
      card: "rgba(240,255,248,0.85)",
      text: "#0C3547",
    },
  },
  carbono: {
    id: "carbono",
    name: "Mar",
    tagline: "Océano · Celeste azul · Ámbar",
    emoji: "🌊",
    preview: {
      sidebar: "#000519",
      bg: "#0B6EB8",
      accent: "#F59E0B",
      card: "rgba(238,248,255,0.85)",
      text: "#18181B",
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
