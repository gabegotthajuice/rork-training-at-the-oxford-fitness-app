import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Calendar, Clock, User, MapPin, Plus, ExternalLink, RefreshCw, Settings, Link2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Session {
  id: string;
  clientName: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'personal' | 'group' | 'assessment';
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const mockSessions: Session[] = [
  {
    id: '1',
    clientName: 'Sarah Johnson',
    clientId: '1',
    date: '2024-12-20',
    startTime: '09:00',
    endTime: '10:00',
    type: 'personal',
    location: 'Main Gym',
    status: 'scheduled',
  },
  {
    id: '2',
    clientName: 'Michael Chen',
    clientId: '2',
    date: '2024-12-20',
    startTime: '10:30',
    endTime: '11:30',
    type: 'personal',
    location: 'Main Gym',
    status: 'scheduled',
  },
  {
    id: '3',
    clientName: 'Group Session',
    clientId: 'group',
    date: '2024-12-20',
    startTime: '12:00',
    endTime: '13:00',
    type: 'group',
    location: 'Studio A',
    status: 'scheduled',
    notes: '5 participants',
  },
  {
    id: '4',
    clientName: 'Emily Rodriguez',
    clientId: '3',
    date: '2024-12-20',
    startTime: '14:00',
    endTime: '15:00',
    type: 'assessment',
    location: 'Assessment Room',
    status: 'scheduled',
  },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing'>('idle');
  const [isConnected, setIsConnected] = useState({ google: false, acuity: false });
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrationType, setIntegrationType] = useState<'google' | 'acuity' | null>(null);

  const getSessionTypeColor = (type: Session['type']) => {
    switch (type) {
      case 'personal': return '#4CAF50';
      case 'group': return '#2196F3';
      case 'assessment': return '#FF9800';
      default: return '#999';
    }
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled': return '#001F3F';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#FF5252';
      default: return '#999';
    }
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => router.push(`/trainer-session-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.sessionTypeIndicator, { backgroundColor: getSessionTypeColor(item.type) }]} />
      
      <View style={styles.sessionContent}>
        <View style={styles.sessionHeader}>
          <Text style={[styles.sessionTime, { color: getStatusColor(item.status) }]}>
            {item.startTime} - {item.endTime}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: getSessionTypeColor(item.type) + '20' }]}>
            <Text style={[styles.typeText, { color: getSessionTypeColor(item.type) }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.sessionInfo}>
          <View style={styles.infoRow}>
            <User size={14} color="#666" />
            <Text style={styles.clientName}>{item.clientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={14} color="#666" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          {item.notes && (
            <Text style={styles.notes}>{item.notes}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getDaySchedule = () => {
    // Filter sessions for selected date
    return mockSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });
  };

  const handleGoogleCalendarConnect = () => {
    Alert.alert(
      'Google Calendar Integration',
      'Google Calendar integration requires OAuth setup. For now, this is a placeholder that simulates the connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Connection',
          onPress: () => {
            // Simulate connection for demo purposes
            setIsConnected(prev => ({ ...prev, google: true }));
            Alert.alert('Demo Mode', 'Google Calendar connection simulated. In production, this would use proper OAuth.');
          },
        },
      ]
    );
  };

  const handleAcuityConnect = () => {
    Alert.alert(
      'Acuity Scheduling Integration',
      'Acuity integration requires API credentials. For now, this is a placeholder that simulates the connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Connection',
          onPress: () => {
            // Simulate connection for demo purposes
            setIsConnected(prev => ({ ...prev, acuity: true }));
            Alert.alert('Demo Mode', 'Acuity Scheduling connection simulated. In production, this would use proper API integration.');
          },
        },
      ]
    );
  };

  const handleSync = () => {
    if (!isConnected.google && !isConnected.acuity) {
      Alert.alert('No Calendars Connected', 'Please connect at least one calendar service to sync.');
      return;
    }

    setSyncStatus('syncing');
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('idle');
      Alert.alert(
        'Sync Complete',
        `Successfully synced with ${[
          isConnected.google && 'Google Calendar',
          isConnected.acuity && 'Acuity Scheduling',
        ].filter(Boolean).join(' and ')}`
      );
    }, 2000);
  };

  const renderIntegrationModal = () => (
    <Modal
      visible={showIntegrationModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowIntegrationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {integrationType === 'google' ? 'Google Calendar' : 'Acuity Scheduling'} Integration
          </Text>
          
          <Text style={styles.modalDescription}>
            {integrationType === 'google' 
              ? 'To integrate with Google Calendar, you would typically need to:'
              : 'To integrate with Acuity Scheduling, you would typically need:'}
          </Text>
          
          <View style={styles.stepsList}>
            {integrationType === 'google' ? (
              <>
                <Text style={styles.stepItem}>1. Set up OAuth 2.0 credentials in Google Cloud Console</Text>
                <Text style={styles.stepItem}>2. Configure redirect URIs</Text>
                <Text style={styles.stepItem}>3. Implement OAuth flow</Text>
                <Text style={styles.stepItem}>4. Request calendar permissions</Text>
              </>
            ) : (
              <>
                <Text style={styles.stepItem}>1. Get your Acuity User ID</Text>
                <Text style={styles.stepItem}>2. Generate an API key from Acuity settings</Text>
                <Text style={styles.stepItem}>3. Configure webhook endpoints</Text>
                <Text style={styles.stepItem}>4. Set up two-way sync</Text>
              </>
            )}
          </View>
          
          <Text style={styles.demoNote}>
            This is currently in demo mode. The actual integration would require backend setup.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowIntegrationModal(false);
                setIntegrationType(null);
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalConnectButton}
              onPress={() => {
                setIsConnected(prev => ({
                  ...prev,
                  [integrationType === 'google' ? 'google' : 'acuity']: true
                }));
                setShowIntegrationModal(false);
                Alert.alert(
                  'Demo Connection',
                  `${integrationType === 'google' ? 'Google Calendar' : 'Acuity Scheduling'} has been connected in demo mode.`
                );
                setIntegrationType(null);
              }}
            >
              <Text style={styles.modalConnectText}>Connect (Demo)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderIntegrationModal()}
      {/* Integration Bar */}
      <View style={styles.integrationBar}>
        <LinearGradient
          colors={['#001F3F', '#003366']}
          style={styles.integrationGradient}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.integrationContent}>
              <TouchableOpacity
                style={[
                  styles.integrationButton,
                  isConnected.google && styles.integrationButtonConnected,
                ]}
                onPress={() => {
                  if (!isConnected.google) {
                    router.push('/calendar-integration');
                  } else {
                    Alert.alert(
                      'Disconnect Google Calendar',
                      'Are you sure you want to disconnect Google Calendar?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Disconnect',
                          style: 'destructive',
                          onPress: () => setIsConnected(prev => ({ ...prev, google: false }))
                        }
                      ]
                    );
                  }
                }}
              >
                <Calendar size={16} color={isConnected.google ? '#4CAF50' : '#FFD700'} />
                <Text style={[
                  styles.integrationText,
                  isConnected.google && styles.integrationTextConnected,
                ]}>
                  {isConnected.google ? 'Google Connected' : 'Connect Google'}
                </Text>
                {isConnected.google && <ExternalLink size={12} color="#4CAF50" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.integrationButton,
                  isConnected.acuity && styles.integrationButtonConnected,
                ]}
                onPress={() => {
                  if (!isConnected.acuity) {
                    setIntegrationType('acuity');
                    setShowIntegrationModal(true);
                  } else {
                    Alert.alert(
                      'Disconnect Acuity Scheduling',
                      'Are you sure you want to disconnect Acuity Scheduling?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Disconnect',
                          style: 'destructive',
                          onPress: () => setIsConnected(prev => ({ ...prev, acuity: false }))
                        }
                      ]
                    );
                  }
                }}
              >
                <Link2 size={16} color={isConnected.acuity ? '#4CAF50' : '#FFD700'} />
                <Text style={[
                  styles.integrationText,
                  isConnected.acuity && styles.integrationTextConnected,
                ]}>
                  {isConnected.acuity ? 'Acuity Connected' : 'Connect Acuity'}
                </Text>
                {isConnected.acuity && <ExternalLink size={12} color="#4CAF50" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.syncButton,
                  syncStatus === 'syncing' && styles.syncButtonActive,
                ]}
                onPress={handleSync}
                disabled={syncStatus === 'syncing'}
              >
                <RefreshCw
                  size={16}
                  color="#FFD700"
                  style={syncStatus === 'syncing' ? styles.rotating : undefined}
                />
                <Text style={styles.syncText}>
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => router.push('/calendar-integration')}
              >
                <Settings size={16} color="#999" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>

      <View style={styles.header}>
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
          >
            <Text style={styles.dateButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.currentDate}>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </Text>
            <Text style={styles.dateSubtext}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          >
            <Text style={styles.dateButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'day' && styles.toggleButtonActive]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getDaySchedule().length}</Text>
          <Text style={styles.statLabel}>Sessions Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {getDaySchedule().filter(s => s.type === 'personal').length}
          </Text>
          <Text style={styles.statLabel}>Personal</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {getDaySchedule().filter(s => s.type === 'group').length}
          </Text>
          <Text style={styles.statLabel}>Group</Text>
        </View>
      </View>

      <FlatList
        data={getDaySchedule()}
        renderItem={renderSession}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.sessionsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color="#CCC" />
            <Text style={styles.emptyText}>No sessions scheduled for this day</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/trainer-add-session')}
      >
        <Plus size={24} color="#001F3F" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  integrationBar: {
    height: 50,
    backgroundColor: '#001F3F',
  },
  integrationGradient: {
    flex: 1,
    justifyContent: 'center',
  },
  integrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  integrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  integrationButtonConnected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  integrationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  integrationTextConnected: {
    color: '#4CAF50',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  syncButtonActive: {
    opacity: 0.7,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
  },
  settingsButton: {
    padding: 8,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 20,
    color: '#001F3F',
    fontWeight: 'bold',
  },
  currentDate: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  dateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#001F3F',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFD700',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sessionsList: {
    padding: 16,
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionTypeIndicator: {
    width: 4,
  },
  sessionContent: {
    flex: 1,
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sessionInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  location: {
    fontSize: 13,
    color: '#666',
  },
  notes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  stepsList: {
    marginBottom: 16,
  },
  stepItem: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 8,
  },
  demoNote: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modalConnectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#001F3F',
    alignItems: 'center',
  },
  modalConnectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
});