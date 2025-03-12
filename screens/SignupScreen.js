import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Text, 
  StatusBar, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = () => {
    if (validateForm()) {
      signUp(username, email, password);
    }
  };

  const InputField = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false,
    toggleVisibility = null,
    isVisible = false,
    error = null
  }) => (
    <View style={styles.inputWrapper}>
      <View style={[
        styles.inputContainer, 
        { borderColor: error ? theme.error : theme.borderColor }
      ]}>
        <Ionicons name={icon} size={20} color={theme.secondaryTextColor} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.textColor }]}
          placeholder={placeholder}
          placeholderTextColor={theme.secondaryTextColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isVisible}
          autoCapitalize={placeholder.includes('Email') ? 'none' : 'sentences'}
          keyboardType={placeholder.includes('Email') ? 'email-address' : 'default'}
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
      {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
            <Image source={require('../assets/images/icon.png')} resizeMode="contain" style={styles.logo} />
          </View>
          <Text style={[styles.headerText, { color: theme.textColor }]}>Create Account</Text>
          <Text style={[styles.subHeaderText, { color: theme.secondaryTextColor }]}>
            Please fill in the form to continue
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
          />
          
          <InputField
            icon="mail-outline"
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <InputField
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            isVisible={passwordVisible}
            toggleVisibility={() => setPasswordVisible(!passwordVisible)}
            error={errors.password}
          />

          <InputField
            icon="shield-checkmark-outline"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            isVisible={confirmPasswordVisible}
            toggleVisibility={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            error={errors.confirmPassword}
          />
        </View>

        {/* Button Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.signupButton, { backgroundColor: theme.primary }]} 
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: theme.secondaryTextColor }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation && navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: theme.primary }]}> Log In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: theme.secondaryTextColor }]}>
            By signing up, you agree to our{' '}
            <Text style={[styles.termsLink, { color: theme.primary }]}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={[styles.termsLink, { color: theme.primary }]}>Privacy Policy</Text>
          </Text>
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
  buttonContainer: {
    marginBottom: 24,
  },
  signupButton: {
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
  signupText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: 'bold',
  }
});

export default SignupScreen;