import React, { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { APP_INFO } from '../constants/constants';
import { useTheme, isDarkMode } from '../context/ThemeContext';
import { styles } from '../styles/style';

const SplashScreen = ({ navigation }) => {
    const { isSignedIn, isLoading } = useAuth();
    const { theme } = useTheme()
    // useEffect(() => {
    //     // Once loading is done, navigate based on auth status
    //     if (!isLoading) {
    //         navigation.replace(isSignedIn ? 'Home' : 'Login');
    //     }
    // }, [isLoading, isSignedIn, navigation]);

    return (
        <View style={[styles.container, { backgroundColor: theme.primary }]}>
            <StatusBar barStyle={'light-content'} backgroundColor={theme.primary} />
            <Image
                source={require('../assets/images/icon.png')}
                style={styles.splashLogo}
                resizeMode="contain"
            />
        </View>
    );
};



export default SplashScreen;
