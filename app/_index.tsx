import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppMode } from '@/providers/AppModeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootIndex() {
  const router = useRouter();
  const { appMode, isLoading: modeLoading } = useAppMode();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    if (!authLoading && !modeLoading) {
      if (!isAuthenticated) {
        router.replace('/auth');
      } else if (user?.role === 'trainer') {
        router.replace('/(trainer)/clients');
      } else if (user?.role === 'client') {
        if (appMode === 'client') {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } else {
        router.replace('/mode-selection');
      }
    }
  }, [appMode, authLoading, modeLoading, isAuthenticated, user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001F3F',
  },
});