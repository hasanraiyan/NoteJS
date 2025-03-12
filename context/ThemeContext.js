import React, { createContext, useState, useContext, useEffect } from 'react';
import {  THEME_MODES, STORAGE_KEYS } from '../constants/constants';
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
            primary: '#7885FF',
            primaryDark: '#5A69E6',
            background: '#121212',
            secondaryBackground: '#1E1E1E',
            settingIconBackground: '#272727',
            textColor: '#FFFFFF',
            secondaryTextColor: '#A1A1AA',
            tertiaryTextColor: '#71717A',
            accentColor: '#FF4D4D',
            inactiveColor: '#555555',
            inputBackground: '#252525',
            cardShadow: 'rgba(0, 0, 0, 0.4)',
            borderColor: '#303030',
            shadowColor: '#000000',
            tertiaryTextColor: '#9E9E9E',
            headerBackground: '#121212',
        }
        : {
            primary: '#7885FF',
            primaryDark: '#5A69E6',
            background: '#FFFFFF',
            secondaryBackground: '#F3F7F9',
            settingIconBackground: '#EDE9FE',
            textColor: '#000000',
            secondaryTextColor: '#6B778D',
            tertiaryTextColor: '#A0AEC0',
            accentColor: '#FF4D4D',
            inactiveColor: '#D1D1D1',
            inputBackground: '#F9F9F9',
            cardShadow: 'rgba(0, 0, 0, 0.1)',
            headerBackground: '#FFFFFF' ,
            borderColor: '#E5E5E5',
            shadowColor: '#000000',
            tertiaryTextColor: '#9E9E9E',

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
