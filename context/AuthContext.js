import React, { createContext, useState, useContext, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HARDCODED_USERNAME, HARDCODED_PASSWORD, STORAGE_KEYS } from "../constants/constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Check authentication status by retrieving the token from AsyncStorage.
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      setIsSignedIn(!!token);
    } catch (error) {
      console.error("Error in checkAuthStatus", error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Sign in function: validates credentials, stores a token, and updates state.
  const signIn = async (username, password) => {
    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'real-auth-token');
        setIsSignedIn(true);
      } catch (error) {
        console.error("Error in signIn", error);
      }
    } else {
      Alert.alert("Login Failed", "Invalid Credential");
    }
  };

  // Sign out function: removes the token and updates state.
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setIsSignedIn(false);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Correctly use AuthContext here.
export const useAuth = () => useContext(AuthContext);
