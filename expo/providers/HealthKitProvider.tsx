import React, { useEffect, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/AuthProvider';

interface HealthData {
  weight?: number;
  waterIntake?: number;
  proteinIntake?: number;
  caloriesIntake?: number;
  caloriesBurned?: number;
  steps?: number;
  sleepHours?: number;
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  bodyFat?: number;
  muscleMass?: number;
  workoutDuration?: number;
  workoutType?: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  notes?: string;
  timestamp: string;
  source: 'manual' | 'healthkit' | 'googlefit';
}

export const [HealthKitProvider, useHealthKit] = createContextHook(() => {
  const { user } = useAuth();
  const [isHealthKitAvailable, setIsHealthKitAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localHealthData, setLocalHealthData] = useState<HealthData | null>(null);

  // Sync health data mutation
  const syncMutation = trpc.health.sync.useMutation({
    onSuccess: () => {
      console.log('Health data synced successfully');
      setLastSyncTime(new Date().toISOString());
      AsyncStorage.setItem('lastHealthSyncTime', new Date().toISOString());
    },
    onError: (error) => {
      console.error('Failed to sync health data:', error);
      Alert.alert('Sync Failed', 'Failed to sync health data. Please try again.');
    },
  });

  // Get health data query
  const healthDataQuery = trpc.health.get.useQuery(
    { userId: user?.id || '', type: 'latest' },
    { enabled: !!user?.id }
  );

  // Check HealthKit availability (iOS only)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // In a real app, you would check HealthKit availability here
      // For now, we'll simulate it
      setIsHealthKitAvailable(true);
      checkAuthorization();
    }
  }, []);

  // Load last sync time
  useEffect(() => {
    AsyncStorage.getItem('lastHealthSyncTime').then((time) => {
      if (time) setLastSyncTime(time);
    });
  }, []);

  const checkAuthorization = async () => {
    // In a real app, check HealthKit authorization
    // For now, we'll simulate it
    const authStatus = await AsyncStorage.getItem('healthKitAuthorized');
    setIsAuthorized(authStatus === 'true');
  };

  const requestAuthorization = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'HealthKit is only available on iOS devices');
      return false;
    }

    // In a real app, request HealthKit permissions here
    // For now, we'll simulate it
    Alert.alert(
      'HealthKit Access',
      'This app would like to access your health data to track your fitness progress.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Allow',
          onPress: async () => {
            await AsyncStorage.setItem('healthKitAuthorized', 'true');
            setIsAuthorized(true);
          },
        },
      ]
    );

    return true;
  };

  const syncHealthData = useCallback(async (data?: HealthData) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to sync health data');
      return;
    }

    setIsSyncing(true);

    try {
      const healthData = data || localHealthData || {
        timestamp: new Date().toISOString(),
        source: Platform.OS === 'ios' ? 'healthkit' : 'manual',
      };

      await syncMutation.mutateAsync({
        userId: user.id,
        data: healthData as any,
      });

      // Clear local data after successful sync
      setLocalHealthData(null);
      await AsyncStorage.removeItem('pendingHealthData');
    } catch (error) {
      console.error('Sync error:', error);
      // Save to local storage for retry
      if (data || localHealthData) {
        await AsyncStorage.setItem('pendingHealthData', JSON.stringify(data || localHealthData));
      }
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, localHealthData, syncMutation]);

  const updateHealthData = useCallback(async (updates: Partial<HealthData>) => {
    const newData: HealthData = {
      ...localHealthData,
      ...updates,
      timestamp: new Date().toISOString(),
      source: Platform.OS === 'ios' && isAuthorized ? 'healthkit' : 'manual',
    };

    setLocalHealthData(newData);

    // Auto-sync if online
    if (user?.id) {
      await syncHealthData(newData);
    } else {
      // Save locally for later sync
      await AsyncStorage.setItem('pendingHealthData', JSON.stringify(newData));
    }
  }, [localHealthData, isAuthorized, user?.id, syncHealthData]);

  const fetchFromHealthKit = useCallback(async () => {
    if (!isHealthKitAvailable || !isAuthorized) {
      Alert.alert('HealthKit Not Available', 'Please enable HealthKit access in settings');
      return;
    }

    // In a real app, fetch data from HealthKit here
    // For now, we'll simulate it with mock data
    const mockHealthData: HealthData = {
      weight: 75.5,
      steps: 8500,
      caloriesBurned: 450,
      heartRate: 72,
      sleepHours: 7.5,
      timestamp: new Date().toISOString(),
      source: 'healthkit',
    };

    await updateHealthData(mockHealthData);
  }, [isHealthKitAvailable, isAuthorized, updateHealthData]);

  // Auto-sync pending data on login
  useEffect(() => {
    if (user?.id) {
      AsyncStorage.getItem('pendingHealthData').then(async (data) => {
        if (data) {
          const pendingData = JSON.parse(data);
          await syncHealthData(pendingData);
        }
      });
    }
  }, [user?.id]);

  // Periodic sync (every 30 minutes)
  useEffect(() => {
    if (isAuthorized && user?.id) {
      const interval = setInterval(() => {
        fetchFromHealthKit();
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthorized, user?.id, fetchFromHealthKit]);

  return {
    isHealthKitAvailable,
    isAuthorized,
    requestAuthorization,
    syncHealthData,
    updateHealthData,
    fetchFromHealthKit,
    lastSyncTime,
    isSyncing,
    localHealthData,
    cloudHealthData: healthDataQuery.data?.data,
    isLoading: healthDataQuery.isLoading,
    refetch: healthDataQuery.refetch,
  };
});