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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, User, Target, Activity, Clock, Utensils } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
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
  });
  
  const submitIntake = trpc.oxford.submitIntake.useMutation();

  const handleNext = async () => {
    if (step < 4) {
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
          start_date: new Date().toISOString().split('T')[0]
        });
        
        // Store profile locally
        await AsyncStorage.setItem('userProfile', JSON.stringify(formData));
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        
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
          {[1, 2, 3, 4].map((i) => (
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
                    {step === 4 ? 'Complete Setup' : 'Next'}
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
});