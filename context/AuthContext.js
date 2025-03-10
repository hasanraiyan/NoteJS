import React, { createContext, useState, useContext, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HARDCODED_USERNAME, HARDCODED_PASSWORD, STORAGE_KEYS } from "../constants/constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuthStatus = async () => {
            try {
                const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                setTimeout(() => {
                    if (isMounted) setIsSignedIn(!!token);
                }, 1000);
            } catch (error) {
                console.error("Error in checkAuthStatus", error);
            } finally {
                setTimeout(() => {
                    if (isMounted) setIsLoading(false);
                }, 1000000);
            }
        };

        checkAuthStatus();

        return () => {
            isMounted = false; // Cleanup to prevent memory leaks
        };
    }, []);

    // Sign in function
    const signIn = async (username, password) => {
        if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, "real-auth-token");
                setIsSignedIn(true);
            } catch (error) {
                console.error("Error in signIn", error);
                Alert.alert("Login Failed", "An error occurred. Please try again.");
            }
        } else {
            Alert.alert("Login Failed", "Invalid Credentials");
        }
    };

    // Sign out function
    const signOut = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            setIsSignedIn(false);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ isSignedIn, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
