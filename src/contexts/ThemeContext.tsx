import React, { createContext, useContext, useState, useEffect } from "react";

export interface Theme {
  mode: "light" | "dark";
  colors: {
    // Background colors
    primary: string;
    secondary: string;
    tertiary: string;

    // Text colors
    text: string;
    textSecondary: string;

    // UI colors
    accent: string;
    accentHover: string;
    border: string;

    // Chart colors
    chartBackground: string;
    chartGrid: string;
    chartCrosshair: string;
    chartBorder: string;

    // Indicator colors
    sma: string;
    ema: string;
    rsi: string;
    macdLine: string;
    macdSignal: string;
    macdHistogram: string;

    // Candlestick colors
    bullish: string;
    bearish: string;
  };
}

const lightTheme: Theme = {
  mode: "light",
  colors: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    tertiary: "#e9ecef",

    text: "#212529",
    textSecondary: "#6c757d",

    accent: "#26a69a",
    accentHover: "#2bbbad",
    border: "#dee2e6",

    chartBackground: "#ffffff",
    chartGrid: "#e9ecef",
    chartCrosshair: "#6c757d",
    chartBorder: "#dee2e6",

    sma: "#ffc107",
    ema: "#007bff",
    rsi: "#6f42c1",
    macdLine: "#26a69a",
    macdSignal: "#dc3545",
    macdHistogram: "#007bff",

    bullish: "#26a69a",
    bearish: "#ef5350",
  },
};

const darkTheme: Theme = {
  mode: "dark",
  colors: {
    primary: "#131722",
    secondary: "#181c25",
    tertiary: "#23283a",

    text: "#d1d4dc",
    textSecondary: "#868b93",

    accent: "#26a69a",
    accentHover: "#2bbbad",
    border: "#363c4e",

    chartBackground: "#131722",
    chartGrid: "#363c4e",
    chartCrosshair: "#758696",
    chartBorder: "#363c4e",

    sma: "#fbc02d",
    ema: "#1976d2",
    rsi: "#ab47bc",
    macdLine: "#26a69a",
    macdSignal: "#ef5350",
    macdHistogram: "#1976d2",

    bullish: "#26a69a",
    bearish: "#ef5350",
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    return saved ? saved === "dark" : true; // Default to dark mode
  });

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    localStorage.setItem("theme-mode", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
