import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Smartphone,
  Activity,
  Scale,
  Heart,
  Bluetooth,
  CheckCircle,
  Link2,
  Wifi,
  Settings,
  TrendingUp,
} from 'lucide-react-native';
import { useHealthKit } from '@/providers/HealthKitProvider';

interface DeviceIntegration {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  type: 'health_app' | 'fitness_tracker' | 'smart_scale' | 'nutrition_app';
  isConnected: boolean;
  isAvailable: boolean;
  connectionMethod: 'oauth' | 'bluetooth' | 'api' | 'manual';
  benefits: string[];
  color: string;
}

export default function DeviceIntegrationScreen() {
  const { isHealthKitAvailable, isAuthorized, requestAuthorization, fetchFromHealthKit } = useHealthKit();
  const [isLoading, setIsLoading] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  const deviceIntegrations: DeviceIntegration[] = [
    {
      id: 'apple_health',
      name: 'Apple Health',
      icon: <Smartphone size={24} color="#FF3B30" />,
      description: 'Sync sleep, steps, heart rate, and activity data automatically',
      type: 'health_app',
      isConnected: isAuthorized,
      isAvailable: Platform.OS === 'ios' && isHealthKitAvailable,
      connectionMethod: 'oauth',
      benefits: ['Sleep tracking', 'Step counting', 'Heart rate monitoring', 'Active calories'],
      color: '#FF3B30',
    },
    {
      id: 'google_fit',
      name: 'Google Fit',
      icon: <Activity size={24} color="#4285F4" />,
      description: 'Track workouts, steps, and health metrics across Android devices',
      type: 'health_app',
      isConnected: connectedDevices.includes('google_fit'),
      isAvailable: Platform.OS === 'android',
      connectionMethod: 'oauth',
      benefits: ['Workout tracking', 'Step counting', 'Weight tracking', 'Activity goals'],
      color: '#4285F4',
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: <Heart size={24} color="#00B0B9" />,
      description: 'Connect your Fitbit device for comprehensive health tracking',
      type: 'fitness_tracker',
      isConnected: connectedDevices.includes('fitbit'),
      isAvailable: true,
      connectionMethod: 'oauth',
      benefits: ['Sleep stages', 'Heart rate zones', 'Exercise recognition', 'Stress tracking'],
      color: '#00B0B9',
    },
    {
      id: 'starfit_scale',
      name: 'StarFit Smart Scale',
      icon: <Scale size={24} color="#9C27B0" />,
      description: 'Premium smart scale with comprehensive body composition analysis',
      type: 'smart_scale',
      isConnected: connectedDevices.includes('starfit_scale'),
      isAvailable: bluetoothEnabled,
      connectionMethod: 'bluetooth',
      benefits: ['Weight tracking', 'Body fat %', 'Muscle mass', 'BMI calculation', 'Bone density', 'Water weight'],
      color: '#9C27B0',
    },
    {
      id: 'myfitnesspal',
      name: 'MyFitnessPal',
      icon: <Activity size={24} color="#0066CC" />,
      description: 'Import nutrition data and meal logging from MyFitnessPal',
      type: 'nutrition_app',
      isConnected: connectedDevices.includes('myfitnesspal'),
      isAvailable: true,
      connectionMethod: 'api',
      benefits: ['Calorie tracking', 'Macro nutrients', 'Food database', 'Meal history'],
      color: '#0066CC',
    },
    {
      id: 'withings_scale',
      name: 'Withings Scale',
      icon: <TrendingUp size={24} color="#FF6B35" />,
      description: 'Connect Withings smart scales for body composition tracking',
      type: 'smart_scale',
      isConnected: connectedDevices.includes('withings_scale'),
      isAvailable: true,
      connectionMethod: 'oauth',
      benefits: ['Weight trends', 'Body composition', 'Weather sync', 'Multiple users'],
      color: '#FF6B35',
    },
  ];

  useEffect(() => {
    loadConnectedDevices();
    checkBluetoothStatus();
  }, []);

  const loadConnectedDevices = async () => {
    // In a real app, load from secure storage or API
    // For now, simulate with empty array
    setConnectedDevices([]);
  };

  const checkBluetoothStatus = async () => {
    // In a real app, check Bluetooth status
    // For now, simulate it
    setBluetoothEnabled(true);
  };

  const handleDeviceConnection = async (device: DeviceIntegration) => {
    if (!device?.id?.trim()) return;
    
    if (device.isConnected) {
      handleDisconnectDevice(device);
      return;
    }

    setIsLoading(true);

    try {
      switch (device.id) {
        case 'apple_health':
          if (Platform.OS === 'ios') {
            const success = await requestAuthorization();
            if (success) {
              await fetchFromHealthKit();
              console.log('Apple Health connected successfully!');
            }
          }
          break;

        case 'google_fit':
          // In a real app, open Google Fit OAuth
          await connectDevice(device.id);
          console.log('Google Fit connected successfully!');
          break;

        case 'fitbit':
          // In a real app, open Fitbit OAuth
          await connectDevice(device.id);
          console.log('Fitbit connected successfully!');
          break;

        case 'starfit_scale':
          if (!bluetoothEnabled) {
            console.log('Bluetooth Required for StarFit scale');
            return;
          }

          // In a real app, start Bluetooth pairing
          await connectDevice(device.id);
          console.log('StarFit Scale Connected!');
          break;

        case 'myfitnesspal':
          // In a real app, open MyFitnessPal OAuth
          await connectDevice(device.id);
          console.log('MyFitnessPal connected successfully!');
          break;

        case 'withings_scale':
          // In a real app, open Withings OAuth
          await connectDevice(device.id);
          console.log('Withings scale connected successfully!');
          break;

        default:
          console.log('Integration coming soon!');
      }
    } catch (error) {
      console.error('Connection error:', error);
      console.error('Failed to connect device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectDevice = async (deviceId: string) => {
    if (!deviceId?.trim()) return;
    const updated = [...connectedDevices, deviceId];
    setConnectedDevices(updated);
    // In a real app, save to secure storage or API
  };

  const handleDisconnectDevice = async (device: DeviceIntegration) => {
    // In a real app, show confirmation modal
    const updated = connectedDevices.filter(id => id !== device.id);
    setConnectedDevices(updated);
    console.log('Disconnected:', device.name);
  };

  const renderDeviceCard = (device: DeviceIntegration) => {
    const isConnected = device.id === 'apple_health' ? device.isConnected : connectedDevices.includes(device.id);
    
    return (
      <View key={device.id} style={[styles.deviceCard, { borderLeftColor: device.color }]}>
        <View style={styles.deviceHeader}>
          <View style={[styles.deviceIcon, { backgroundColor: `${device.color}15` }]}>
            {device.icon}
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceDescription}>{device.description}</Text>
          </View>
          <View style={styles.deviceStatus}>
            {isConnected ? (
              <CheckCircle size={20} color="#4CAF50" />
            ) : (
              <View style={styles.disconnectedDot} />
            )}
          </View>
        </View>

        <View style={styles.deviceBenefits}>
          {device.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitItem}>
              <View style={[styles.benefitDot, { backgroundColor: device.color }]} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.connectButton,
            isConnected && styles.connectedButton,
            !device.isAvailable && styles.disabledButton,
          ]}
          onPress={() => handleDeviceConnection(device)}
          disabled={!device.isAvailable || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {device.connectionMethod === 'bluetooth' && <Bluetooth size={16} color="#FFFFFF" />}
              {device.connectionMethod === 'oauth' && <Link2 size={16} color="#FFFFFF" />}
              {device.connectionMethod === 'api' && <Wifi size={16} color="#FFFFFF" />}
              <Text style={styles.connectButtonText}>
                {isConnected ? 'Connected' : device.isAvailable ? 'Connect' : 'Unavailable'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const connectedCount = deviceIntegrations.filter(device => 
    device.id === 'apple_health' ? device.isConnected : connectedDevices.includes(device.id)
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Device Integration',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '600' },
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.headerGradient}
          >
            <Settings size={32} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Connect Your Devices</Text>
            <Text style={styles.headerSubtitle}>
              Sync data automatically from your favorite health and fitness apps
            </Text>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{connectedCount}</Text>
            <Text style={styles.statLabel}>Connected</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{deviceIntegrations.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Auto Sync</Text>
          </View>
        </View>

        {/* Health Apps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Apps</Text>
          <Text style={styles.sectionDescription}>
            Connect your phone&apos;s health app for automatic sleep and activity tracking
          </Text>
          {deviceIntegrations
            .filter(device => device.type === 'health_app')
            .map(renderDeviceCard)}
        </View>

        {/* Fitness Trackers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Trackers</Text>
          <Text style={styles.sectionDescription}>
            Sync data from your wearable fitness devices
          </Text>
          {deviceIntegrations
            .filter(device => device.type === 'fitness_tracker')
            .map(renderDeviceCard)}
        </View>

        {/* Smart Scales Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Scales</Text>
          <Text style={styles.sectionDescription}>
            Automatically track weight and body composition
          </Text>
          {deviceIntegrations
            .filter(device => device.type === 'smart_scale')
            .map(renderDeviceCard)}
        </View>

        {/* Nutrition Apps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Apps</Text>
          <Text style={styles.sectionDescription}>
            Import meal data and calorie tracking
          </Text>
          {deviceIntegrations
            .filter(device => device.type === 'nutrition_app')
            .map(renderDeviceCard)}
        </View>

        {/* Bluetooth Settings */}
        <View style={styles.bluetoothSection}>
          <View style={styles.bluetoothHeader}>
            <Bluetooth size={20} color="#666" />
            <Text style={styles.bluetoothTitle}>Bluetooth</Text>
            <Switch
              value={bluetoothEnabled}
              onValueChange={setBluetoothEnabled}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={bluetoothEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          <Text style={styles.bluetoothDescription}>
            Enable Bluetooth to connect smart scales and other devices
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  deviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deviceStatus: {
    marginLeft: 8,
  },
  disconnectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  deviceBenefits: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#666',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  connectedButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bluetoothSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bluetoothHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bluetoothTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginLeft: 8,
  },
  bluetoothDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
});