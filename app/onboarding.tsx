import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, User, Target, Activity } from 'lucide-react-native';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    height: '',
    weight: '',
    goals: '',
    experience: '',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      router.replace('/(tabs)');
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
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
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
              numberOfLines={6}
              value={formData.goals}
              onChangeText={(text) => setFormData({ ...formData, goals: text })}
            />
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
          {[1, 2, 3].map((i) => (
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
            style={styles.nextButton}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Get Started' : 'Next'}
              </Text>
              <ChevronRight size={20} color="#001F3F" />
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
});