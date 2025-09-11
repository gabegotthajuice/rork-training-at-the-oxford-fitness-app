import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Activity,
  Droplets,
  Flame,
  Moon,
  Heart,
  TrendingUp,
  Smartphone,
  Cloud,
  CheckCircle,
} from 'lucide-react-native';
import { useHealthKit } from '@/providers/HealthKitProvider';
import React from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number | undefined;
  unit: string;
  onUpdate: (value: string) => void;
  color: string;
}

function MetricCard({ icon, title, value, unit, onUpdate, color }: MetricCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');

  const handleSave = () => {
    onUpdate(editValue);
    setIsEditing(false);
  };

  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editValue}
            onChangeText={setEditValue}
            keyboardType="numeric"
            autoFocus
          />
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <CheckCircle size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.valueContainer}>
          <Text style={styles.metricValue}>
            {value || '--'}
          </Text>
          <Text style={styles.metricUnit}>{unit}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HealthSync() {
  const {
    isHealthKitAvailable,
    isAuthorized,
    requestAuthorization,
    syncHealthData,
    updateHealthData,
    fetchFromHealthKit,
    lastSyncTime,
    isSyncing,
    localHealthData,
    cloudHealthData,
    refetch,
  } = useHealthKit();

  const [refreshing, setRefreshing] = useState(false);
  const [manualData, setManualData] = useState({
    weight: '',
    waterIntake: '',
    proteinIntake: '',
    caloriesIntake: '',
    caloriesBurned: '',
    steps: '',
    sleepHours: '',
    heartRate: '',
  });

  useEffect(() => {
    // Load cloud data into manual fields
    if (cloudHealthData) {
      setManualData({
        weight: cloudHealthData.weight?.toString() || '',
        waterIntake: cloudHealthData.waterIntake?.toString() || '',
        proteinIntake: cloudHealthData.proteinIntake?.toString() || '',
        caloriesIntake: cloudHealthData.caloriesIntake?.toString() || '',
        caloriesBurned: cloudHealthData.caloriesBurned?.toString() || '',
        steps: cloudHealthData.steps?.toString() || '',
        sleepHours: cloudHealthData.sleepHours?.toString() || '',
        heartRate: cloudHealthData.heartRate?.toString() || '',
      });
    }
  }, [cloudHealthData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    if (isAuthorized) {
      await fetchFromHealthKit();
    }
    
    await refetch();
    setRefreshing(false);
  };

  const handleMetricUpdate = (metric: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateHealthData({ [metric]: numValue });
      setManualData(prev => ({ ...prev, [metric]: value }));
    }
  };

  const handleManualSync = async () => {
    const dataToSync: any = {};
    
    Object.entries(manualData).forEach(([key, value]) => {
      if (value) {
        dataToSync[key] = parseFloat(value);
      }
    });
    
    if (Object.keys(dataToSync).length > 0) {
      await updateHealthData(dataToSync);
    }
  };

  const formatSyncTime = (time: string | null) => {
    if (!time) return 'Never';
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Health Data Sync',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Sync Status */}
        <View style={styles.syncStatus}>
          <View style={styles.syncStatusHeader}>
            <Cloud size={24} color={isSyncing ? '#FFA500' : '#4CAF50'} />
            <Text style={styles.syncStatusTitle}>
              {isSyncing ? 'Syncing...' : 'Synced to Cloud'}
            </Text>
          </View>
          <Text style={styles.syncStatusTime}>
            Last sync: {formatSyncTime(lastSyncTime)}
          </Text>
        </View>
        
        {/* HealthKit Integration */}
        {Platform.OS === 'ios' && isHealthKitAvailable && (
          <View style={styles.healthKitCard}>
            <View style={styles.healthKitHeader}>
              <Smartphone size={24} color="#FF3B30" />
              <Text style={styles.healthKitTitle}>Apple Health</Text>
            </View>
            
            {isAuthorized ? (
              <TouchableOpacity
                style={styles.healthKitButton}
                onPress={fetchFromHealthKit}
              >
                <Text style={styles.healthKitButtonText}>Sync from Health App</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.healthKitButton, styles.healthKitButtonPrimary]}
                onPress={requestAuthorization}
              >
                <Text style={[styles.healthKitButtonText, styles.healthKitButtonTextPrimary]}>
                  Connect Health App
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Metrics Grid */}
        <Text style={styles.sectionTitle}>Today&apos;s Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <MetricCard
            icon={<TrendingUp size={20} color="#007AFF" />}
            title="Weight"
            value={localHealthData?.weight || cloudHealthData?.weight}
            unit="kg"
            onUpdate={(value) => handleMetricUpdate('weight', value)}
            color="#007AFF"
          />
          
          <MetricCard
            icon={<Droplets size={20} color="#00BCD4" />}
            title="Water"
            value={localHealthData?.waterIntake || cloudHealthData?.waterIntake}
            unit="ml"
            onUpdate={(value) => handleMetricUpdate('waterIntake', value)}
            color="#00BCD4"
          />
          
          <MetricCard
            icon={<Activity size={20} color="#4CAF50" />}
            title="Protein"
            value={localHealthData?.proteinIntake || cloudHealthData?.proteinIntake}
            unit="g"
            onUpdate={(value) => handleMetricUpdate('proteinIntake', value)}
            color="#4CAF50"
          />
          
          <MetricCard
            icon={<Flame size={20} color="#FF9800" />}
            title="Calories In"
            value={localHealthData?.caloriesIntake || cloudHealthData?.caloriesIntake}
            unit="kcal"
            onUpdate={(value) => handleMetricUpdate('caloriesIntake', value)}
            color="#FF9800"
          />
          
          <MetricCard
            icon={<Flame size={20} color="#F44336" />}
            title="Calories Burned"
            value={localHealthData?.caloriesBurned || cloudHealthData?.caloriesBurned}
            unit="kcal"
            onUpdate={(value) => handleMetricUpdate('caloriesBurned', value)}
            color="#F44336"
          />
          
          <MetricCard
            icon={<Activity size={20} color="#9C27B0" />}
            title="Steps"
            value={localHealthData?.steps || cloudHealthData?.steps}
            unit="steps"
            onUpdate={(value) => handleMetricUpdate('steps', value)}
            color="#9C27B0"
          />
          
          <MetricCard
            icon={<Moon size={20} color="#3F51B5" />}
            title="Sleep"
            value={localHealthData?.sleepHours || cloudHealthData?.sleepHours}
            unit="hours"
            onUpdate={(value) => handleMetricUpdate('sleepHours', value)}
            color="#3F51B5"
          />
          
          <MetricCard
            icon={<Heart size={20} color="#E91E63" />}
            title="Heart Rate"
            value={localHealthData?.heartRate || cloudHealthData?.heartRate}
            unit="bpm"
            onUpdate={(value) => handleMetricUpdate('heartRate', value)}
            color="#E91E63"
          />
        </View>
        
        {/* Manual Sync Button */}
        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
          onPress={handleManualSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.syncButtonText}>Sync All Data</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
  },
  syncStatus: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  syncStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  syncStatusTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 32,
  },
  healthKitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  healthKitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  healthKitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  healthKitButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  healthKitButtonPrimary: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  healthKitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  healthKitButtonTextPrimary: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  metricUnit: {
    fontSize: 14,
    color: '#999',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});