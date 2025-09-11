import React, { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface SyncStatus {
  lastSync: string | null;
  isSyncing: boolean;
  error: string | null;
  pendingChanges: number;
}

interface CloudData {
  clientId: string;
  trainerId?: string;
  data: any;
  timestamp: string;
  version: number;
}

const SYNC_API_URL = 'https://toolkit.rork.com/text/llm/';
const IMAGE_API_URL = 'https://toolkit.rork.com/images/generate/';
const STT_API_URL = 'https://toolkit.rork.com/stt/transcribe/';

export const [CloudSyncProvider, useCloudSync] = createContextHook(() => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    isSyncing: false,
    error: null,
    pendingChanges: 0,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (Platform.OS === 'web') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      syncData();
    }
  }, [isOnline, syncQueue]);

  const generateClientId = async () => {
    let clientId = await AsyncStorage.getItem('clientId');
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('clientId', clientId);
    }
    return clientId;
  };

  const syncData = async () => {
    if (!isOnline || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const clientId = await generateClientId();
      const localData = await AsyncStorage.getItem('clientData');
      const authToken = await AsyncStorage.getItem('authToken');
      const trainerId = await AsyncStorage.getItem('trainerId');

      // Parse local data safely
      let parsedData = {};
      if (localData) {
        try {
          parsedData = typeof localData === 'string' ? JSON.parse(localData) : localData;
        } catch (e) {
          console.warn('Could not parse localData, using empty object');
          parsedData = {};
        }
      }

      // Sync with backend using AI API
      const response = await fetch(SYNC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'Store and sync client fitness data. Return success confirmation.'
          }, {
            role: 'user',
            content: JSON.stringify({
              action: 'sync',
              clientId,
              trainerId,
              data: parsedData,
              queue: syncQueue,
              timestamp: new Date().toISOString(),
            })
          }]
        }),
      });

      if (!response.ok) throw new Error('Sync failed');

      const result = await response.json();
      console.log('Sync successful:', result);

      const cloudData: CloudData = {
        clientId,
        trainerId: trainerId || undefined,
        data: parsedData,
        timestamp: new Date().toISOString(),
        version: 1,
      };

      // Store sync metadata
      await AsyncStorage.setItem('lastSyncTime', cloudData.timestamp);
      await AsyncStorage.setItem('cloudData', JSON.stringify(cloudData));

      setSyncStatus({
        lastSync: cloudData.timestamp,
        isSyncing: false,
        error: null,
        pendingChanges: 0,
      });

      // Clear sync queue
      setSyncQueue([]);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync data. Will retry when online.',
      }));
    }
  };

  const queueChange = useCallback((change: any) => {
    setSyncQueue(prev => [...prev, { ...change, timestamp: Date.now() }]);
    setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
  }, []);

  const fetchTrainerData = async (trainerId: string) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(SYNC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'Fetch trainer data including clients and sessions. Return structured data.'
          }, {
            role: 'user',
            content: `Get data for trainer: ${trainerId}`
          }]
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch trainer data');

      const data = await response.json();
      
      // Parse and return trainer data
      const trainerData = {
        trainerId,
        clients: [],
        sessions: [],
        lastUpdated: new Date().toISOString(),
      };
      
      return trainerData;
    } catch (error) {
      console.error('Error fetching trainer data:', error);
      throw error;
    }
  };

  const shareDataWithTrainer = async (trainerId: string) => {
    try {
      const clientId = await generateClientId();
      const clientData = await AsyncStorage.getItem('clientData');
      
      // Store trainer association
      await AsyncStorage.setItem('trainerId', trainerId);
      
      // Queue for sync
      // Parse client data safely
      let parsedClientData = {};
      if (clientData) {
        try {
          parsedClientData = typeof clientData === 'string' ? JSON.parse(clientData) : clientData;
        } catch (e) {
          console.warn('Could not parse clientData, using empty object');
          parsedClientData = {};
        }
      }

      queueChange({
        type: 'SHARE_WITH_TRAINER',
        trainerId,
        clientId,
        data: parsedClientData,
      });

      // Trigger sync if online
      if (isOnline) {
        await syncData();
      }

      return true;
    } catch (error) {
      console.error('Error sharing with trainer:', error);
      return false;
    }
  };

  const syncMealToCloud = async (mealEntry: any) => {
    try {
      const clientId = await generateClientId();
      const trainerId = await AsyncStorage.getItem('trainerId');
      
      // Queue meal for sync
      queueChange({
        type: 'MEAL_UPLOAD',
        clientId,
        trainerId,
        meal: mealEntry,
        timestamp: new Date().toISOString(),
      });

      // Store locally for trainer access
      const existingMeals = await AsyncStorage.getItem('cloudMeals');
      let meals = [];
      if (existingMeals) {
        try {
          meals = JSON.parse(existingMeals);
          if (!Array.isArray(meals)) {
            meals = [];
          }
        } catch (e) {
          console.error('Error parsing existing meals:', e);
          meals = [];
        }
      }
      meals.push(mealEntry);
      await AsyncStorage.setItem('cloudMeals', JSON.stringify(meals));

      // Trigger sync if online
      if (isOnline) {
        await syncData();
      }

      return true;
    } catch (error) {
      console.error('Error syncing meal:', error);
      return false;
    }
  };

  const getClientMeals = async (clientId: string) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      // Try to fetch from cloud first
      if (isOnline && authToken) {
        const response = await fetch(SYNC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            messages: [{
              role: 'system',
              content: 'Fetch client meal data. Return meal entries.'
            }, {
              role: 'user',
              content: `Get meals for client: ${clientId}`
            }]
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Store locally for offline access - ensure we're storing a string
          const mealsToStore = data.meals || [];
          await AsyncStorage.setItem('cloudMeals', JSON.stringify(mealsToStore));
          return mealsToStore;
        }
      }
      
      // Fallback to local storage
      const meals = await AsyncStorage.getItem('cloudMeals');
      if (meals) {
        try {
          const parsedMeals = JSON.parse(meals);
          return Array.isArray(parsedMeals) ? parsedMeals : [];
        } catch (e) {
          console.error('Error parsing local meals:', e);
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching client meals:', error);
      return [];
    }
  };

  const analyzeBodyWithAI = async (images: { front: string; side: string; back: string }) => {
    try {
      const response = await fetch(SYNC_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: `Analyze body images for posture, muscle imbalances, and deficiencies. 
              Return JSON with: posture score and issues, muscle imbalances, aesthetic proportions, and recommendations.`
          }, {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze these body images' },
              { type: 'image', image: images.front },
              { type: 'image', image: images.side },
              { type: 'image', image: images.back },
            ]
          }]
        }),
      });

      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('Body analysis error:', error);
      throw error;
    }
  };

  const generateAIWorkout = async (clientData: any) => {
    try {
      const response = await fetch(SYNC_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'Generate personalized workout plan based on client data, goals, and deficiencies.'
          }, {
            role: 'user',
            content: JSON.stringify(clientData)
          }]
        }),
      });

      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('Workout generation error:', error);
      throw error;
    }
  };

  return {
    syncStatus,
    isOnline,
    syncData,
    queueChange,
    fetchTrainerData,
    shareDataWithTrainer,
    syncMealToCloud,
    getClientMeals,
    analyzeBodyWithAI,
    generateAIWorkout,
    pendingChanges: syncQueue.length,
  };
});