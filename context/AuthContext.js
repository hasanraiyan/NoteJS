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
                }, 1000); // Reduced timeout for faster testing, revert to 1000000 for production if needed
            } catch (error) {
                console.error("Error in checkAuthStatus", error);
            } finally {
                setTimeout(() => {
                    if (isMounted) setIsLoading(false);
                }, 10);
            }
        };

        checkAuthStatus();

        return () => {
            isMounted = false;
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

    const signUp = async (username, password) => {
        if (!username || !password) {
            Alert.alert("Sign Up Failed", "Please enter both username and password.");
            return;
        }

        try {
            // Simulate a successful sign-up by storing a temporary token.
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, "temp-signup-token");
            setIsSignedIn(true);
            Alert.alert("Sign Up Successful", "You have successfully signed up!");
        } catch (error) {
            console.error("Error in signUp", error);
            Alert.alert("Sign Up Failed", "An error occurred during sign up. Please try again.");
        }

    }

    // Forgot Password function (Simulated)
    const forgotPassword = async (email) => {
        if (!email) {
            Alert.alert("Reset Password Failed", "Please enter your email address.");
            return;
        }

        // For demonstration purposes, we'll just simulate sending an email.
        // In a real application, you would integrate with an email service and backend.
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success (you might want to check if the email exists in a real scenario)
                if (email.includes('@')) { // Basic email format check for simulation
                    Alert.alert(
                        "Password Reset Email Sent",
                        `A password reset link has been sent to ${email}. Please check your inbox.`,
                        [{ text: "OK" }]
                    );
                    resolve();
                } else {
                    Alert.alert(
                        "Reset Password Failed",
                        "Invalid email address. Please enter a valid email.",
                        [{ text: "OK" }]
                    );
                    reject(new Error("Invalid email address")); // Reject with an error on "simulated" failure
                }
            }, 1500); // Simulate network delay
        });
    };


    return (
        <AuthContext.Provider value={{ isSignedIn, isLoading, signIn, signOut, signUp, forgotPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);