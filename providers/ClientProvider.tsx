import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface DailyMetrics {
  water: number;
  weight: number;
  sleep: number;
  meals: number;
  calories: number;
}

interface WeightEntry {
  date: string;
  weight: number;
}

interface MealEntry {
  id: string;
  date: string;
  time: string;
  imageUri: string;
  complianceScore: number;
  nutritionalValue: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  aiAnalysis: string;
  isCompliant: boolean;
}

interface WeeklyMetrics {
  mealsCompleted: number;
  workoutsCompleted: number;
  workoutsScheduled: number;
  avgSleep: number;
}

interface BodyComposition {
  bodyFat: number;
  leanMass: number;
  totalWeight: number;
}

interface PR {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

interface Identity {
  bodyType: string;
  description: string;
  height: string;
  startingWeight: number;
  currentWeight: number;
  goals: string[];
  trainingFocus: Array<{
    area: string;
    description: string;
  }>;
  lifestyleNotes: string;
}

interface ClientData {
  name: string;
  memberSince: string;
  progressionScore: number;
  sessionsRemaining: number;
  dailyMetrics: DailyMetrics;
  weeklyMetrics: WeeklyMetrics;
  bodyComposition: BodyComposition;
  personalRecords: PR[];
  identity: Identity;
  weightHistory: WeightEntry[];
  mealHistory: MealEntry[];
  todayMealCount: number;
  programStartDate: string;
  targetWeightLossPerWeek: number;
}

const generateWeightHistory = () => {
  const history: WeightEntry[] = [];
  const startDate = new Date('2024-10-01');
  const today = new Date();
  let currentWeight = 185;
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 7)) {
    currentWeight -= Math.random() * 1.5 + 0.5;
    history.push({
      date: d.toISOString().split('T')[0],
      weight: Math.round(currentWeight * 10) / 10
    });
  }
  
  return history;
};

const defaultClientData: ClientData = {
  name: 'John Smith',
  memberSince: 'November 2024',
  progressionScore: 78,
  sessionsRemaining: 8,
  dailyMetrics: {
    water: 32,
    weight: 0,
    sleep: 7,
    meals: 2,
    calories: 1800,
  },
  weeklyMetrics: {
    mealsCompleted: 18,
    workoutsCompleted: 3,
    workoutsScheduled: 4,
    avgSleep: 7.5,
  },
  bodyComposition: {
    bodyFat: 18,
    leanMass: 145,
    totalWeight: 175,
  },
  personalRecords: [],
  identity: {
    bodyType: 'Mesomorph',
    description: 'Naturally athletic build with good muscle development potential. Responds well to both strength and conditioning work.',
    height: "5'10\"",
    startingWeight: 185,
    currentWeight: 175,
    goals: [
      'Reduce body fat to 15%',
      'Increase lean muscle mass',
      'Improve cardiovascular endurance',
      'Develop consistent training habits',
    ],
    trainingFocus: [
      {
        area: 'Strength Training',
        description: 'Progressive overload on compound movements with focus on form and control',
      },
      {
        area: 'Nutrition',
        description: 'High protein diet with balanced macros, emphasis on whole foods',
      },
      {
        area: 'Recovery',
        description: 'Prioritize 8 hours sleep and active recovery days',
      },
    ],
    lifestyleNotes: 'Works long hours in office setting. Tends to skip breakfast. Previous lower back injury requires careful monitoring during deadlifts and squats. Responds well to morning training sessions.',
  },
  weightHistory: generateWeightHistory(),
  mealHistory: [],
  todayMealCount: 0,
  programStartDate: '2024-10-01',
  targetWeightLossPerWeek: 1.5,
};

export const [ClientProvider, useClient] = createContextHook(() => {
  const [clientData, setClientData] = useState<ClientData>(defaultClientData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      const stored = await AsyncStorage.getItem('clientData');
      if (stored) {
        try {
          // Safely parse data
          let parsedData: ClientData;
          if (typeof stored === 'string') {
            parsedData = JSON.parse(stored);
          } else {
            console.warn('Unexpected non-string clientData from AsyncStorage');
            parsedData = stored as ClientData;
          }
          // Ensure mealHistory exists
          if (!parsedData.mealHistory) {
            parsedData.mealHistory = [];
          }
          // Ensure todayMealCount exists
          if (parsedData.todayMealCount === undefined) {
            parsedData.todayMealCount = 0;
          }
          setClientData(parsedData);
        } catch (parseError) {
          console.error('Error parsing client data, using default:', parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem('clientData');
          setClientData(defaultClientData);
        }
      } else {
        setClientData(defaultClientData);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
      setClientData(defaultClientData);
    } finally {
      setIsLoading(false);
    }
  };

  const saveClientData = async (data: ClientData) => {
    try {
      await AsyncStorage.setItem('clientData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving client data:', error);
    }
  };

  const updateDailyMetrics = (metrics: Partial<DailyMetrics>) => {
    const updated = {
      ...clientData,
      dailyMetrics: {
        ...clientData.dailyMetrics,
        ...metrics,
      },
    };
    setClientData(updated);
    saveClientData(updated);
  };

  const updatePR = (pr: PR) => {
    const updated = {
      ...clientData,
      personalRecords: [...clientData.personalRecords, pr],
    };
    setClientData(updated);
    saveClientData(updated);
  };

  const updateProgressionScore = () => {
    // Calculate progression score based on various metrics
    const mealCompliance = (clientData.weeklyMetrics.mealsCompleted / 21) * 100;
    const workoutCompliance = (clientData.weeklyMetrics.workoutsCompleted / clientData.weeklyMetrics.workoutsScheduled) * 100;
    const sleepCompliance = (clientData.weeklyMetrics.avgSleep / 8) * 100;
    
    const score = Math.round((mealCompliance + workoutCompliance + sleepCompliance) / 3);
    
    const updated = {
      ...clientData,
      progressionScore: Math.min(score, 100),
    };
    setClientData(updated);
    saveClientData(updated);
  };

  const addWeightEntry = (weight: number) => {
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = clientData.weightHistory.findIndex(entry => entry.date === today);
    
    let newHistory = [...clientData.weightHistory];
    if (existingIndex >= 0) {
      newHistory[existingIndex] = { date: today, weight };
    } else {
      newHistory.push({ date: today, weight });
      newHistory.sort((a, b) => a.date.localeCompare(b.date));
    }
    
    const updated = {
      ...clientData,
      weightHistory: newHistory,
      identity: {
        ...clientData.identity,
        currentWeight: weight,
      },
    };
    setClientData(updated);
    saveClientData(updated);
  };

  const addMealEntry = (meal: MealEntry) => {
    const today = new Date().toISOString().split('T')[0];
    const currentMealHistory = clientData.mealHistory || [];
    const todayMeals = currentMealHistory.filter(m => m.date === today);
    
    const updated = {
      ...clientData,
      mealHistory: [...currentMealHistory, meal],
      todayMealCount: todayMeals.length + 1,
    };
    setClientData(updated);
    saveClientData(updated);
  };

  const getTodayMealCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return (clientData.mealHistory || []).filter(m => m.date === today).length;
  };

  return {
    clientData,
    isLoading,
    updateDailyMetrics,
    updatePR,
    updateProgressionScore,
    addWeightEntry,
    addMealEntry,
    getTodayMealCount,
  };
});