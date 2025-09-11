import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Calendar,
  Link2,
  Settings,
  Check,
  X,
  RefreshCw,
  Clock,
  Bell,
  Shield,
  Smartphone,
  Globe,
  ChevronRight,
  Info,
  Key,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

interface CalendarSettings {
  google: {
    connected: boolean;
    email?: string;
    syncEnabled: boolean;
    twoWaySync: boolean;
    autoImport: boolean;
    calendars: string[];
  };
  acuity: {
    connected: boolean;
    subdomain?: string;
    syncEnabled: boolean;
    twoWaySync: boolean;
    autoAccept: boolean;
    apiKey?: string;
  };
  notifications: {
    enabled: boolean;
    reminderTime: number; // minutes before
    clientReminders: boolean;
    scheduleChanges: boolean;
  };
  sync: {
    frequency: 'manual' | '15min' | '30min' | '1hour' | '4hours';
    lastSync?: Date;
    conflictResolution: 'local' | 'remote' | 'newest';
  };
}

export default function TrainerCalendarSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<CalendarSettings>({
    google: {
      connected: false,
      syncEnabled: true,
      twoWaySync: true,
      autoImport: false,
      calendars: [],
    },
    acuity: {
      connected: false,
      syncEnabled: true,
      twoWaySync: true,
      autoAccept: false,
    },
    notifications: {
      enabled: true,
      reminderTime: 30,
      clientReminders: true,
      scheduleChanges: true,
    },
    sync: {
      frequency: '30min',
      conflictResolution: 'newest',
    },
  });

  const [acuitySubdomain, setAcuitySubdomain] = useState('');
  const [acuityApiKey, setAcuityApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGoogleConnect = () => {
    if (settings.google.connected) {
      Alert.alert(
        'Disconnect Google Calendar',
        'Are you sure you want to disconnect your Google Calendar?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => {
              setSettings(prev => ({
                ...prev,
                google: { ...prev.google, connected: false, email: undefined },
              }));
            },
          },
        ]
      );
    } else {
      // Initiate OAuth flow
      const googleAuthUrl = 'https://accounts.google.com/oauth2/v2/auth';
      if (Platform.OS === 'web') {
        window.open(googleAuthUrl, '_blank');
      } else {
        Linking.openURL(googleAuthUrl);
      }
      // Simulate successful connection
      setTimeout(() => {
        setSettings(prev => ({
          ...prev,
          google: {
            ...prev.google,
            connected: true,
            email: 'trainer@gmail.com',
            calendars: ['Primary', 'Work', 'Personal Training'],
          },
        }));
        Alert.alert('Success', 'Google Calendar connected successfully!');
      }, 2000);
    }
  };

  const handleAcuityConnect = () => {
    if (settings.acuity.connected) {
      Alert.alert(
        'Disconnect Acuity',
        'Are you sure you want to disconnect Acuity Scheduling?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => {
              setSettings(prev => ({
                ...prev,
                acuity: { ...prev.acuity, connected: false, subdomain: undefined },
              }));
              setAcuitySubdomain('');
              setAcuityApiKey('');
            },
          },
        ]
      );
    } else {
      if (!acuitySubdomain || !acuityApiKey) {
        Alert.alert('Missing Information', 'Please enter your Acuity subdomain and API key.');
        return;
      }
      // Simulate API validation
      setSettings(prev => ({
        ...prev,
        acuity: {
          ...prev.acuity,
          connected: true,
          subdomain: acuitySubdomain,
          apiKey: acuityApiKey,
        },
      }));
      Alert.alert('Success', 'Acuity Scheduling connected successfully!');
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSettings(prev => ({
        ...prev,
        sync: { ...prev.sync, lastSync: new Date() },
      }));
      Alert.alert('Sync Complete', 'Your calendars have been synchronized.');
    }, 2000);
  };

  const syncFrequencyOptions = [
    { value: 'manual', label: 'Manual Only' },
    { value: '15min', label: 'Every 15 minutes' },
    { value: '30min', label: 'Every 30 minutes' },
    { value: '1hour', label: 'Every hour' },
    { value: '4hours', label: 'Every 4 hours' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Calendar Integration',
          headerStyle: { backgroundColor: '#001F3F' },
          headerTintColor: '#FFD700',
        }}
      />
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['bottom']}>
          {/* Google Calendar Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={24} color="#FFD700" />
                <Text style={styles.sectionTitle}>Google Calendar</Text>
              </View>
              <View style={[styles.statusBadge, settings.google.connected ? styles.connectedBadge : styles.disconnectedBadge]}>
                {settings.google.connected ? <Check size={12} color="#4CAF50" /> : <X size={12} color="#FF5252" />}
                <Text style={[styles.statusText, { color: settings.google.connected ? '#4CAF50' : '#FF5252' }]}>
                  {settings.google.connected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>

            {settings.google.connected && (
              <View style={styles.connectedInfo}>
                <Text style={styles.connectedEmail}>{settings.google.email}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.connectButton, settings.google.connected && styles.disconnectButton]}
              onPress={handleGoogleConnect}
            >
              <Text style={[styles.connectButtonText, settings.google.connected && styles.disconnectButtonText]}>
                {settings.google.connected ? 'Disconnect' : 'Connect Google Calendar'}
              </Text>
            </TouchableOpacity>

            {settings.google.connected && (
              <View style={styles.settingsGroup}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Two-way Sync</Text>
                  <Switch
                    value={settings.google.twoWaySync}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        google: { ...prev.google, twoWaySync: value },
                      }))
                    }
                    trackColor={{ false: '#333', true: '#FFD700' }}
                    thumbColor={settings.google.twoWaySync ? '#001F3F' : '#666'}
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Auto-import Events</Text>
                  <Switch
                    value={settings.google.autoImport}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        google: { ...prev.google, autoImport: value },
                      }))
                    }
                    trackColor={{ false: '#333', true: '#FFD700' }}
                    thumbColor={settings.google.autoImport ? '#001F3F' : '#666'}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Acuity Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Link2 size={24} color="#FFD700" />
                <Text style={styles.sectionTitle}>Acuity Scheduling</Text>
              </View>
              <View style={[styles.statusBadge, settings.acuity.connected ? styles.connectedBadge : styles.disconnectedBadge]}>
                {settings.acuity.connected ? <Check size={12} color="#4CAF50" /> : <X size={12} color="#FF5252" />}
                <Text style={[styles.statusText, { color: settings.acuity.connected ? '#4CAF50' : '#FF5252' }]}>
                  {settings.acuity.connected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>

            {!settings.acuity.connected && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Acuity Subdomain (e.g., yourname)"
                  placeholderTextColor="#666"
                  value={acuitySubdomain}
                  onChangeText={setAcuitySubdomain}
                />
                <TextInput
                  style={styles.input}
                  placeholder="API Key"
                  placeholderTextColor="#666"
                  value={acuityApiKey}
                  onChangeText={setAcuityApiKey}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.helpLink}>
                  <Info size={14} color="#FFD700" />
                  <Text style={styles.helpText}>Where to find my API key?</Text>
                </TouchableOpacity>
              </View>
            )}

            {settings.acuity.connected && (
              <View style={styles.connectedInfo}>
                <Text style={styles.connectedEmail}>{settings.acuity.subdomain}.acuityscheduling.com</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.connectButton, settings.acuity.connected && styles.disconnectButton]}
              onPress={handleAcuityConnect}
            >
              <Text style={[styles.connectButtonText, settings.acuity.connected && styles.disconnectButtonText]}>
                {settings.acuity.connected ? 'Disconnect' : 'Connect Acuity'}
              </Text>
            </TouchableOpacity>

            {settings.acuity.connected && (
              <View style={styles.settingsGroup}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Two-way Sync</Text>
                  <Switch
                    value={settings.acuity.twoWaySync}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        acuity: { ...prev.acuity, twoWaySync: value },
                      }))
                    }
                    trackColor={{ false: '#333', true: '#FFD700' }}
                    thumbColor={settings.acuity.twoWaySync ? '#001F3F' : '#666'}
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Auto-accept Bookings</Text>
                  <Switch
                    value={settings.acuity.autoAccept}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        acuity: { ...prev.acuity, autoAccept: value },
                      }))
                    }
                    trackColor={{ false: '#333', true: '#FFD700' }}
                    thumbColor={settings.acuity.autoAccept ? '#001F3F' : '#666'}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Sync Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <RefreshCw size={24} color="#FFD700" />
                <Text style={styles.sectionTitle}>Sync Settings</Text>
              </View>
            </View>

            <View style={styles.settingsGroup}>
              <Text style={styles.subsectionTitle}>Sync Frequency</Text>
              {syncFrequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioRow}
                  onPress={() =>
                    setSettings(prev => ({
                      ...prev,
                      sync: { ...prev.sync, frequency: option.value as any },
                    }))
                  }
                >
                  <View style={styles.radio}>
                    {settings.sync.frequency === option.value && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}

              {settings.sync.lastSync && (
                <View style={styles.lastSyncInfo}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.lastSyncText}>
                    Last synced: {settings.sync.lastSync.toLocaleString()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.syncNowButton, isSyncing && styles.syncingButton]}
                onPress={handleManualSync}
                disabled={isSyncing}
              >
                <RefreshCw
                  size={18}
                  color="#001F3F"
                  style={isSyncing ? styles.rotating : undefined}
                />
                <Text style={styles.syncNowText}>
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Bell size={24} color="#FFD700" />
                <Text style={styles.sectionTitle}>Notifications</Text>
              </View>
            </View>

            <View style={styles.settingsGroup}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Switch
                  value={settings.notifications.enabled}
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enabled: value },
                    }))
                  }
                  trackColor={{ false: '#333', true: '#FFD700' }}
                  thumbColor={settings.notifications.enabled ? '#001F3F' : '#666'}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Client Reminders</Text>
                <Switch
                  value={settings.notifications.clientReminders}
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, clientReminders: value },
                    }))
                  }
                  trackColor={{ false: '#333', true: '#FFD700' }}
                  thumbColor={settings.notifications.clientReminders ? '#001F3F' : '#666'}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Schedule Changes</Text>
                <Switch
                  value={settings.notifications.scheduleChanges}
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, scheduleChanges: value },
                    }))
                  }
                  trackColor={{ false: '#333', true: '#FFD700' }}
                  thumbColor={settings.notifications.scheduleChanges ? '#001F3F' : '#666'}
                />
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.infoCard}>
              <Shield size={20} color="#FFD700" />
              <Text style={styles.infoText}>
                Your calendar data is encrypted and synced securely. We never share your information with third parties.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  connectedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  disconnectedBadge: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  connectedInfo: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  connectedEmail: {
    fontSize: 14,
    color: '#AAA',
  },
  connectButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#001F3F',
  },
  disconnectButtonText: {
    color: '#FF5252',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  settingsGroup: {
    marginTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLabel: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  radioLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  lastSyncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#888',
  },
  syncNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  syncingButton: {
    opacity: 0.7,
  },
  syncNowText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#001F3F',
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  footer: {
    padding: 20,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#AAA',
    lineHeight: 18,
  },
});