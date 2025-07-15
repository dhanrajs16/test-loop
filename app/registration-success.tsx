import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, LogIn } from 'lucide-react-native';

export default function RegistrationSuccessScreen() {
  const handleGoToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient
      colors={['#10B981', '#14B8A6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>Account Created Successfully!</Text>
        <Text style={styles.subtitle}>
          Your account has been created and you can now sign in to access your community.
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleGoToLogin}
        >
          <LogIn size={20} color="#10B981" style={styles.buttonIcon} />
          <Text style={styles.loginButtonText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});