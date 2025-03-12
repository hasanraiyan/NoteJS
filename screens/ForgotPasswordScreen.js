import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Enter a valid email address';
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const handleReset = async () => {
    if (validateForm()) {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessage("A password reset link has been sent to your email.");
        setErrors({});
      } catch (error) {
        setErrors({ general: "Failed to send reset link. Please try again." });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { justifyContent: 'center', alignItems: 'center' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
              <Image
                source={require('../assets/images/icon.png')}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>
            <Text style={[styles.headerText, { color: theme.textColor }]}>
              Forgot Password
            </Text>
            <Text style={[styles.subHeaderText, { color: theme.secondaryTextColor }]}>
              Enter your email address to receive a reset link.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, { borderColor: errors.email ? theme.error : theme.borderColor }]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.secondaryTextColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.textColor }]}
                  placeholder="Email"
                  placeholderTextColor={theme.secondaryTextColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {errors.email}
                </Text>
              )}
            </View>
            {errors.general && (
              <Text style={[styles.errorText, { color: theme.error, textAlign: 'center' }]}>
                {errors.general}
              </Text>
            )}
            {message !== '' && (
              <Text style={[styles.successText, { color: theme.primary, textAlign: 'center', marginVertical: 8 }]}>
                {message}
              </Text>
            )}
          </View>

          {/* Button Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: theme.primary }]}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            </TouchableOpacity>

            <View style={styles.backToLoginContainer}>
              <Text style={[styles.signupText, { color: theme.secondaryTextColor }]}>
                Remember your password?
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={[styles.signupLink, { color: theme.primary }]}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  contentWrapper: {
    width: '100%', // Ensures content spans full width within the centered ScrollView
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  successText: {
    fontSize: 14,
    marginVertical: 8,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  resetButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
