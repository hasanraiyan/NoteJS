import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = () => {
    const { signOut } = useAuth()
    const { theme, isDarkMode } = useTheme()

    signOut()
    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={theme.background}
            />
            <Text>Home Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;
