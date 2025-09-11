import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppMode } from '@/providers/AppModeProvider';
import { Users, User } from 'lucide-react-native';

export default function ModeSelection() {
  const router = useRouter();
  const { switchToClientMode, switchToTrainerMode } = useAppMode();

  const handleClientMode = async () => {
    // For demo purposes, using mock user data
    await switchToClientMode({
      id: 'client-1',
      name: 'John Doe',
      email: 'john@example.com',
      mode: 'client',
    });
    router.replace('/(tabs)');
  };

  const handleTrainerMode = async () => {
    // For demo purposes, using mock user data
    await switchToTrainerMode({
      id: 'trainer-1',
      name: 'Oxford Trainer',
      email: 'trainer@oxford.com',
      mode: 'trainer',
    });
    router.replace('/(trainer)/clients');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Training at the Oxford</Text>
          <Text style={styles.subtitle}>Select Your Mode</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.modeCard}
            onPress={handleClientMode}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <User size={48} color="#FFD700" />
            </View>
            <Text style={styles.modeTitle}>Client</Text>
            <Text style={styles.modeDescription}>
              Track your fitness journey, view schedules, and monitor progress
            </Text>
            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Enter as Client</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={handleTrainerMode}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Users size={48} color="#FFD700" />
            </View>
            <Text style={styles.modeTitle}>Trainer</Text>
            <Text style={styles.modeDescription}>
              Manage clients, track progress, and schedule sessions
            </Text>
            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Enter as Trainer</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cardsContainer: {
    gap: 20,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#001F3F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#001F3F',
    fontWeight: 'bold',
    fontSize: 16,
  },
});