import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem("app_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
      }
    })();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem("app_theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

import { lightColors, darkColors } from "@/app/color/themeConfig";

export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useContext(ThemeContext);
  const colors = theme === "dark" ? darkColors : lightColors;
  return { theme, toggleTheme, setTheme, colors };
};

