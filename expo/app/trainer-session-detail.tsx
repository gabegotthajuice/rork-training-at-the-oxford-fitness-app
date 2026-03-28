import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, User, MapPin, Calendar } from 'lucide-react-native';

export default function SessionDetail() {
  const { id } = useLocalSearchParams();

  // Mock session data - in production, fetch based on id
  const session = {
    id,
    clientName: 'John Doe',
    date: 'March 15, 2024',
    time: '9:00 AM - 10:00 AM',
    type: 'Personal Training',
    location: 'Main Gym Floor',
    status: 'Scheduled',
    notes: 'Focus on upper body strength training. Client mentioned shoulder discomfort last session.',
    exercises: [
      'Bench Press - 3x12',
      'Shoulder Press - 3x10',
      'Lat Pulldown - 3x12',
      'Bicep Curls - 3x15',
      'Tricep Extensions - 3x15',
    ],
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Session Details',
          headerStyle: {
            backgroundColor: '#001F3F',
          },
          headerTintColor: '#FFD700',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFD700" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Info Card */}
        <View style={styles.card}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{session.status}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <User size={20} color="#FFD700" />
            <Text style={styles.infoText}>{session.clientName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={20} color="#FFD700" />
            <Text style={styles.infoText}>{session.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={20} color="#FFD700" />
            <Text style={styles.infoText}>{session.time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={20} color="#FFD700" />
            <Text style={styles.infoText}>{session.location}</Text>
          </View>
        </View>

        {/* Session Plan Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Plan</Text>
          <Text style={styles.sessionType}>{session.type}</Text>
          
          <Text style={styles.subTitle}>Exercises:</Text>
          {session.exercises.map((exercise, index) => (
            <View key={`exercise-${index}`} style={styles.exerciseItem}>
              <Text style={styles.exerciseNumber}>{index + 1}.</Text>
              <Text style={styles.exerciseText}>{exercise}</Text>
            </View>
          ))}
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.notesText}>{session.notes}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Start Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Reschedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={styles.cancelButtonText}>Cancel Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#001F3F',
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 10,
    marginTop: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 10,
  },
  exerciseNumber: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginRight: 8,
  },
  exerciseText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#001F3F',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#001F3F',
  },
  secondaryButtonText: {
    color: '#001F3F',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  cancelButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});