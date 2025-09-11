import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Info } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarIntegrationScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const handleConnectCalendar = () => {
    Alert.alert(
      'Backend Required',
      'To connect Google Calendar, backend support needs to be enabled.\n\nPlease look for the "Backend" option in the Rork platform header menu (not in this mobile app preview).\n\nOnce backend is enabled, you\'ll be able to:\n• Connect your Google Calendar\n• Sync sessions automatically\n• Manage bookings across platforms',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync - will be replaced with actual API call when backend is enabled
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
      Alert.alert('Sync Complete', 'Calendar sync will be functional once backend is enabled.');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Calendar size={32} color="#007AFF" />
          <Text style={styles.title}>Calendar Integration</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {isConnected ? (
              <CheckCircle size={24} color="#34C759" />
            ) : (
              <AlertCircle size={24} color="#FF9500" />
            )}
            <Text style={styles.statusTitle}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </Text>
          </View>
          
          {isConnected ? (
            <Text style={styles.statusDescription}>
              Your Google Calendar is connected and syncing
            </Text>
          ) : (
            <Text style={styles.statusDescription}>
              Connect your Google Calendar for two-way synchronization
            </Text>
          )}
        </View>

        {!isConnected ? (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={handleConnectCalendar}
          >
            <Calendar size={20} color="#fff" />
            <Text style={styles.connectButtonText}>Connect Google Calendar</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity 
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <RefreshCw size={20} color="#007AFF" />
              )}
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </TouchableOpacity>

            {lastSyncTime && (
              <Text style={styles.lastSyncText}>
                Last synced: {lastSyncTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Sessions created in the app automatically appear in your Google Calendar
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Events from Google Calendar sync back to your app schedule
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Client bookings update in real-time across both platforms
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Cancellations and rescheduling sync automatically
            </Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Info size={20} color="#007AFF" />
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Backend Support Required</Text>
            <Text style={styles.noteText}>
              To enable Google Calendar integration, backend support must be activated. Look for the "Backend" option in the Rork platform header menu (outside of this mobile app preview).
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F2FF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  lastSyncText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#E5F2FF',
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#007AFF',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
});