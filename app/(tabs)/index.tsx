import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Droplets, 
  Scale, 
  Moon, 
  Utensils,
  Camera,
  TrendingUp,
  Award,
  Settings,
  Users,
  Activity,
  Target,
  Zap,
  Hexagon,
  ChevronRight,
  Sparkles,
  Wifi,
  Link2,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react-native';
import { useClient } from '@/providers/ClientProvider';
import { router } from 'expo-router';
import { useAppMode } from '@/providers/AppModeProvider';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, Polygon } from 'react-native-svg';
import { trpc } from '@/lib/trpc';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DashboardScreen() {
  const { clientData, updateDailyMetrics, addWeightEntry, getTodayMealCount, isLoading } = useClient();
  const { logout } = useAppMode();
  const [waterIntake, setWaterIntake] = useState(0);
  const [weight, setWeight] = useState('');
  const [scaleConnected, setScaleConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Test tRPC connection
  const hiMutation = trpc.example.hi.useMutation();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Pulse animation for key elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Calculate graph data - must be called before any conditional returns or effects
  const graphData = useMemo(() => {
    if (!clientData) return {
      fdaProjection: [],
      clientProjection: [],
      currentWeek: 0,
      startWeight: 0,
      currentWeight: 0,
      projectedWeight: 0
    };
    
    const startDate = new Date(clientData.programStartDate);
    const today = new Date();
    const weeksSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // FDA average weight loss projection (1-2 lbs per week)
    const fdaProjection = [];
    const clientProjection = [];
    const actualData = clientData.weightHistory || [];
    
    // Generate projections
    const startWeight = clientData?.identity?.startingWeight || 185;
    const currentWeight = actualData.length > 0 ? actualData[actualData.length - 1].weight : startWeight;
    const actualWeightLoss = startWeight - currentWeight;
    const actualRate = weeksSinceStart > 0 ? actualWeightLoss / weeksSinceStart : 0;
    
    // Create data points for graph
    const maxWeeks = 24; // Show 6 months
    for (let week = 0; week <= maxWeeks; week++) {
      // FDA projection (1.5 lbs per week average)
      fdaProjection.push({
        week,
        weight: startWeight - (week * 1.5)
      });
      
      // Client projection based on current rate
      if (week <= weeksSinceStart) {
        // Use actual data if available
        const weekDate = new Date(startDate);
        weekDate.setDate(weekDate.getDate() + (week * 7));
        const actualEntry = actualData.find(entry => {
          const entryDate = new Date(entry.date);
          return Math.abs(entryDate.getTime() - weekDate.getTime()) < 3.5 * 24 * 60 * 60 * 1000;
        });
        clientProjection.push({
          week,
          weight: actualEntry ? actualEntry.weight : startWeight - (week * actualRate),
          isActual: true
        });
      } else {
        // Project future based on current rate
        clientProjection.push({
          week,
          weight: currentWeight - ((week - weeksSinceStart) * actualRate),
          isActual: false
        });
      }
    }
    
    return {
      fdaProjection,
      clientProjection,
      currentWeek: weeksSinceStart,
      startWeight,
      currentWeight,
      projectedWeight: currentWeight - ((maxWeeks - weeksSinceStart) * actualRate)
    };
  }, [clientData]);

  // Initialize water intake when clientData is available
  React.useEffect(() => {
    if (clientData?.dailyMetrics?.water) {
      setWaterIntake(clientData.dailyMetrics.water);
    }
  }, [clientData?.dailyMetrics?.water]);

  // Show loading state
  if (isLoading || !clientData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleWaterAdd = () => {
    const newIntake = waterIntake + 8;
    setWaterIntake(newIntake);
    updateDailyMetrics({ water: newIntake });
  };

  const handleWeightSubmit = () => {
    if (weight) {
      const weightValue = parseFloat(weight);
      updateDailyMetrics({ weight: weightValue });
      addWeightEntry(weightValue);
      setWeight('');
    }
  };

  const handleScaleConnect = () => {
    // Simulate connecting to smart scale
    Alert.alert(
      'Connect Smart Scale',
      'Choose your smart scale brand:',
      [
        { 
          text: 'Withings', 
          onPress: () => connectToScale('withings') 
        },
        { 
          text: 'Fitbit Aria', 
          onPress: () => connectToScale('fitbit') 
        },
        { 
          text: 'Garmin Index', 
          onPress: () => connectToScale('garmin') 
        },
        { 
          text: 'Renpho', 
          onPress: () => connectToScale('renpho') 
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const connectToScale = async (brand: string) => {
    setSyncStatus('syncing');
    // Simulate OAuth flow or Bluetooth connection
    setTimeout(() => {
      setScaleConnected(true);
      setSyncStatus('success');
      setLastSyncTime(new Date());
      Alert.alert(
        'Success!',
        `Connected to ${brand} scale. Your weight will now sync automatically.`,
        [{ text: 'OK' }]
      );
      // Auto-sync weight data
      syncWeightData();
    }, 2000);
  };

  const syncWeightData = () => {
    setSyncStatus('syncing');
    // Simulate fetching weight from smart scale API
    setTimeout(() => {
      const simulatedWeight = 175.5; // In production, fetch from scale API
      updateDailyMetrics({ weight: simulatedWeight });
      addWeightEntry(simulatedWeight);
      setSyncStatus('success');
      setLastSyncTime(new Date());
    }, 1500);
  };

  const disconnectScale = () => {
    Alert.alert(
      'Disconnect Scale',
      'Are you sure you want to disconnect your smart scale?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setScaleConnected(false);
            setSyncStatus('idle');
            setLastSyncTime(null);
          }
        }
      ]
    );
  };

  const progressPercentage = clientData?.progressionScore || 0;
  const todayMealCount = getTodayMealCount();

  const handleSwitchMode = () => {
    Alert.alert(
      'Switch to Trainer Mode',
      'Are you sure you want to switch to trainer mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            await logout();
            router.replace('/mode-selection');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Futuristic Background Pattern */}
      <View style={styles.backgroundPattern}>
        <LinearGradient
          colors={['#000000', '#0A0A0A', '#000000']}
          style={StyleSheet.absoluteFillObject}
        />
        {Platform.OS !== 'web' && (
          <View style={styles.gridOverlay}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={[styles.gridLine, { top: i * 50 }]} />
            ))}
            {[...Array(10)].map((_, i) => (
              <View key={i} style={[styles.gridLineVertical, { left: i * 50 }]} />
            ))}
          </View>
        )}
      </View>
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Cyber Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Mode Switch Button */}
            <TouchableOpacity 
              style={styles.modeButton} 
              onPress={handleSwitchMode}
            >
              <LinearGradient
                colors={['#00FFFF', '#0080FF']}
                style={styles.modeButtonGradient}
              >
                <Hexagon size={20} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Holographic Logo Area */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(0,255,255,0.1)', 'rgba(255,0,255,0.1)', 'rgba(0,255,255,0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGlow}
              />
              <Image 
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/n1cfm9u43b1y0p0j3jo15' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* Cyber Welcome Text */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeLabel}>ATHLETE ID</Text>
              <Text style={styles.welcomeText}>{clientData?.name?.toUpperCase() || 'LOADING'}</Text>
              <View style={styles.taglineContainer}>
                <View style={styles.taglineLine} />
                <Text style={styles.tagline}>PROGRESSION PROTOCOL ACTIVE</Text>
                <View style={styles.taglineLine} />
              </View>
            </View>
          </Animated.View>

        {/* Holographic Weight Progress Display */}
        <Animated.View 
          style={[
            styles.graphCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(0,255,255,0.05)', 'rgba(0,0,0,0.9)', 'rgba(255,0,255,0.05)']}
            style={styles.graphGradient}
          >
            <View style={styles.graphHeader}>
              <View style={styles.graphIconContainer}>
                <Zap size={20} color="#00FFFF" />
              </View>
              <Text style={styles.graphTitle}>BIOMETRIC TRAJECTORY</Text>
              <View style={styles.graphStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>LIVE</Text>
              </View>
            </View>
          
          <View style={styles.graphContainer}>
            <Svg height="250" width={screenWidth - 40} viewBox={`0 0 ${screenWidth - 40} 250`}>
              <Defs>
                <SvgGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#00FFFF" stopOpacity="0.4" />
                  <Stop offset="50%" stopColor="#0080FF" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#FF00FF" stopOpacity="0.05" />
                </SvgGradient>
                <SvgGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#00FFFF" stopOpacity="1" />
                  <Stop offset="50%" stopColor="#0080FF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#FF00FF" stopOpacity="1" />
                </SvgGradient>
              </Defs>
              
              {/* Cyber Grid */}
              {[0, 1, 2, 3, 4].map((i) => (
                <Line
                  key={i}
                  x1="30"
                  y1={30 + i * 45}
                  x2={screenWidth - 70}
                  y2={30 + i * 45}
                  stroke="rgba(0,255,255,0.1)"
                  strokeWidth="0.5"
                  strokeDasharray="5,10"
                />
              ))}
              
              {/* Standard Projection Line */}
              {graphData.fdaProjection.length > 0 && (
                <Path
                  d={`M 30 ${30 + (graphData.fdaProjection[0].weight - graphData.startWeight + 20) * 2} ${graphData.fdaProjection.map((point, index) => 
                    `L ${30 + index * ((screenWidth - 100) / 24)} ${30 + (graphData.startWeight - point.weight + 20) * 2}`
                  ).join(' ')}`}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="2,4"
                />
              )}
              
              {/* Neon Progress Line */}
              {graphData.clientProjection.length > 0 && (
                <>
                  {/* Glow effect */}
                  <Path
                    d={`M 30 ${30 + (graphData.clientProjection[0].weight - graphData.startWeight + 20) * 2} ${graphData.clientProjection.map((point, index) => 
                      `L ${30 + index * ((screenWidth - 100) / 24)} ${30 + (graphData.startWeight - point.weight + 20) * 2}`
                    ).join(' ')}`}
                    stroke="url(#lineGradient)"
                    strokeWidth="6"
                    fill="none"
                    opacity="0.3"
                  />
                  <Path
                    d={`M 30 ${30 + (graphData.clientProjection[0].weight - graphData.startWeight + 20) * 2} ${graphData.clientProjection.map((point, index) => 
                      `L ${30 + index * ((screenWidth - 100) / 24)} ${30 + (graphData.startWeight - point.weight + 20) * 2}`
                    ).join(' ')}`}
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    fill="none"
                  />
                </>
              )}
              
              {/* Holographic Area Fill */}
              {graphData.clientProjection.length > 0 && (
                <Path
                  d={`M 30 ${30 + (graphData.clientProjection[0].weight - graphData.startWeight + 20) * 2} ${graphData.clientProjection.map((point, index) => 
                    `L ${30 + index * ((screenWidth - 100) / 24)} ${30 + (graphData.startWeight - point.weight + 20) * 2}`
                  ).join(' ')} L ${screenWidth - 70} 210 L 30 210 Z`}
                  fill="url(#clientGradient)"
                />
              )}
              
              {/* Pulse Marker */}
              {graphData.startWeight > 0 && (
                <>
                  <Circle
                    cx={30 + graphData.currentWeek * ((screenWidth - 100) / 24)}
                    cy={30 + (graphData.startWeight - graphData.currentWeight + 20) * 2}
                    r="12"
                    fill="none"
                    stroke="#00FFFF"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <Circle
                    cx={30 + graphData.currentWeek * ((screenWidth - 100) / 24)}
                    cy={30 + (graphData.startWeight - graphData.currentWeight + 20) * 2}
                    r="8"
                    fill="none"
                    stroke="#00FFFF"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <Circle
                    cx={30 + graphData.currentWeek * ((screenWidth - 100) / 24)}
                    cy={30 + (graphData.startWeight - graphData.currentWeight + 20) * 2}
                    r="4"
                    fill="#00FFFF"
                  />
                </>
              )}
              
              {/* Cyber Labels */}
              <SvgText x="15" y="35" fontSize="8" fill="#00FFFF" textAnchor="end">INIT</SvgText>
              <SvgText x="15" y="215" fontSize="8" fill="#FF00FF" textAnchor="end">TARGET</SvgText>
              <SvgText x={screenWidth - 75} y="240" fontSize="8" fill="#0080FF" textAnchor="end">24W</SvgText>
            </Svg>
          </View>
          
          <View style={styles.graphLegend}>
            <View style={styles.legendItem}>
              <View style={styles.legendIndicator}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              </View>
              <Text style={styles.legendText}>STANDARD</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendIndicator}>
                <View style={[styles.legendDot, { backgroundColor: '#00FFFF' }]} />
              </View>
              <Text style={styles.legendText}>ACTUAL</Text>
            </View>
          </View>
          
          <View style={styles.graphStats}>
            <View style={styles.graphStat}>
              <View style={styles.statHex}>
                <Text style={styles.statValue}>
                  {Math.round((graphData.startWeight - graphData.currentWeight) * 10) / 10}
                </Text>
                <Text style={styles.statUnit}>LBS</Text>
              </View>
              <Text style={styles.statLabel}>ELIMINATED</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.graphStat}>
              <View style={styles.statHex}>
                <Text style={styles.statValue}>
                  {Math.round((graphData.currentWeight - graphData.projectedWeight) * 10) / 10}
                </Text>
                <Text style={styles.statUnit}>LBS</Text>
              </View>
              <Text style={styles.statLabel}>REMAINING</Text>
            </View>
          </View>
          </LinearGradient>
        </Animated.View>

        {/* Cyber Progress Module */}
        <Animated.View 
          style={[
            styles.progressCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(0,255,255,0.1)', 'rgba(0,0,0,0.9)', 'rgba(255,0,255,0.1)']}
            style={styles.progressGradient}
          >
            <View style={styles.progressHeader}>
              <Sparkles size={16} color="#00FFFF" />
              <Text style={styles.progressTitle}>PERFORMANCE INDEX</Text>
            </View>
            
            <View style={styles.progressDisplay}>
              <Text style={styles.progressScore}>{progressPercentage}</Text>
              <Text style={styles.progressPercent}>%</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View 
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` }
                  ]}
                >
                  <LinearGradient
                    colors={['#00FFFF', '#0080FF', '#FF00FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
              </View>
            </View>
            
            <View style={styles.progressMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>OPTIMAL</Text>
                <View style={[styles.metricIndicator, { backgroundColor: '#00FFFF' }]} />
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>TRAJECTORY</Text>
                <View style={[styles.metricIndicator, { backgroundColor: '#0080FF' }]} />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Cyber Action Modules */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/meal-upload')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(0,255,255,0.1)', 'rgba(0,0,0,0.95)']}
              style={styles.actionGradient}
            >
              <View style={styles.actionIcon}>
                <Camera size={24} color="#00FFFF" />
              </View>
              <Text style={styles.actionText}>SCAN MEAL</Text>
              <ChevronRight size={16} color="#00FFFF" style={styles.actionArrow} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/metrics')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255,0,255,0.1)', 'rgba(0,0,0,0.95)']}
              style={styles.actionGradient}
            >
              <View style={styles.actionIcon}>
                <TrendingUp size={24} color="#FF00FF" />
              </View>
              <Text style={styles.actionText}>RECORDS</Text>
              <ChevronRight size={16} color="#FF00FF" style={styles.actionArrow} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Package Renewal Action */}
        <View style={styles.packageActionContainer}>
          <TouchableOpacity 
            style={styles.packageActionCard}
            onPress={() => router.push('/packages')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255,215,0,0.1)', 'rgba(0,0,0,0.95)', 'rgba(255,215,0,0.1)']}
              style={styles.packageActionGradient}
            >
              <View style={styles.packageActionContent}>
                <View style={styles.packageActionIcon}>
                  <Package size={28} color="#FFD700" />
                </View>
                <View style={styles.packageActionTextContainer}>
                  <Text style={styles.packageActionTitle}>TRAINING PACKAGES</Text>
                  <Text style={styles.packageActionSubtitle}>Renew or upgrade your plan</Text>
                </View>
                <ChevronRight size={20} color="#FFD700" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Data Input Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>BIOMETRIC INPUT</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Hydration Module */}
        <View style={styles.trackingCard}>
          <LinearGradient
            colors={['rgba(0,128,255,0.05)', 'rgba(0,0,0,0.95)']}
            style={styles.trackingGradient}
          >
            <View style={styles.trackingHeader}>
              <Droplets size={20} color="#0080FF" />
              <Text style={styles.trackingTitle}>HYDRATION</Text>
              <Text style={styles.trackingStatus}>ACTIVE</Text>
            </View>
            
            <View style={styles.waterDisplay}>
              <View style={styles.waterMetric}>
                <Text style={styles.waterAmount}>{waterIntake}</Text>
                <Text style={styles.waterUnit}>OZ</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleWaterAdd}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#0080FF', '#00FFFF']}
                  style={styles.addButtonGradient}
                >
                  <Text style={styles.addButtonText}>+8</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#0080FF', '#00FFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFillGradient, { width: `${Math.min((waterIntake / 64) * 100, 100)}%` }]}
                />
              </View>
              <Text style={styles.progressLabel}>TARGET: 64 OZ</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Mass Module with Smart Scale Integration */}
        <View style={styles.trackingCard}>
          <LinearGradient
            colors={['rgba(255,0,255,0.05)', 'rgba(0,0,0,0.95)']}
            style={styles.trackingGradient}
          >
            <View style={styles.trackingHeader}>
              <Scale size={20} color="#FF00FF" />
              <Text style={styles.trackingTitle}>BIOMETRIC MASS</Text>
              <View style={styles.syncStatusContainer}>
                {scaleConnected ? (
                  <>
                    <Wifi size={14} color="#00FF00" />
                    <Text style={[styles.trackingStatus, { color: '#00FF00' }]}>SYNCED</Text>
                  </>
                ) : (
                  <Text style={styles.trackingStatus}>MANUAL</Text>
                )}
              </View>
            </View>
            
            {/* Smart Scale Connection */}
            {!scaleConnected ? (
              <TouchableOpacity 
                style={styles.scaleConnectButton}
                onPress={handleScaleConnect}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(0,255,255,0.1)', 'rgba(0,128,255,0.2)']}
                  style={styles.scaleConnectGradient}
                >
                  <Link2 size={20} color="#00FFFF" />
                  <Text style={styles.scaleConnectText}>CONNECT SMART SCALE</Text>
                  <ChevronRight size={16} color="#00FFFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.scaleConnectedContainer}>
                <View style={styles.scaleInfo}>
                  <View style={styles.scaleStatusRow}>
                    <CheckCircle size={18} color="#00FF00" />
                    <Text style={styles.scaleStatusText}>SCALE CONNECTED</Text>
                  </View>
                  {lastSyncTime && (
                    <Text style={styles.lastSyncText}>
                      Last sync: {lastSyncTime.toLocaleTimeString()}
                    </Text>
                  )}
                </View>
                <View style={styles.scaleActions}>
                  <TouchableOpacity 
                    style={styles.syncButton}
                    onPress={syncWeightData}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#00FFFF', '#0080FF']}
                      style={styles.syncButtonGradient}
                    >
                      <Activity size={16} color="#000" />
                      <Text style={styles.syncButtonText}>SYNC</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.disconnectButton}
                    onPress={disconnectScale}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.disconnectText}>DISCONNECT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Manual Input Section */}
            <View style={styles.manualInputSection}>
              <View style={styles.manualHeader}>
                <View style={styles.manualDivider} />
                <Text style={styles.manualLabel}>MANUAL INPUT</Text>
                <View style={styles.manualDivider} />
              </View>
              
              <View style={styles.weightContainer}>
                <TextInput
                  style={styles.weightInput}
                  placeholder="0.0"
                  placeholderTextColor="#333"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.inputUnit}>LBS</Text>
                
                <TouchableOpacity 
                  style={[styles.submitButton, !weight && styles.submitButtonDisabled]}
                  onPress={handleWeightSubmit}
                  disabled={!weight}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={!weight ? ['#333', '#222'] : ['#FF00FF', '#FF0080']}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitButtonText}>LOG</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Body Composition Data (if available from smart scale) */}
            {scaleConnected && (
              <View style={styles.compositionGrid}>
                <View style={styles.compositionItem}>
                  <Text style={styles.compositionValue}>23.5</Text>
                  <Text style={styles.compositionLabel}>BMI</Text>
                </View>
                <View style={styles.compositionDivider} />
                <View style={styles.compositionItem}>
                  <Text style={styles.compositionValue}>18.2%</Text>
                  <Text style={styles.compositionLabel}>BODY FAT</Text>
                </View>
                <View style={styles.compositionDivider} />
                <View style={styles.compositionItem}>
                  <Text style={styles.compositionValue}>42.3%</Text>
                  <Text style={styles.compositionLabel}>MUSCLE</Text>
                </View>
              </View>
            )}
            
            {clientData?.dailyMetrics?.weight > 0 && (
              <View style={styles.currentData}>
                <Text style={styles.currentLabel}>LAST ENTRY</Text>
                <Text style={styles.currentValue}>{clientData.dailyMetrics.weight} LBS</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Metric Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(138,43,226,0.1)', 'rgba(0,0,0,0.95)']}
              style={styles.statGradient}
            >
              <Moon size={18} color="#8A2BE2" />
              <Text style={styles.statValue}>{clientData?.dailyMetrics?.sleep || 0}</Text>
              <Text style={styles.statLabel}>SLEEP HRS</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(0,255,0,0.1)', 'rgba(0,0,0,0.95)']}
              style={styles.statGradient}
            >
              <Utensils size={18} color="#00FF00" />
              <Text style={styles.statValue}>{todayMealCount}</Text>
              <Text style={styles.statLabel}>MEALS</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255,215,0,0.1)', 'rgba(0,0,0,0.95)']}
              style={styles.statGradient}
            >
              <Award size={18} color="#FFD700" />
              <Text style={styles.statValue}>{clientData?.sessionsRemaining || 0}</Text>
              <Text style={styles.statLabel}>SESSIONS</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Backend Test Card */}
        <View style={styles.sessionCard}>
          <LinearGradient
            colors={['rgba(0,255,0,0.1)', 'rgba(0,0,0,0.95)', 'rgba(0,255,0,0.1)']}
            style={styles.sessionGradient}
          >
            <View style={styles.sessionHeader}>
              <View style={[styles.sessionIndicator, { backgroundColor: '#00FF00' }]} />
              <Text style={[styles.sessionTitle, { color: '#00FF00' }]}>BACKEND STATUS</Text>
            </View>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={() => hiMutation.mutate({ name: 'Athlete' })}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#00FF00', '#00AA00']}
                style={styles.testButtonGradient}
              >
                <Text style={styles.testButtonText}>TEST CONNECTION</Text>
              </LinearGradient>
            </TouchableOpacity>
            {hiMutation.data && (
              <View style={styles.testResult}>
                <Text style={styles.testResultText}>
                  {hiMutation.data.hello} - {new Date(hiMutation.data.date).toLocaleTimeString()}
                </Text>
              </View>
            )}
            {hiMutation.error && (
              <View style={styles.testError}>
                <Text style={styles.testErrorText}>Connection failed</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Next Protocol Card */}
        <View style={styles.sessionCard}>
          <LinearGradient
            colors={['rgba(0,255,255,0.2)', 'rgba(0,0,0,0.95)', 'rgba(255,0,255,0.2)']}
            style={styles.sessionGradient}
          >
            <View style={styles.sessionHeader}>
              <View style={styles.sessionIndicator} />
              <Text style={styles.sessionTitle}>NEXT PROTOCOL</Text>
            </View>
            <Text style={styles.sessionTime}>TOMORROW // 06:00</Text>
            <View style={styles.sessionDivider} />
            <Text style={styles.sessionType}>UPPER BODY ENHANCEMENT</Text>
          </LinearGradient>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.03)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,255,255,0.03)',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  modeButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  modeButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.5,
  },

  logo: {
    width: 100,
    height: 100,
    zIndex: 1,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 10,
    color: '#00FFFF',
    letterSpacing: 3,
    marginBottom: 5,
    fontWeight: '300',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 10,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: '#00FFFF',
    opacity: 0.5,
  },
  tagline: {
    fontSize: 10,
    color: '#00FFFF',
    letterSpacing: 2,
    fontWeight: '300',
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  progressGradient: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '300',
    letterSpacing: 2,
  },
  progressDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressScore: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '300',
    color: '#00FFFF',
    marginLeft: 5,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontWeight: '300',
  },
  metricIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressTextContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 31, 63, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#001F3F',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  actionCard: {
    flex: 1,
    height: 100,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  actionGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 2,
  },
  actionArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: '#00FFFF',
    letterSpacing: 3,
    marginHorizontal: 20,
  },
  trackingCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  trackingGradient: {
    padding: 20,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  trackingTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginLeft: 10,
    flex: 1,
  },
  trackingStatus: {
    fontSize: 10,
    color: '#00FFFF',
    letterSpacing: 1,
    fontWeight: '300',
  },
  waterDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  waterMetric: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  waterAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0080FF',
  },
  waterUnit: {
    fontSize: 14,
    fontWeight: '300',
    color: '#0080FF',
    marginLeft: 5,
  },
  waterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,128,255,0.3)',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 18,
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFillGradient: {
    height: '100%',
  },
  progressLabel: {
    fontSize: 10,
    color: 'rgba(0,128,255,0.5)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  waterProgress: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  waterBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  waterGoal: {
    fontSize: 12,
    color: '#999',
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,0,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  inputUnit: {
    fontSize: 14,
    color: '#FF00FF',
    fontWeight: '300',
    letterSpacing: 1,
    marginRight: 10,
  },
  submitButton: {
    width: 80,
    height: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,0,255,0.3)',
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.3,
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },
  currentData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,0,255,0.1)',
  },
  currentLabel: {
    fontSize: 10,
    color: 'rgba(255,0,255,0.5)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  currentValue: {
    fontSize: 14,
    color: '#FF00FF',
    fontWeight: '600',
  },
  currentWeight: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 5,
    letterSpacing: 1,
    fontWeight: '300',
  },
  sessionCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  sessionGradient: {
    padding: 25,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sessionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FFFF',
  },
  sessionTitle: {
    fontSize: 10,
    color: '#00FFFF',
    letterSpacing: 2,
    fontWeight: '300',
  },
  sessionTime: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 1,
  },
  sessionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
  sessionType: {
    fontSize: 11,
    color: '#FF00FF',
    letterSpacing: 2,
    fontWeight: '300',
  },
  graphCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  graphGradient: {
    padding: 20,
  },
  graphHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  graphIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginLeft: 15,
    flex: 1,
  },
  graphStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF00',
  },
  statusText: {
    fontSize: 10,
    color: '#00FF00',
    letterSpacing: 1,
    fontWeight: '300',
  },
  graphContainer: {
    marginVertical: 10,
  },
  graphLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendIndicator: {
    width: 20,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLine: {
    width: 20,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  graphStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  graphStat: {
    alignItems: 'center',
    gap: 8,
  },
  statHex: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    backgroundColor: 'rgba(0,255,255,0.05)',
  },
  statUnit: {
    fontSize: 10,
    color: 'rgba(0,255,255,0.7)',
    fontWeight: '300',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  graphStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  graphStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 14,
    color: '#00FFFF',
    letterSpacing: 3,
    fontWeight: '300',
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scaleConnectButton: {
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  scaleConnectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  scaleConnectText: {
    flex: 1,
    fontSize: 11,
    color: '#00FFFF',
    letterSpacing: 2,
    fontWeight: '300',
    marginLeft: 10,
  },
  scaleConnectedContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(0,255,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.2)',
  },
  scaleInfo: {
    marginBottom: 15,
  },
  scaleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  scaleStatusText: {
    fontSize: 12,
    color: '#00FF00',
    letterSpacing: 1,
    fontWeight: '300',
  },
  lastSyncText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginLeft: 26,
  },
  scaleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  syncButton: {
    flex: 1,
    height: 40,
    borderRadius: 0,
    overflow: 'hidden',
  },
  syncButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  syncButtonText: {
    fontSize: 11,
    color: '#000',
    fontWeight: '900',
    letterSpacing: 1,
  },
  disconnectButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectText: {
    fontSize: 11,
    color: '#FF0000',
    letterSpacing: 1,
    fontWeight: '300',
  },
  manualInputSection: {
    marginTop: 10,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  manualDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  manualLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginHorizontal: 15,
    fontWeight: '300',
  },
  compositionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,0,255,0.1)',
  },
  compositionItem: {
    alignItems: 'center',
  },
  compositionValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF00FF',
    marginBottom: 5,
  },
  compositionLabel: {
    fontSize: 9,
    color: 'rgba(255,0,255,0.5)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  compositionDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,0,255,0.1)',
  },
  packageActionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  packageActionCard: {
    height: 80,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  packageActionGradient: {
    flex: 1,
    padding: 20,
  },
  packageActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageActionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  packageActionTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: '#FFD700',
    letterSpacing: 2,
    marginBottom: 5,
  },
  packageActionSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  testButton: {
    height: 40,
    borderRadius: 0,
    overflow: 'hidden',
    marginVertical: 10,
  },
  testButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 11,
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
  },
  testResult: {
    padding: 10,
    backgroundColor: 'rgba(0,255,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.3)',
  },
  testResultText: {
    fontSize: 10,
    color: '#00FF00',
    letterSpacing: 1,
    fontWeight: '300',
  },
  testError: {
    padding: 10,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
  },
  testErrorText: {
    fontSize: 10,
    color: '#FF0000',
    letterSpacing: 1,
    fontWeight: '300',
  },
});