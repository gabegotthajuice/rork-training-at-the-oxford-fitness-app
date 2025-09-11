import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Calendar, Target, Activity, Heart } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/AuthProvider';
import { useHealthKit } from '@/providers/HealthKitProvider';

export default function ProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const { requestAuthorization, isHealthKitAvailable } = useHealthKit();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    fitnessGoals: [] as string[],
    medicalConditions: [] as string[],
    trainerId: '',
  });

  const createProfileMutation = trpc.profiles.create.useMutation({
    onSuccess: async () => {
      // Request HealthKit access after profile creation
      if (Platform.OS === 'ios' && isHealthKitAvailable) {
        await requestAuthorization();
      }
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('Profile creation failed:', error);
    },
  });

  const fitnessGoalOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Improve Endurance',
    'Increase Strength',
    'Better Health',
    'Athletic Performance',
    'Body Recomposition',
    'Flexibility',
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      await createProfileMutation.mutateAsync({
        userId: user.id,
        userType: 'client',
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        height: profileData.height ? parseFloat(profileData.height) : undefined,
        targetWeight: profileData.targetWeight ? parseFloat(profileData.targetWeight) : undefined,
        fitnessGoals: profileData.fitnessGoals,
        medicalConditions: profileData.medicalConditions,
        trainerId: profileData.trainerId || undefined,
      });
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <User size={48} color="#007AFF" />
            </View>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepDescription}>Let's start with your basic details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={profileData.firstName}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={profileData.lastName}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={profileData.phone}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (MM/DD/YYYY)"
              value={profileData.dateOfBirth}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, dateOfBirth: text }))}
            />
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <Activity size={48} color="#007AFF" />
            </View>
            <Text style={styles.stepTitle}>Physical Stats</Text>
            <Text style={styles.stepDescription}>Help us understand your current fitness level</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              value={profileData.height}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, height: text }))}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Current Weight (kg)"
              value={profileData.currentWeight}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, currentWeight: text }))}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Target Weight (kg)"
              value={profileData.targetWeight}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, targetWeight: text }))}
              keyboardType="numeric"
            />
          </View>
        );
        
      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <Target size={48} color="#007AFF" />
            </View>
            <Text style={styles.stepTitle}>Fitness Goals</Text>
            <Text style={styles.stepDescription}>What would you like to achieve?</Text>
            
            <View style={styles.goalsContainer}>
              {fitnessGoalOptions.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalChip,
                    profileData.fitnessGoals.includes(goal) && styles.goalChipSelected,
                  ]}
                  onPress={() => toggleGoal(goal)}
                >
                  <Text
                    style={[
                      styles.goalChipText,
                      profileData.fitnessGoals.includes(goal) && styles.goalChipTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <Heart size={48} color="#007AFF" />
            </View>
            <Text style={styles.stepTitle}>Health Information</Text>
            <Text style={styles.stepDescription}>Any medical conditions we should know about?</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Medical conditions or injuries (optional)"
              value={profileData.medicalConditions.join(', ')}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                medicalConditions: text ? text.split(',').map(s => s.trim()) : []
              }))}
              multiline
              numberOfLines={4}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Trainer ID (optional)"
              value={profileData.trainerId}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, trainerId: text }))}
            />
            
            {Platform.OS === 'ios' && (
              <View style={styles.healthKitInfo}>
                <Text style={styles.healthKitText}>
                  We'll request access to Apple Health to automatically sync your fitness data
                </Text>
              </View>
            )}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Step {step} of 4</Text>
          </View>
          
          {renderStep()}
          
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleBack}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonTextPrimary}>
                  {step === 4 ? 'Complete Setup' : 'Next'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  goalChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  goalChipText: {
    fontSize: 14,
    color: '#666',
  },
  goalChipTextSelected: {
    color: '#FFFFFF',
  },
  healthKitInfo: {
    width: '100%',
    padding: 16,
    backgroundColor: '#E8F2FF',
    borderRadius: 12,
    marginTop: 20,
  },
  healthKitText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});