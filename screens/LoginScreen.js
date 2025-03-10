import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = ({ navigation }) => {
    const { signIn } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both username and password.");
            return;
        }
        signIn(username, password, navigation);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={theme.background}
            />
            <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
                <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={[styles.welcomeText, { color: theme.textColor }]}>Welcome back</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { borderBottomColor: theme.borderColor, color: theme.textColor }]}
                    placeholder="Username"
                    placeholderTextColor={theme.secondaryTextColor}
                    value={username}
                    onChangeText={setUsername}
                />

                <View style={[styles.passwordContainer, { borderBottomColor: theme.borderColor }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: theme.textColor }]}
                        placeholder="Password"
                        placeholderTextColor={theme.secondaryTextColor}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Ionicons
                            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                            size={24}
                            color={theme.secondaryTextColor}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={[styles.loginButton, { backgroundColor: theme.primary }]} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
                <Text style={[styles.signupText, { color: theme.secondaryTextColor }]}>
                    Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={[styles.signupLink, { color: theme.primary }]}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    logoContainer: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 50,
        height: 50,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderBottomWidth: 1,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    loginButton: {
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    signupText: {
        fontSize: 16,
    },
    signupLink: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LoginScreen;
