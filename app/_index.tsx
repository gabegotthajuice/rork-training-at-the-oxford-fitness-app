import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppMode } from '@/providers/AppModeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';

export default function RootIndex() {
  const router = useRouter();
  const { appMode, isLoading: modeLoading } = useAppMode();
  const { 
    isAuthenticated, 
    isLoading: authLoading, 
    user, 
    hasCompletedOnboarding, 
    hasCompletedProfileSetup 
  } = useAuth();

  useEffect(() => {
    if (!authLoading && !modeLoading) {
      if (!isAuthenticated) {
        // Not authenticated - go to auth screen
        router.replace('/auth');
      } else if (user?.role === 'trainer') {
        // Trainer - go to trainer dashboard
        router.replace('/(trainer)/clients');
      } else if (user?.role === 'client') {
        // Client flow - check onboarding and profile setup
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
        } else if (!hasCompletedProfileSetup) {
          router.replace('/profile-setup');
        } else if (appMode === 'client') {
          router.replace('/(tabs)');
        } else {
          router.replace('/mode-selection');
        }
      } else {
        router.replace('/mode-selection');
      }
    }
  }, [
    appMode, 
    authLoading, 
    modeLoading, 
    isAuthenticated, 
    user, 
    hasCompletedOnboarding, 
    hasCompletedProfileSetup, 
    router
  ]);

  return (
    <LinearGradient
      colors={['#001F3F', '#003366', '#004080']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Sparkles size={80} color="#FFD700" />
        </View>
        <Text style={styles.title}>REPS</Text>
        <Text style={styles.subtitle}>Elite Performance System</Text>
        <ActivityIndicator 
          size="large" 
          color="#FFD700" 
          style={styles.loader} 
        />
        <Text style={styles.loadingText}>Loading your experience...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 6,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8899AA',
    letterSpacing: 2,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#8899AA',
    marginTop: 15,
    textAlign: 'center',
  },
});