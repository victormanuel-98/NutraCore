import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "nutracore_theme";
const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return getSystemTheme();
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const isDark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, isDark]);

  useEffect(() => {
    if (!window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (event) => {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === "light" || storedTheme === "dark") return;
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      setTheme,
      toggleTheme: () => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
    }),
    [theme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
}
