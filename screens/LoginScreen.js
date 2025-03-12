import React, { useState, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Memoized InputField Component
const InputField = React.memo(({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  toggleVisibility = null,
  isVisible = false,
  error = null,
  theme,
}) => (
  <View style={styles.inputWrapper}>
    <View
      style={[
        styles.inputContainer,
        { borderColor: error ? theme.error : theme.borderColor },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={theme.secondaryTextColor}
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, { color: theme.textColor }]}
        placeholder={placeholder}
        placeholderTextColor={theme.secondaryTextColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isVisible}
        autoCapitalize={placeholder.includes('Username') ? 'none' : 'sentences'}
      />
      {toggleVisibility && (
        <TouchableOpacity onPress={toggleVisibility}>
          <Ionicons
            name={isVisible ? 'eye-off' : 'eye'}
            size={20}
            color={theme.secondaryTextColor}
          />
        </TouchableOpacity>
      )}
    </View>
    {error && (
      <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
    )}
  </View>
));

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = useCallback(() => {
    if (validateForm()) {
      signIn(username, password);
    }
  }, [username, password, signIn]);

  // Memoize the toggle function to avoid recreating it on every render
  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            Welcome Back
          </Text>
          <Text style={[styles.subHeaderText, { color: theme.secondaryTextColor }]}>
            Please sign in to continue
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <InputField
            icon="person-outline"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            theme={theme}
          />

          <InputField
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            isVisible={passwordVisible}
            toggleVisibility={togglePasswordVisibility}
            error={errors.password}
            theme={theme}
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Button Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: theme.secondaryTextColor }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.signupLink, { color: theme.primary }]}>
                {' '}
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Login Section */}
        <View style={styles.socialLoginContainer}>
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
            <Text style={[styles.dividerText, { color: theme.secondaryTextColor }]}>
              Or sign in with
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { borderColor: theme.borderColor }]}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: theme.borderColor }]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color={isDarkMode ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: theme.borderColor }]}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  signupContainer: {
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
  socialLoginContainer: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
