import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightMode, darkMode, THEME_MODES, STORAGE_KEYS } from '../constants/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');

  // Initialize theme from storage on component mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (storedPreference) {
          setThemePreference(storedPreference);
          if (storedPreference === THEME_MODES.LIGHT) {
            setIsDarkMode(false);
          } else if (storedPreference === THEME_MODES.DARK) {
            setIsDarkMode(true);
          } else {
            // System preference
            setIsDarkMode(deviceTheme === 'dark');
          }
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Update theme when device theme changes if set to system
  useEffect(() => {
    if (themePreference === 'system') {
      setIsDarkMode(deviceTheme === 'dark');
    }
  }, [deviceTheme, themePreference]);

  const setThemeMode = async (mode) => {
    try {
      setThemePreference(mode);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);

      if (mode === 'system') {
        setIsDarkMode(deviceTheme === 'dark');
      } else {
        setIsDarkMode(mode === THEME_MODES.DARK);
      }
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = isDarkMode ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    await setThemeMode(newMode);
  };

  // Enhanced theme with additional properties using constants values
  const theme = isDarkMode
    ? {
        ...darkMode,
        headerBackground: darkMode.background,
        borderColor: '#303030',
        shadowColor: '#000000',
        tertiaryTextColor: '#9E9E9E',
        inactiveColor: darkMode.inactiveColor,
        inputBackground: darkMode.inputBackground,
        cardShadow: darkMode.cardShadow,
      }
    : {
        ...lightMode,
        headerBackground: lightMode.background,
        borderColor: '#E5E5E5',
        shadowColor: '#000000',
        tertiaryTextColor: '#9E9E9E',
        inactiveColor: lightMode.inactiveColor,
        inputBackground: lightMode.inputBackground,
        cardShadow: lightMode.cardShadow,
      };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        themePreference,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
