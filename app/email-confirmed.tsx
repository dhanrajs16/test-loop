import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

export default function EmailConfirmedScreen() {
  useEffect(() => {
    // Redirect to main app after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#10B981', '#14B8A6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <CheckCircle size={80} color="#FFFFFF" />
        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.subtitle}>
          Your account has been successfully verified. You will be redirected to the app shortly.
        </Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
  },
});