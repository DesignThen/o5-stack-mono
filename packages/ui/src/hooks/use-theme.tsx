"use client";

import type { LucideIcon } from "lucide-react";
import { ContrastIcon, MoonIcon, SunIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light" | "system";

const THEME_STORAGE_KEY = "app-ui-theme";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  initialState,
);

function isTheme(value: string | null): value is Theme {
  return value === "dark" || value === "light" || value === "system";
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
}

function getStoredTheme(storageKey: string) {
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function storeTheme(storageKey: string, theme: Theme) {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Theme changes should still work for the current session if storage is blocked.
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [hasHydratedTheme, setHasHydratedTheme] = useState(false);

  useEffect(() => {
    const storedTheme = getStoredTheme(storageKey) ?? defaultTheme;

    setThemeState(storedTheme);
    applyTheme(storedTheme);
    setHasHydratedTheme(true);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (!hasHydratedTheme) return;

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = () => applyTheme("system");

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () =>
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, [hasHydratedTheme, theme]);

  const setTheme = useCallback(
    (themeValue: Theme) => {
      storeTheme(storageKey, themeValue);
      setThemeState(themeValue);
    },
    [storageKey],
  );

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export const THEME = {
  light: {
    id: "light",
    icon: SunIcon,
    name: "Light Mode",
  },
  dark: {
    id: "dark",
    icon: MoonIcon,
    name: "Dark Mode",
  },
  system: {
    id: "system",
    icon: ContrastIcon,
    name: "System Theme",
  },
} satisfies {
  [Key in Theme]: {
    id: Key;
    icon: LucideIcon;
    name: string;
  };
};

export const themeScript = `
(() => {
  try {
    const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    const storedTheme = localStorage.getItem(storageKey);
    const theme = storedTheme === "dark" || storedTheme === "light" || storedTheme === "system"
      ? storedTheme
      : "system";
    const resolvedTheme = theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
  } catch {
  }
})();
`;
