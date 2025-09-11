import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Plus,
  Trophy,
  Calendar,
  Target,
  Activity,
  Edit3
} from 'lucide-react-native';
import { useClient } from '@/providers/ClientProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface PR {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

export default function MetricsScreen() {
  const { clientData, updatePR } = useClient();
  const router = useRouter();
  const [showAddPR, setShowAddPR] = useState(false);
  const [newPR, setNewPR] = useState({
    exercise: '',
    weight: '',
    reps: '',
  });

  const handleAddPR = () => {
    if (newPR.exercise && newPR.weight && newPR.reps) {
      const pr: PR = {
        id: Date.now().toString(),
        exercise: newPR.exercise,
        weight: parseFloat(newPR.weight),
        reps: parseInt(newPR.reps),
        date: new Date().toLocaleDateString(),
      };
      updatePR(pr);
      setNewPR({ exercise: '', weight: '', reps: '' });
      setShowAddPR(false);
    }
  };

  const weeklyCompliance = {
    meals: Math.round((clientData.weeklyMetrics.mealsCompleted / 21) * 100),
    workouts: Math.round((clientData.weeklyMetrics.workoutsCompleted / clientData.weeklyMetrics.workoutsScheduled) * 100),
    sleep: Math.round((clientData.weeklyMetrics.avgSleep / 8) * 100),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Performance Metrics</Text>
            <Text style={styles.headerSubtitle}>Track Your Progress</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/client-input')}
          >
            <Edit3 size={20} color="#001F3F" />
          </TouchableOpacity>
        </View>

        {/* Weekly Compliance */}
        <View style={styles.complianceSection}>
          <Text style={styles.sectionTitle}>Weekly Compliance</Text>
          
          <View style={styles.complianceCard}>
            <View style={styles.complianceItem}>
              <View style={styles.complianceHeader}>
                <Target size={20} color="#10B981" />
                <Text style={styles.complianceLabel}>Meals</Text>
              </View>
              <Text style={styles.complianceValue}>{weeklyCompliance.meals}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${weeklyCompliance.meals}%`, backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.complianceDetail}>{clientData.weeklyMetrics.mealsCompleted}/21 meals</Text>
            </View>

            <View style={styles.complianceItem}>
              <View style={styles.complianceHeader}>
                <Activity size={20} color="#FFD700" />
                <Text style={styles.complianceLabel}>Workouts</Text>
              </View>
              <Text style={styles.complianceValue}>{weeklyCompliance.workouts}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${weeklyCompliance.workouts}%`, backgroundColor: '#FFD700' }]} />
              </View>
              <Text style={styles.complianceDetail}>
                {clientData.weeklyMetrics.workoutsCompleted}/{clientData.weeklyMetrics.workoutsScheduled} sessions
              </Text>
            </View>

            <View style={styles.complianceItem}>
              <View style={styles.complianceHeader}>
                <Calendar size={20} color="#6B46C1" />
                <Text style={styles.complianceLabel}>Sleep</Text>
              </View>
              <Text style={styles.complianceValue}>{weeklyCompliance.sleep}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${weeklyCompliance.sleep}%`, backgroundColor: '#6B46C1' }]} />
              </View>
              <Text style={styles.complianceDetail}>{clientData.weeklyMetrics.avgSleep}h avg</Text>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        <View style={styles.prSection}>
          <View style={styles.prHeader}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddPR(true)}
            >
              <Plus size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {clientData.personalRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Trophy size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No PRs yet</Text>
              <Text style={styles.emptySubtext}>Add your first personal record!</Text>
            </View>
          ) : (
            clientData.personalRecords.map((pr) => (
              <LinearGradient
                key={pr.id}
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.prCard}
              >
                <View style={styles.prContent}>
                  <Trophy size={24} color="#001F3F" />
                  <View style={styles.prDetails}>
                    <Text style={styles.prExercise}>{pr.exercise}</Text>
                    <Text style={styles.prStats}>
                      {pr.weight} lbs × {pr.reps} reps
                    </Text>
                    <Text style={styles.prDate}>{pr.date}</Text>
                  </View>
                </View>
              </LinearGradient>
            ))
          )}
        </View>

        {/* Body Composition */}
        <View style={styles.bodyCompSection}>
          <Text style={styles.sectionTitle}>Body Composition</Text>
          <View style={styles.bodyCompCard}>
            <View style={styles.bodyCompItem}>
              <Text style={styles.bodyCompLabel}>Body Fat</Text>
              <Text style={styles.bodyCompValue}>{clientData.bodyComposition.bodyFat}%</Text>
              <Text style={styles.bodyCompChange}>-2% this month</Text>
            </View>
            <View style={styles.bodyCompDivider} />
            <View style={styles.bodyCompItem}>
              <Text style={styles.bodyCompLabel}>Lean Mass</Text>
              <Text style={styles.bodyCompValue}>{clientData.bodyComposition.leanMass} lbs</Text>
              <Text style={styles.bodyCompChange}>+3 lbs this month</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add PR Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddPR}
        onRequestClose={() => setShowAddPR(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAddPR(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Personal Record</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Exercise name"
              placeholderTextColor="#999"
              value={newPR.exercise}
              onChangeText={(text) => setNewPR({ ...newPR, exercise: text })}
            />
            
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Weight (lbs)"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={newPR.weight}
                onChangeText={(text) => setNewPR({ ...newPR, weight: text })}
              />
              
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Reps"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={newPR.reps}
                onChangeText={(text) => setNewPR({ ...newPR, reps: text })}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddPR(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddPR}
              >
                <Text style={styles.saveButtonText}>Save PR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#001F3F',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 15,
  },
  complianceSection: {
    padding: 20,
  },
  complianceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  complianceItem: {
    marginBottom: 20,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginLeft: 8,
  },
  complianceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  complianceDetail: {
    fontSize: 12,
    color: '#999',
  },
  prSection: {
    padding: 20,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#001F3F',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  prContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prDetails: {
    marginLeft: 15,
    flex: 1,
  },
  prExercise: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  prStats: {
    fontSize: 16,
    color: '#001F3F',
    marginTop: 2,
  },
  prDate: {
    fontSize: 12,
    color: '#001F3F',
    opacity: 0.7,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  bodyCompSection: {
    padding: 20,
  },
  bodyCompCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bodyCompItem: {
    alignItems: 'center',
    flex: 1,
  },
  bodyCompLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  bodyCompValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 5,
  },
  bodyCompChange: {
    fontSize: 12,
    color: '#10B981',
  },
  bodyCompDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#001F3F',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#001F3F',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#FFD700',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});