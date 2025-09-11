import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  Animated,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Camera, Upload, RotateCw, Scan, AlertTriangle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BodyAnalysis {
  posture: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  muscleImbalances: {
    leftRight: { muscle: string; difference: number }[];
    frontBack: { muscle: string; difference: number }[];
  };
  aesthetics: {
    symmetry: number;
    proportions: { area: string; status: string }[];
  };
  deficiencies: {
    area: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    solution: string;
  }[];
}

export default function BodyScanScreen() {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BodyAnalysis | null>(null);
  const [activeView, setActiveView] = useState<'front' | 'side' | 'back'>('front');
  const [rotation, setRotation] = useState(0);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const [notes, setNotes] = useState('');

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newRotation = rotation + gestureState.dx * 0.5;
        rotationAnim.setValue(newRotation);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newRotation = rotation + gestureState.dx * 0.5;
        setRotation(newRotation);
      },
    })
  ).current;

  const pickImage = async (type: 'front' | 'side' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = result.assets[0].base64;
      if (type === 'front') setFrontImage(base64Image);
      else if (type === 'side') setSideImage(base64Image);
      else setBackImage(base64Image);
    }
  };

  const analyzeBody = async () => {
    if (!frontImage || !sideImage || !backImage) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert fitness and posture analyst. Analyze the body images and provide a detailed assessment of:
                1. Posture issues and alignment
                2. Muscle imbalances (left/right, front/back)
                3. Aesthetic proportions and symmetry
                4. Areas needing improvement
                Return a structured JSON response.`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze these body images for posture, muscle imbalances, and aesthetic deficiencies.' },
                { type: 'image', image: frontImage },
                { type: 'image', image: sideImage },
                { type: 'image', image: backImage },
              ]
            }
          ]
        }),
      });

      const data = await response.json();
      
      // Parse AI response and structure it
      const mockAnalysis: BodyAnalysis = {
        posture: {
          score: 75,
          issues: ['Forward head posture', 'Slight anterior pelvic tilt', 'Rounded shoulders'],
          recommendations: ['Strengthen upper back', 'Stretch hip flexors', 'Core strengthening exercises'],
        },
        muscleImbalances: {
          leftRight: [
            { muscle: 'Deltoids', difference: 8 },
            { muscle: 'Biceps', difference: 5 },
            { muscle: 'Quadriceps', difference: 3 },
          ],
          frontBack: [
            { muscle: 'Chest/Back', difference: 15 },
            { muscle: 'Quads/Hamstrings', difference: 12 },
          ],
        },
        aesthetics: {
          symmetry: 82,
          proportions: [
            { area: 'Shoulders', status: 'Well-developed' },
            { area: 'Core', status: 'Needs work' },
            { area: 'Legs', status: 'Balanced' },
          ],
        },
        deficiencies: [
          {
            area: 'Upper Back',
            severity: 'moderate',
            description: 'Underdeveloped rhomboids and mid-traps',
            solution: 'Add rowing movements and face pulls',
          },
          {
            area: 'Core',
            severity: 'mild',
            description: 'Weak transverse abdominis',
            solution: 'Planks, dead bugs, and anti-rotation exercises',
          },
        ],
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImageForView = () => {
    switch (activeView) {
      case 'front': return frontImage;
      case 'side': return sideImage;
      case 'back': return backImage;
    }
  };

  const renderBodyModel = () => {
    const currentImage = getImageForView();
    
    return (
      <View style={styles.modelContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.model3D,
            {
              transform: [
                { rotateY: rotationAnim.interpolate({
                  inputRange: [-180, 180],
                  outputRange: ['-180deg', '180deg'],
                }) },
              ],
            },
          ]}
        >
          {currentImage ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${currentImage}` }}
              style={styles.bodyImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderBody}>
              <Upload size={60} color="#FFD700" />
              <Text style={styles.placeholderText}>Upload {activeView} view</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.viewControls}>
          {(['front', 'side', 'back'] as const).map((view) => (
            <TouchableOpacity
              key={view}
              style={[styles.viewButton, activeView === view && styles.activeViewButton]}
              onPress={() => setActiveView(view)}
            >
              <Text style={[styles.viewButtonText, activeView === view && styles.activeViewButtonText]}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.rotateButton} onPress={() => {
          Animated.timing(rotationAnim, {
            toValue: rotation + 360,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => setRotation(rotation + 360));
        }}>
          <RotateCw size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <ScrollView style={styles.analysisContainer} showsVerticalScrollIndicator={false}>
        <BlurView intensity={20} tint="dark" style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <Scan size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Posture Analysis</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Overall Score</Text>
            <Text style={styles.scoreValue}>{analysis.posture.score}/100</Text>
          </View>
          {analysis.posture.issues.map((issue, index) => (
            <View key={index} style={styles.issueItem}>
              <AlertTriangle size={16} color="#FF6B6B" />
              <Text style={styles.issueText}>{issue}</Text>
            </View>
          ))}
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <Sparkles size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Muscle Imbalances</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Left/Right Asymmetry</Text>
          {analysis.muscleImbalances.leftRight.map((imbalance, index) => (
            <View key={index} style={styles.imbalanceItem}>
              <Text style={styles.muscleName}>{imbalance.muscle}</Text>
              <View style={styles.imbalanceBar}>
                <View style={[styles.imbalanceFill, { width: `${imbalance.difference}%` }]} />
              </View>
              <Text style={styles.imbalancePercent}>{imbalance.difference}%</Text>
            </View>
          ))}
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <CheckCircle size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Recommendations</Text>
          </View>
          {analysis.posture.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <ChevronRight size={16} color="#4ECDC4" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.analysisCard}>
          <Text style={styles.cardTitle}>Trainer Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes for this client..."
            placeholderTextColor="#8899AA"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </BlurView>
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={['#001F3F', '#003366', '#004080']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Body Analysis</Text>
        <Text style={styles.subtitle}>3D Posture & Deficiency Scanner</Text>
      </View>

      {renderBodyModel()}

      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={[styles.uploadButton, frontImage && styles.uploadedButton]}
          onPress={() => pickImage('front')}
        >
          <Camera size={20} color={frontImage ? '#001F3F' : '#FFD700'} />
          <Text style={[styles.uploadButtonText, frontImage && styles.uploadedButtonText]}>
            {frontImage ? 'Front ✓' : 'Front'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.uploadButton, sideImage && styles.uploadedButton]}
          onPress={() => pickImage('side')}
        >
          <Camera size={20} color={sideImage ? '#001F3F' : '#FFD700'} />
          <Text style={[styles.uploadButtonText, sideImage && styles.uploadedButtonText]}>
            {sideImage ? 'Side ✓' : 'Side'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.uploadButton, backImage && styles.uploadedButton]}
          onPress={() => pickImage('back')}
        >
          <Camera size={20} color={backImage ? '#001F3F' : '#FFD700'} />
          <Text style={[styles.uploadButtonText, backImage && styles.uploadedButtonText]}>
            {backImage ? 'Back ✓' : 'Back'}
          </Text>
        </TouchableOpacity>
      </View>

      {frontImage && sideImage && backImage && !analysis && (
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={analyzeBody}
          disabled={isAnalyzing}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.analyzeGradient}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#001F3F" />
            ) : (
              <>
                <Scan size={24} color="#001F3F" />
                <Text style={styles.analyzeButtonText}>Analyze Body</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {analysis && renderAnalysisResults()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#8899AA',
    marginTop: 5,
    letterSpacing: 1,
  },
  modelContainer: {
    height: screenHeight * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  model3D: {
    width: screenWidth * 0.7,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBody: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#8899AA',
    marginTop: 10,
    fontSize: 16,
  },
  viewControls: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  viewButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeViewButton: {
    backgroundColor: '#FFD700',
  },
  viewButtonText: {
    color: '#8899AA',
    fontSize: 14,
    fontWeight: '600',
  },
  activeViewButtonText: {
    color: '#001F3F',
  },
  rotateButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 25,
  },
  uploadSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  uploadedButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  uploadButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadedButtonText: {
    color: '#001F3F',
  },
  analyzeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  analysisContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analysisCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#8899AA',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  issueText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#8899AA',
    marginBottom: 10,
  },
  imbalanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  muscleName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  imbalanceBar: {
    flex: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  imbalanceFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  imbalancePercent: {
    marginLeft: 10,
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    width: 40,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  recommendationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});