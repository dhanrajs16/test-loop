import { useEffect } from 'react';
import { router } from 'expo-router';
import LoadingScreen from '../components/LoadingScreen';

export default function IndexScreen() {
  useEffect(() => {
    let isMounted = true;
    
    // Check if user is authenticated
    const isAuthenticated = false; // TODO: Check authentication state with Supabase
    
    // Add a small delay to ensure the Root Layout is mounted
    const timer = setTimeout(() => {
      if (isMounted) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return <LoadingScreen />;
}