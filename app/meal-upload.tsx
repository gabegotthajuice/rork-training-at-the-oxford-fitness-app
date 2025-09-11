import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Camera,
  Upload,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Info,
  Sparkles
} from 'lucide-react-native';
import { useClient } from '@/providers/ClientProvider';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCloudSync } from '@/providers/CloudSyncProvider';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MealUploadScreen() {
  const { clientData, addMealEntry, getTodayMealCount } = useClient();
  const { syncMealToCloud } = useCloudSync();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  
  const logMealMutation = trpc.oxford.logMeal.useMutation();
  
  const getMealTag = (): "B" | "L" | "D" | "S" => {
    const hour = new Date().getHours();
    if (hour < 10) return "B"; // Breakfast
    if (hour < 15) return "L"; // Lunch
    if (hour < 20) return "D"; // Dinner
    return "S"; // Snack
  };
  
  React.useEffect(() => {
    loadClientId();
  }, []);
  
  const loadClientId = async () => {
    try {
      const storedClientId = await AsyncStorage.getItem('oxford:clientId');
      if (storedClientId) {
        setClientId(storedClientId);
      } else {
        // Generate a client ID if none exists
        const newClientId = `client_${Date.now()}`;
        await AsyncStorage.setItem('oxford:clientId', newClientId);
        setClientId(newClientId);
      }
    } catch (error) {
      console.error('Error loading client ID:', error);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera/gallery permissions to upload meals.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].base64!);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      // Call AI API to analyze the meal
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert analyzing meals for a fitness program. 
                Analyze the meal image and provide:
                1. Compliance score (0-100) based on healthy eating guidelines
                2. Estimated nutritional values (calories, protein, carbs, fats)
                3. Brief analysis of the meal
                4. Whether it's compliant with a healthy diet program
                
                Return response as JSON:
                {
                  "complianceScore": number,
                  "nutritionalValue": {
                    "calories": number,
                    "protein": number,
                    "carbs": number,
                    "fats": number
                  },
                  "analysis": "brief description",
                  "isCompliant": boolean,
                  "suggestions": "improvement suggestions"
                }`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Please analyze this meal for nutritional value and diet compliance.' },
                { type: 'image', image: base64Image }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      // Safely parse the completion - it might already be an object or a string
      let analysisData;
      if (typeof data.completion === 'string') {
        try {
          analysisData = JSON.parse(data.completion);
        } catch (e) {
          console.error('Error parsing AI response:', e);
          // Fallback to a default structure if parsing fails
          analysisData = {
            complianceScore: 0,
            isCompliant: false,
            nutritionalValue: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fats: 0
            },
            analysis: data.completion || 'Unable to analyze meal',
            recommendations: []
          };
        }
      } else if (typeof data.completion === 'object' && data.completion !== null) {
        // Already an object, use as is
        analysisData = data.completion;
      } else {
        // Fallback for unexpected data types
        console.warn('Unexpected completion type:', typeof data.completion);
        analysisData = {
          complianceScore: 0,
          isCompliant: false,
          nutritionalValue: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
          },
          analysis: 'Unable to analyze meal',
          recommendations: []
        };
      }
      
      setAnalysisResult(analysisData);
      
      // Save meal entry locally
      const mealEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        imageUri: selectedImage!,
        complianceScore: analysisData.complianceScore,
        nutritionalValue: analysisData.nutritionalValue,
        aiAnalysis: analysisData.analysis,
        isCompliant: analysisData.isCompliant,
      };
      
      addMealEntry(mealEntry);
      
      // Sync to cloud for trainer
      await syncMealToCloud(mealEntry);
      
      // Also log to Oxford system if client ID is available
      if (clientId) {
        try {
          await logMealMutation.mutateAsync({
            client_id: clientId,
            date: new Date().toISOString().split('T')[0],
            meal_tag: getMealTag(),
            notes: analysisData.analysis || '',
            photo_base64: base64Image
          });
          
          console.log('Meal logged to Oxford system successfully');
        } catch (oxfordError) {
          console.error('Error logging to Oxford system:', oxfordError);
          // Don't fail the whole process if Oxford logging fails
        }
      }
      
    } catch (error) {
      console.error('Error analyzing meal:', error);
      Alert.alert('Analysis Failed', 'Unable to analyze the meal. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Upload Meal',
          headerStyle: { backgroundColor: '#001F3F' },
          headerTintColor: '#FFD700',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#FFD700" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!selectedImage ? (
            <>
              {/* Upload Options */}
              <View style={styles.uploadSection}>
                <View style={styles.headerSection}>
                  <Sparkles size={32} color="#FFD700" />
                  <Text style={styles.title}>AI-Powered Meal Analysis</Text>
                  <Text style={styles.subtitle}>
                    Upload your meal for instant nutritional analysis and diet compliance scoring
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.uploadCard}
                  onPress={() => pickImage(true)}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.uploadGradient}
                  >
                    <Camera size={40} color="#001F3F" />
                    <Text style={styles.uploadTitle}>Take Photo</Text>
                    <Text style={styles.uploadDescription}>
                      Capture your meal directly
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadCard}
                  onPress={() => pickImage(false)}
                >
                  <View style={styles.uploadCardContent}>
                    <Upload size={40} color="#FFD700" />
                    <Text style={styles.uploadTitleAlt}>Choose from Gallery</Text>
                    <Text style={styles.uploadDescriptionAlt}>
                      Select an existing photo
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Info Card */}
                <View style={styles.infoCard}>
                  <Info size={20} color="#4A90E2" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>How it works</Text>
                    <Text style={styles.infoText}>
                      • Take a clear photo of your meal{'\n'}
                      • AI analyzes nutritional content{'\n'}
                      • Get instant compliance score{'\n'}
                      • Track your daily meal count{'\n'}
                      • Your trainer reviews all meals
                    </Text>
                  </View>
                </View>

                {/* Today's Stats */}
                <View style={styles.statsCard}>
                  <Text style={styles.statsTitle}>Today&apos;s Meals</Text>
                  <Text style={styles.statsValue}>{getTodayMealCount()}</Text>
                  <Text style={styles.statsLabel}>meals uploaded</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Analysis Results */}
              <View style={styles.resultsSection}>
                <Image source={{ uri: selectedImage }} style={styles.mealImage} />
                
                {isAnalyzing ? (
                  <View style={styles.analyzingCard}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.analyzingText}>Analyzing your meal...</Text>
                  </View>
                ) : analysisResult ? (
                  <>
                    {/* Compliance Score */}
                    <View style={styles.scoreCard}>
                      <View style={styles.scoreHeader}>
                        {analysisResult.isCompliant ? (
                          <CheckCircle size={32} color="#10B981" />
                        ) : (
                          <XCircle size={32} color="#EF4444" />
                        )}
                        <Text style={styles.scoreTitle}>Compliance Score</Text>
                      </View>
                      <Text style={[
                        styles.scoreValue,
                        { color: analysisResult.complianceScore >= 70 ? '#10B981' : '#EF4444' }
                      ]}>
                        {analysisResult.complianceScore}%
                      </Text>
                      <View style={styles.scoreBar}>
                        <View 
                          style={[
                            styles.scoreFill,
                            { 
                              width: `${analysisResult.complianceScore}%`,
                              backgroundColor: analysisResult.complianceScore >= 70 ? '#10B981' : '#EF4444'
                            }
                          ]} 
                        />
                      </View>
                    </View>

                    {/* Nutritional Values */}
                    <View style={styles.nutritionCard}>
                      <Text style={styles.nutritionTitle}>Nutritional Breakdown</Text>
                      <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>
                            {analysisResult.nutritionalValue.calories}
                          </Text>
                          <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>
                            {analysisResult.nutritionalValue.protein}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Protein</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>
                            {analysisResult.nutritionalValue.carbs}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Carbs</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>
                            {analysisResult.nutritionalValue.fats}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Fats</Text>
                        </View>
                      </View>
                    </View>

                    {/* AI Analysis */}
                    <View style={styles.analysisCard}>
                      <Text style={styles.analysisTitle}>AI Analysis</Text>
                      <Text style={styles.analysisText}>{analysisResult.analysis}</Text>
                      {analysisResult.suggestions && (
                        <>
                          <Text style={styles.suggestionTitle}>Suggestions</Text>
                          <Text style={styles.suggestionText}>{analysisResult.suggestions}</Text>
                        </>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={() => router.back()}
                      >
                        <Text style={styles.primaryButtonText}>Done</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={resetUpload}
                      >
                        <Text style={styles.secondaryButtonText}>Upload Another</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : null}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  uploadSection: {
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  uploadCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadGradient: {
    padding: 30,
    alignItems: 'center',
  },
  uploadCardContent: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginTop: 15,
  },
  uploadTitleAlt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginTop: 15,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#001F3F',
    marginTop: 5,
    opacity: 0.8,
  },
  uploadDescriptionAlt: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#001F3F',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  statsLabel: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 5,
  },
  resultsSection: {
    padding: 20,
  },
  mealImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    marginBottom: 20,
  },
  analyzingCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 16,
    color: '#001F3F',
    marginTop: 15,
  },
  scoreCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginLeft: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  nutritionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  analysisCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginTop: 15,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerButton: {
    marginLeft: 10,
  },
});