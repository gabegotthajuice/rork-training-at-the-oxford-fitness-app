import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, User, Calendar, TrendingUp, Camera, Utensils, CheckCircle, XCircle, Activity } from 'lucide-react-native';
import { useCloudSync } from '@/providers/CloudSyncProvider';

export default function ClientDetail() {
  const { id } = useLocalSearchParams();
  const { getClientMeals } = useCloudSync();
  const [clientMeals, setClientMeals] = useState<any[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  // Mock client data - in production, fetch based on id
  const client = {
    id,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    joinDate: 'Jan 15, 2024',
    sessionsCompleted: 12,
    sessionsRemaining: 8,
    nextSession: 'Tomorrow at 9:00 AM',
    goals: 'Build muscle, improve endurance',
    bodyType: 'Mesomorph',
    currentWeight: '180 lbs',
    targetWeight: '175 lbs',
    attendance: '95%',
    startWeight: 185,
    currentWeightNum: 180,
  };

  useEffect(() => {
    loadClientMeals();
  }, []);

  const loadClientMeals = async () => {
    setIsLoadingMeals(true);
    try {
      const meals = await getClientMeals(id as string);
      // Sort meals by date, most recent first
      const sortedMeals = meals.sort((a: any, b: any) => 
        new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      );
      setClientMeals(sortedMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const calculateAverageCompliance = () => {
    if (clientMeals.length === 0) return 0;
    const total = clientMeals.reduce((sum, meal) => sum + meal.complianceScore, 0);
    return Math.round(total / clientMeals.length);
  };

  const getTodayMealCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return clientMeals.filter(meal => meal.date === today).length;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: client.name,
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
        {/* Client Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={20} color="#FFD700" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{client.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{client.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Member Since:</Text>
            <Text style={styles.value}>{client.joinDate}</Text>
          </View>
        </View>

        {/* Training Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color="#FFD700" />
            <Text style={styles.cardTitle}>Training Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sessions Completed:</Text>
            <Text style={styles.value}>{client.sessionsCompleted}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sessions Remaining:</Text>
            <Text style={styles.value}>{client.sessionsRemaining}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Next Session:</Text>
            <Text style={styles.value}>{client.nextSession}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Attendance Rate:</Text>
            <Text style={styles.value}>{client.attendance}</Text>
          </View>
        </View>

        {/* Goals & Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#FFD700" />
            <Text style={styles.cardTitle}>Goals & Progress</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Goals:</Text>
            <Text style={styles.value}>{client.goals}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Body Type:</Text>
            <Text style={styles.value}>{client.bodyType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Starting Weight:</Text>
            <Text style={styles.value}>{client.startWeight} lbs</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Weight:</Text>
            <Text style={styles.value}>{client.currentWeight}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Target Weight:</Text>
            <Text style={styles.value}>{client.targetWeight}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Weight Loss:</Text>
            <Text style={[styles.value, { color: '#10B981', fontWeight: 'bold' }]}>
              {client.startWeight - client.currentWeightNum} lbs
            </Text>
          </View>
        </View>

        {/* Meal Compliance Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Activity size={20} color="#FFD700" />
            <Text style={styles.cardTitle}>Meal Compliance</Text>
          </View>
          <View style={styles.complianceStats}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{getTodayMealCount()}</Text>
              <Text style={styles.statLabel}>Today&apos;s Meals</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: calculateAverageCompliance() >= 70 ? '#10B981' : '#EF4444' }]}>
                {calculateAverageCompliance()}%
              </Text>
              <Text style={styles.statLabel}>Avg Compliance</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{clientMeals.length}</Text>
              <Text style={styles.statLabel}>Total Meals</Text>
            </View>
          </View>
        </View>

        {/* Food Diary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Utensils size={20} color="#FFD700" />
            <Text style={styles.cardTitle}>Food Diary</Text>
          </View>
          
          {isLoadingMeals ? (
            <ActivityIndicator size="large" color="#FFD700" style={{ padding: 20 }} />
          ) : clientMeals.length === 0 ? (
            <Text style={styles.emptyText}>No meals uploaded yet</Text>
          ) : (
            <View>
              {clientMeals.slice(0, 5).map((meal, index) => (
                <TouchableOpacity 
                  key={meal.id} 
                  style={styles.mealItem}
                  onPress={() => setSelectedMeal(selectedMeal?.id === meal.id ? null : meal)}
                >
                  <View style={styles.mealHeader}>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealDate}>
                        {new Date(meal.date).toLocaleDateString()} at {meal.time}
                      </Text>
                      <View style={styles.mealStats}>
                        <Text style={styles.calorieText}>{meal.nutritionalValue.calories} cal</Text>
                        {meal.isCompliant ? (
                          <CheckCircle size={16} color="#10B981" />
                        ) : (
                          <XCircle size={16} color="#EF4444" />
                        )}
                      </View>
                    </View>
                    <View style={[
                      styles.complianceScore,
                      { backgroundColor: meal.complianceScore >= 70 ? '#10B981' : '#EF4444' }
                    ]}>
                      <Text style={styles.scoreText}>{meal.complianceScore}%</Text>
                    </View>
                  </View>
                  
                  {selectedMeal?.id === meal.id && (
                    <View style={styles.mealDetails}>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Protein:</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionalValue.protein}g</Text>
                      </View>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Carbs:</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionalValue.carbs}g</Text>
                      </View>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Fats:</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionalValue.fats}g</Text>
                      </View>
                      <Text style={styles.analysisText}>{meal.aiAnalysis}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              {clientMeals.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All {clientMeals.length} Meals</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Camera size={20} color="#001F3F" />
            <Text style={styles.actionButtonText}>View Progress Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Edit Client Info</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#001F3F',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#001F3F',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  complianceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
  mealItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealDate: {
    fontSize: 14,
    color: '#001F3F',
    fontWeight: '500',
  },
  mealStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  calorieText: {
    fontSize: 12,
    color: '#666',
  },
  complianceScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  nutritionValue: {
    fontSize: 12,
    color: '#001F3F',
    fontWeight: '500',
  },
  analysisText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  viewAllButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
});