import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Phone, MapPin, Users, Eye, EyeOff } from 'lucide-react-native';

import { signUp } from '@/lib/auth';
import ErrorBanner from '@/components/ui/ErrorBanner';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    pincode: '',
    familySize: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showErrorBanner = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };
  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      showErrorBanner('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showErrorBanner('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      showErrorBanner('Password must be at least 6 characters long');
      return;
    }

    // Trim and normalize email
    const trimmedEmail = formData.email.trim().toLowerCase();
    
    setLoading(true);
    setShowError(false); // Hide any existing errors
    
    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';

      console.log('Registration data:', {
        email: trimmedEmail,
        firstName,
        lastName,
        phone: formData.phone,
        location: formData.address
      });

      const { data, error } = await signUp(trimmedEmail, formData.password, {
        firstName,
        lastName,
        phone: formData.phone,
        location: formData.address,
      });

      console.log('Registration response:', { data, error });

      if (error) {
        let message = error.message;
        if (error.message.includes('User already registered')) {
          message = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Password should be at least')) {
          message = 'Password must be at least 6 characters long';
        } else if (error.message.includes('Invalid email')) {
          message = 'Please enter a valid email address';
        }
        showErrorBanner(message);
        return;
      }

      if (data.user) {
        console.log('Registration successful, redirecting to success page');
        // Registration successful, go to success page
        router.replace('/registration-success');
      }
    } catch (error) {
      console.log('Registration catch error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      showErrorBanner(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#10B981', '#14B8A6', '#22D3EE']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ErrorBanner
            message={errorMessage}
            visible={showError}
            onDismiss={() => setShowError(false)}
            type="error"
          />
          
          <View style={styles.header}>
            <Text style={styles.title}>Join Community</Text>
            <Text style={styles.subtitle}>Create your account with family details</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                onFocus={() => setShowError(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setShowError(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
                onFocus={() => setShowError(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password *"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                onFocus={() => setShowError(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password *"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setShowError(false)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#9CA3AF"
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                multiline
                onFocus={() => setShowError(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                placeholderTextColor="#9CA3AF"
                value={formData.pincode}
                onChangeText={(value) => updateFormData('pincode', value)}
                keyboardType="numeric"
                onFocus={() => setShowError(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Users size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Family Size"
                placeholderTextColor="#9CA3AF"
                value={formData.familySize}
                onChangeText={(value) => updateFormData('familySize', value)}
                keyboardType="numeric"
                onFocus={() => setShowError(false)}
              />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.linksContainer}>
              <Link href="/(auth)/login" style={styles.link}>
                <Text style={styles.linkText}>Already have an account? Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    paddingVertical: 18,
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  passwordInput: {
    paddingRight: 50, // Add space for eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: '100%',
  },
  registerButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    alignItems: 'center',
  },
  link: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  testAccountInfo: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  testAccountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 8,
  },
  testAccountText: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 2,
  },
});