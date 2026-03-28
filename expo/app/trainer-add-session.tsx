import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';

export default function AddSession() {
  const [formData, setFormData] = useState({
    clientName: '',
    date: '',
    time: '',
    duration: '',
    type: '',
    location: '',
    notes: '',
  });

  const handleSave = () => {
    // In production, save to database
    console.log('Saving session:', formData);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Schedule New Session',
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          
          <Text style={styles.label}>Client Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Select or enter client name"
            placeholderTextColor="#999"
            value={formData.clientName}
            onChangeText={(text) => setFormData({ ...formData, clientName: text })}
          />
          
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#999"
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
          />
          
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 9:00 AM"
            placeholderTextColor="#999"
            value={formData.time}
            onChangeText={(text) => setFormData({ ...formData, time: text })}
          />
          
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 60"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
          />
          
          <Text style={styles.label}>Session Type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Personal Training, Group Class"
            placeholderTextColor="#999"
            value={formData.type}
            onChangeText={(text) => setFormData({ ...formData, type: text })}
          />
          
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Main Gym Floor"
            placeholderTextColor="#999"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
          
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Session plan, exercises, special instructions..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#001F3F" />
          <Text style={styles.saveButtonText}>Schedule Session</Text>
        </TouchableOpacity>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#001F3F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#001F3F',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});