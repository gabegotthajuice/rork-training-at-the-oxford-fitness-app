import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Calendar, Clock, RefreshCw, Link2, Unlink, ChevronRight, AlertCircle, Check } from 'lucide-react-native';
import { useCalendar } from '@/providers/CalendarProvider';

export default function CalendarSyncScreen() {
  const {
    syncSettings,
    googleTokens,
    isSyncing,
    syncError,
    authenticateGoogle,
    syncWithGoogle,
    updateSyncSettings,
    disconnectGoogle,
    isGoogleConnected,
    events
  } = useCalendar();

  const [acuityKey, setAcuityKey] = useState(syncSettings.acuityApiKey || '');
  const [acuityUserId, setAcuityUserId] = useState(syncSettings.acuityUserId || '');
  const [showAcuitySetup, setShowAcuitySetup] = useState(false);

  const handleGoogleConnect = async () => {
    const success = await authenticateGoogle();
    if (success) {
      Alert.alert('Success', 'Google Calendar connected successfully!');
      await updateSyncSettings({ enabled: true });
    }
  };

  const handleGoogleDisconnect = () => {
    Alert.alert(
      'Disconnect Google Calendar',
      'Are you sure you want to disconnect your Google Calendar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectGoogle();
            Alert.alert('Disconnected', 'Google Calendar has been disconnected.');
          }
        }
      ]
    );
  };

  const handleSyncNow = async () => {
    await syncWithGoogle();
    if (!syncError) {
      Alert.alert('Success', 'Calendar synced successfully!');
    }
  };

  const handleSaveAcuitySettings = async () => {
    await updateSyncSettings({
      acuityApiKey: acuityKey,
      acuityUserId: acuityUserId
    });
    setShowAcuitySetup(false);
    Alert.alert('Success', 'Acuity settings saved!');
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const syncedEventsCount = events.filter(e => e.synced).length;
  const pendingEventsCount = events.filter(e => !e.synced).length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Calendar Integration',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
          headerShown: true
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Google Calendar Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color="#4285F4" />
            <Text style={styles.sectionTitle}>Google Calendar</Text>
          </View>

          <View style={styles.card}>
            {isGoogleConnected ? (
              <>
                <View style={styles.connectedStatus}>
                  <View style={styles.statusIndicator}>
                    <Check size={16} color="#fff" />
                  </View>
                  <Text style={styles.connectedText}>Connected</Text>
                </View>

                <View style={styles.syncInfo}>
                  <Text style={styles.syncInfoLabel}>Last synced:</Text>
                  <Text style={styles.syncInfoValue}>
                    {formatLastSync(syncSettings.lastSyncTime)}
                  </Text>
                </View>

                <View style={styles.syncInfo}>
                  <Text style={styles.syncInfoLabel}>Sync direction:</Text>
                  <Text style={styles.syncInfoValue}>
                    {syncSettings.syncDirection === 'two-way' ? 'Two-way' : 'One-way'}
                  </Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.syncButton]}
                    onPress={handleSyncNow}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <RefreshCw size={18} color="#fff" />
                        <Text style={styles.buttonText}>Sync Now</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.disconnectButton]}
                    onPress={handleGoogleDisconnect}
                  >
                    <Unlink size={18} color="#fff" />
                    <Text style={styles.buttonText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.disconnectedText}>
                  Connect your Google Calendar to sync appointments
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.connectButton]}
                  onPress={handleGoogleConnect}
                >
                  <Link2 size={18} color="#fff" />
                  <Text style={styles.buttonText}>Connect Google Calendar</Text>
                </TouchableOpacity>
              </>
            )}

            {syncError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff4444" />
                <Text style={styles.errorText}>{syncError}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Acuity Scheduling Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color="#7B68EE" />
            <Text style={styles.sectionTitle}>Acuity Scheduling</Text>
          </View>

          <View style={styles.card}>
            {syncSettings.acuityApiKey ? (
              <>
                <View style={styles.connectedStatus}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#7B68EE' }]}>
                    <Check size={16} color="#fff" />
                  </View>
                  <Text style={styles.connectedText}>Configured</Text>
                </View>

                <TouchableOpacity
                  style={styles.settingsRow}
                  onPress={() => setShowAcuitySetup(!showAcuitySetup)}
                >
                  <Text style={styles.settingsText}>Update Settings</Text>
                  <ChevronRight size={20} color="#666" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.disconnectedText}>
                  Connect Acuity to import appointments
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.connectButton, { backgroundColor: '#7B68EE' }]}
                  onPress={() => setShowAcuitySetup(true)}
                >
                  <Link2 size={18} color="#fff" />
                  <Text style={styles.buttonText}>Setup Acuity</Text>
                </TouchableOpacity>
              </>
            )}

            {showAcuitySetup && (
              <View style={styles.setupForm}>
                <Text style={styles.inputLabel}>API Key</Text>
                <TextInput
                  style={styles.input}
                  value={acuityKey}
                  onChangeText={setAcuityKey}
                  placeholder="Enter your Acuity API key"
                  placeholderTextColor="#666"
                  secureTextEntry
                />

                <Text style={styles.inputLabel}>User ID</Text>
                <TextInput
                  style={styles.input}
                  value={acuityUserId}
                  onChangeText={setAcuityUserId}
                  placeholder="Enter your Acuity user ID"
                  placeholderTextColor="#666"
                />

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveAcuitySettings}
                >
                  <Text style={styles.buttonText}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Settings</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto-sync</Text>
              <Switch
                value={syncSettings.enabled}
                onValueChange={(value) => updateSyncSettings({ enabled: value })}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Two-way sync</Text>
              <Switch
                value={syncSettings.syncDirection === 'two-way'}
                onValueChange={(value) => 
                  updateSyncSettings({ syncDirection: value ? 'two-way' : 'one-way' })
                }
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Status</Text>

          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{syncedEventsCount}</Text>
                <Text style={styles.statLabel}>Synced Events</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{pendingEventsCount}</Text>
                <Text style={styles.statLabel}>Pending Sync</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{events.length}</Text>
                <Text style={styles.statLabel}>Total Events</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.card}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Connect your Google Calendar to enable two-way synchronization
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Optionally connect Acuity Scheduling to import appointments
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Events will sync automatically based on your settings
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Use two-way sync to keep all calendars updated
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  scrollView: {
    flex: 1
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginLeft: 8
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  connectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500' as const
  },
  disconnectedText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20
  },
  syncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  syncInfoLabel: {
    color: '#999',
    fontSize: 14
  },
  syncInfoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const
  },
  connectButton: {
    backgroundColor: '#4285F4'
  },
  syncButton: {
    backgroundColor: '#4CAF50',
    flex: 1
  },
  disconnectButton: {
    backgroundColor: '#ff4444',
    flex: 1
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginTop: 16
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    gap: 8
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    flex: 1
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 12
  },
  settingsText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '500' as const
  },
  setupForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333'
  },
  inputLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  stat: {
    alignItems: 'center'
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 4
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600' as const,
    marginRight: 12
  },
  instructionText: {
    flex: 1,
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20
  }
});