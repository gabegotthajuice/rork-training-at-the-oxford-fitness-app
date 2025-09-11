import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Save, User, Target, Activity, Heart } from 'lucide-react-native';
import { useClient } from '@/providers/ClientProvider';
import { useCloudSync } from '@/providers/CloudSyncProvider';

export default function ClientInputScreen() {
  const router = useRouter();
  const { clientData, updateDailyMetrics } = useClient();
  const { syncData, isOnline } = useCloudSync();

  const [formData, setFormData] = useState({
    // Personal Info
    name: clientData.name || '',
    height: clientData.identity?.height || '',
    currentWeight: clientData.identity?.currentWeight?.toString() || '',
    bodyType: clientData.identity?.bodyType || '',
    
    // Daily Metrics
    water: clientData.dailyMetrics?.water?.toString() || '',
    sleep: clientData.dailyMetrics?.sleep?.toString() || '',
    meals: clientData.dailyMetrics?.meals?.toString() || '',
    calories: clientData.dailyMetrics?.calories?.toString() || '',
    
    // Goals
    goals: clientData.identity?.goals?.join('\n') || '',
    lifestyleNotes: clientData.identity?.lifestyleNotes || '',
  });

  const handleSave = async () => {
    try {
      // Update daily metrics
      updateDailyMetrics({
        water: parseInt(formData.water) || 0,
        sleep: parseInt(formData.sleep) || 0,
        meals: parseInt(formData.meals) || 0,
        calories: parseInt(formData.calories) || 0,
      });

      // Sync with cloud if online
      if (isOnline) {
        await syncData();
        Alert.alert('Success', 'Your data has been saved and synced with your trainer!');
      } else {
        Alert.alert('Saved Locally', 'Your data has been saved. It will sync when you\'re back online.');
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Your Information</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#666" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height</Text>
              <TextInput
                style={styles.input}
                value={formData.height}
                onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                placeholder="e.g., 5'10"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={formData.currentWeight}
                onChangeText={(text) => setFormData(prev => ({ ...prev, currentWeight: text }))}
                placeholder="Enter weight"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Body Type</Text>
              <TextInput
                style={styles.input}
                value={formData.bodyType}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bodyType: text }))}
                placeholder="e.g., Mesomorph, Ectomorph, Endomorph"
              />
            </View>
          </View>

          {/* Daily Metrics Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Activity size={20} color="#666" />
              <Text style={styles.sectionTitle}>Today's Metrics</Text>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.label}>Water (oz)</Text>
                <TextInput
                  style={styles.metricInput}
                  value={formData.water}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, water: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.label}>Sleep (hrs)</Text>
                <TextInput
                  style={styles.metricInput}
                  value={formData.sleep}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, sleep: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.label}>Meals</Text>
                <TextInput
                  style={styles.metricInput}
                  value={formData.meals}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, meals: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.metricInput}
                  value={formData.calories}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, calories: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Goals Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#666" />
              <Text style={styles.sectionTitle}>Goals & Notes</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Goals (one per line)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.goals}
                onChangeText={(text) => setFormData(prev => ({ ...prev, goals: text }))}
                placeholder="Enter your fitness goals..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lifestyle Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.lifestyleNotes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lifestyleNotes: text }))}
                placeholder="Any important notes for your trainer..."
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Sync Status */}
          <View style={styles.syncStatus}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#FFA726' }]} />
            <Text style={styles.syncText}>
              {isOnline ? 'Connected - Changes will sync automatically' : 'Offline - Changes will sync when connected'}
            </Text>
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  metricItem: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  metricInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
    textAlign: 'center',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  syncText: {
    fontSize: 12,
    color: '#666',
  },
});