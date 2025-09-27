import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, User, Target, Activity, Clock, Utensils, Droplets, Moon, TrendingUp, Smartphone, Link2 } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/AuthProvider';
import { useHealthKit } from '@/providers/HealthKitProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const { isHealthKitAvailable, isAuthorized, requestAuthorization } = useHealthKit();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    height: '',
    weight: '',
    goals: '',
    experience: '',
    plan: 'basic',
    calories_target: 2000,
    protein_target: 150,
    breakfast_time: '08:00',
    lunch_time: '12:00',
    dinner_time: '18:00',
    // New fields for comprehensive intake
    sleep_hours: 8,
    water_intake_oz: 64,
    activity_level: 'moderate',
    medical_conditions: '',
    medications: '',
    allergies: '',
    preferred_workout_time: 'morning',
    workout_frequency: 3,
    stress_level: 'medium',
    body_fat_percentage: '',
    target_weight: '',
    timeline_weeks: 12,
  });
  
  const submitIntake = trpc.oxford.submitIntake.useMutation();

  const handleNext = async () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      // Submit intake form
      setIsSubmitting(true);
      try {
        // Generate client ID
        const clientId = `client_${Date.now()}`;
        await AsyncStorage.setItem('clientId', clientId);
        
        // Submit to Oxford intake
        await submitIntake.mutateAsync({
          client_id: clientId,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          goals: formData.goals,
          plan: formData.plan,
          calories_target: formData.calories_target,
          protein_target: formData.protein_target,
          breakfast_time: formData.breakfast_time,
          lunch_time: formData.lunch_time,
          dinner_time: formData.dinner_time,
          sleep_hours: formData.sleep_hours,
          water_intake_oz: formData.water_intake_oz,
          activity_level: formData.activity_level,
          medical_conditions: formData.medical_conditions,
          medications: formData.medications,
          allergies: formData.allergies,
          preferred_workout_time: formData.preferred_workout_time,
          workout_frequency: formData.workout_frequency,
          stress_level: formData.stress_level,
          body_fat_percentage: formData.body_fat_percentage,
          target_weight: formData.target_weight,
          timeline_weeks: formData.timeline_weeks,
          start_date: new Date().toISOString().split('T')[0]
        });
        
        // Store profile locally
        await AsyncStorage.setItem('userProfile', JSON.stringify(formData));
        await completeOnboarding();
        
        // Navigate to main app
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Onboarding error:', error);
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <User size={48} color="#FFD700" />
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.stepDescription}>
              {"Let's start with some basic information"}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={formData.first_name}
              onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={formData.last_name}
              onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Activity size={48} color="#FFD700" />
            <Text style={styles.stepTitle}>Physical Profile</Text>
            <Text style={styles.stepDescription}>
              Help us understand your current fitness level
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Height (e.g., 5'10'')"
              placeholderTextColor="#999"
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Current Weight (lbs)"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Training Experience"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={formData.experience}
              onChangeText={(text) => setFormData({ ...formData, experience: text })}
            />
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Target size={48} color="#FFD700" />
            <Text style={styles.stepTitle}>Your Goals</Text>
            <Text style={styles.stepDescription}>
              What do you want to achieve?
            </Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your fitness goals..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={formData.goals}
              onChangeText={(text) => setFormData({ ...formData, goals: text })}
            />
            
            <View style={styles.targetSection}>
              <Text style={styles.sectionLabel}>Daily Targets</Text>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Calories:</Text>
                <TextInput
                  style={styles.targetInput}
                  placeholder="2000"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={String(formData.calories_target)}
                  onChangeText={(text) => setFormData({ ...formData, calories_target: parseInt(text) || 2000 })}
                />
              </View>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Protein (g):</Text>
                <TextInput
                  style={styles.targetInput}
                  placeholder="150"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={String(formData.protein_target)}
                  onChangeText={(text) => setFormData({ ...formData, protein_target: parseInt(text) || 150 })}
                />
              </View>
            </View>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContent}>
            <Utensils size={48} color="#FFD700" />
            <Text style={styles.stepTitle}>Meal Schedule</Text>
            <Text style={styles.stepDescription}>
              When do you typically eat your meals?
            </Text>
            
            <View style={styles.mealTimeSection}>
              <View style={styles.mealTimeRow}>
                <Clock size={20} color="#666" />
                <Text style={styles.mealLabel}>Breakfast:</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="08:00"
                  placeholderTextColor="#999"
                  value={formData.breakfast_time}
                  onChangeText={(text) => setFormData({ ...formData, breakfast_time: text })}
                />
              </View>
              
              <View style={styles.mealTimeRow}>
                <Clock size={20} color="#666" />
                <Text style={styles.mealLabel}>Lunch:</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="12:00"
                  placeholderTextColor="#999"
                  value={formData.lunch_time}
                  onChangeText={(text) => setFormData({ ...formData, lunch_time: text })}
                />
              </View>
              
              <View style={styles.mealTimeRow}>
                <Clock size={20} color="#666" />
                <Text style={styles.mealLabel}>Dinner:</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="18:00"
                  placeholderTextColor="#999"
                  value={formData.dinner_time}
                  onChangeText={(text) => setFormData({ ...formData, dinner_time: text })}
                />
              </View>
            </View>
          </View>
        );
      
      case 5:
        return (
          <View style={styles.stepContent}>
            <Droplets size={48} color="#FFD700" />
            <Text style={styles.stepTitle}>Daily Habits</Text>
            <Text style={styles.stepDescription}>
              Tell us about your daily routine
            </Text>
            
            <View style={styles.habitSection}>
              <View style={styles.habitRow}>
                <Moon size={20} color="#666" />
                <Text style={styles.habitLabel}>Sleep Hours:</Text>
                <TextInput
                  style={styles.habitInput}
                  placeholder="8"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={String(formData.sleep_hours)}
                  onChangeText={(text) => setFormData({ ...formData, sleep_hours: parseInt(text) || 8 })}
                />
              </View>
              
              <View style={styles.habitRow}>
                <Droplets size={20} color="#666" />
                <Text style={styles.habitLabel}>Water Intake (oz):</Text>
                <TextInput
                  style={styles.habitInput}
                  placeholder="64"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={String(formData.water_intake_oz)}
                  onChangeText={(text) => setFormData({ ...formData, water_intake_oz: parseInt(text) || 64 })}
                />
              </View>
              
              <View style={styles.habitRow}>
                <Activity size={20} color="#666" />
                <Text style={styles.habitLabel}>Activity Level:</Text>
                <View style={styles.activityButtons}>
                  {['low', 'moderate', 'high'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.activityButton,
                        formData.activity_level === level && styles.activityButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, activity_level: level })}
                    >
                      <Text style={[
                        styles.activityButtonText,
                        formData.activity_level === level && styles.activityButtonTextActive
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.habitRow}>
                <Clock size={20} color="#666" />
                <Text style={styles.habitLabel}>Preferred Workout Time:</Text>
                <View style={styles.activityButtons}>
                  {['morning', 'afternoon', 'evening'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.activityButton,
                        formData.preferred_workout_time === time && styles.activityButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, preferred_workout_time: time })}
                    >
                      <Text style={[
                        styles.activityButtonText,
                        formData.preferred_workout_time === time && styles.activityButtonTextActive
                      ]}>
                        {time.charAt(0).toUpperCase() + time.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.habitRow}>
                <TrendingUp size={20} color="#666" />
                <Text style={styles.habitLabel}>Workouts per Week:</Text>
                <TextInput
                  style={styles.habitInput}
                  placeholder="3"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={String(formData.workout_frequency)}
                  onChangeText={(text) => setFormData({ ...formData, workout_frequency: parseInt(text) || 3 })}
                />
              </View>
            </View>
          </View>
        );
      
      case 6:
        return (
          <View style={styles.stepContent}>
            <Target size={48} color="#FFD700" />
            <Text style={styles.stepTitle}>Health & Progress</Text>
            <Text style={styles.stepDescription}>
              Help us track your progress effectively
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Target Weight (lbs)"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={formData.target_weight}
              onChangeText={(text) => setFormData({ ...formData, target_weight: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Body Fat % (if known)"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={formData.body_fat_percentage}
              onChangeText={(text) => setFormData({ ...formData, body_fat_percentage: text })}
            />
            
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Timeline (weeks):</Text>
              <TextInput
                style={styles.targetInput}
                placeholder="12"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={String(formData.timeline_weeks)}
                onChangeText={(text) => setFormData({ ...formData, timeline_weeks: parseInt(text) || 12 })}
              />
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Medical conditions or injuries..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={formData.medical_conditions}
              onChangeText={(text) => setFormData({ ...formData, medical_conditions: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Current medications..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={formData.medications}
              onChangeText={(text) => setFormData({ ...formData, medications: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Food allergies or dietary restrictions"
              placeholderTextColor="#999"
              value={formData.allergies}
              onChangeText={(text) => setFormData({ ...formData, allergies: text })}
            />
            
            <View style={styles.stressSection}>
              <Text style={styles.sectionLabel}>Current Stress Level</Text>
              <View style={styles.stressButtons}>
                {['low', 'medium', 'high'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.stressButton,
                      formData.stress_level === level && styles.stressButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, stress_level: level })}
                  >
                    <Text style={[
                      styles.stressButtonText,
                      formData.stress_level === level && styles.stressButtonTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      
      case 7:
        return (
          <View style={styles.stepContent}>
            <Smartphone size={48} color="#FFD700" />
            <Text style={styles.stepTitle}>Device Integration</Text>
            <Text style={styles.stepDescription}>
              Connect health apps, fitness trackers, and smart scales for automatic data sync
            </Text>
            
            <View style={styles.healthIntegrationContainer}>
              <View style={styles.healthBenefits}>
                <View style={styles.benefitItem}>
                  <Smartphone size={20} color="#FF3B30" />
                  <Text style={styles.benefitText}>Apple Health & Google Fit</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Activity size={20} color="#00B0B9" />
                  <Text style={styles.benefitText}>Fitbit & wearable devices</Text>
                </View>
                <View style={styles.benefitItem}>
                  <TrendingUp size={20} color="#9C27B0" />
                  <Text style={styles.benefitText}>StarFit & smart scales</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Activity size={20} color="#0066CC" />
                  <Text style={styles.benefitText}>MyFitnessPal nutrition data</Text>
                </View>
              </View>
              
              {Platform.OS === 'ios' && isHealthKitAvailable ? (
                !isAuthorized ? (
                  <TouchableOpacity 
                    style={styles.healthConnectButton}
                    onPress={requestAuthorization}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#FF453A', '#FF6B6B']}
                      style={styles.healthConnectGradient}
                    >
                      <Link2 size={20} color="#FFFFFF" />
                      <Text style={styles.healthConnectButtonText}>Connect Apple Health</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.healthConnectedContainer}>
                    <View style={styles.healthConnectedIcon}>
                      <Smartphone size={24} color="#00FF00" />
                    </View>
                    <Text style={styles.healthConnectedText}>Apple Health Connected!</Text>
                    <Text style={styles.healthConnectedSubtext}>
                      Your sleep and activity data will sync automatically
                    </Text>
                  </View>
                )
              ) : Platform.OS === 'android' ? (
                <TouchableOpacity 
                  style={[styles.healthConnectButton, { backgroundColor: '#4285F4' }]}
                  onPress={() => console.log('Google Fit integration')}
                  activeOpacity={0.7}
                >
                  <View style={styles.healthConnectGradient}>
                    <Link2 size={20} color="#FFFFFF" />
                    <Text style={styles.healthConnectButtonText}>Connect Google Fit</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.healthUnavailableContainer}>
                  <Text style={styles.healthUnavailableText}>
                    Device integrations will be available after setup
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.moreDevicesButton}
                onPress={() => router.push('/device-integration')}
                activeOpacity={0.7}
              >
                <Text style={styles.moreDevicesText}>View All Device Integrations</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.skipHealthButton}
                onPress={() => setStep(step + 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.skipHealthText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/n1cfm9u43b1y0p0j3jo15' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === step && styles.progressDotActive,
                i < step && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <View style={styles.navigation}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, isSubmitting && styles.disabledButton]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={isSubmitting ? ['#ccc', '#aaa'] : ['#FFD700', '#FFA500']}
              style={styles.nextButtonGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#001F3F" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {step === 7 ? 'Complete Setup' : 'Next'}
                  </Text>
                  <ChevronRight size={20} color="#001F3F" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFD700',
    width: 30,
  },
  progressDotCompleted: {
    backgroundColor: '#FFD700',
  },
  stepContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginTop: 20,
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#001F3F',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 30,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  disabledButton: {
    opacity: 0.7,
  },
  targetSection: {
    width: '100%',
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 15,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  targetLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  targetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#001F3F',
  },
  mealTimeSection: {
    width: '100%',
    marginTop: 20,
  },
  mealTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  mealLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#001F3F',
    textAlign: 'center',
  },
  habitSection: {
    width: '100%',
    marginTop: 20,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  habitLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  habitInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#001F3F',
    textAlign: 'center',
  },
  activityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  activityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  activityButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  activityButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activityButtonTextActive: {
    color: '#001F3F',
    fontWeight: '600',
  },
  stressSection: {
    width: '100%',
    marginTop: 20,
  },
  stressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stressButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  stressButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  stressButtonText: {
    fontSize: 14,
    color: '#666',
  },
  stressButtonTextActive: {
    color: '#001F3F',
    fontWeight: '600',
  },
  healthIntegrationContainer: {
    width: '100%',
    alignItems: 'center',
  },
  healthBenefits: {
    width: '100%',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  healthConnectButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  healthConnectGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  healthConnectButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  healthConnectedContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,255,0,0.1)',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  healthConnectedIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,255,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  healthConnectedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00AA00',
    marginBottom: 8,
  },
  healthConnectedSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  healthUnavailableContainer: {
    padding: 20,
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  healthUnavailableText: {
    fontSize: 14,
    color: '#FF8C00',
    textAlign: 'center',
  },
  skipHealthButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipHealthText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
  moreDevicesButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: 'transparent',
    marginBottom: 10,
    alignItems: 'center',
  },
  moreDevicesText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
});