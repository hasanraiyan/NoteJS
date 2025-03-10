import React from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import SplashScreen from "./screens/SplashScreen";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppContent = () => {
  const { theme } = useTheme();
  const { isSignedIn, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignedIn == false ? (
          // No token found, user isn't signed in
          <Stack.Screen
            name="SignIn"
            component={LoginScreen}
            options={{
              headerShown: false
            }}
          />

        ) : (
          // User is signed in
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
