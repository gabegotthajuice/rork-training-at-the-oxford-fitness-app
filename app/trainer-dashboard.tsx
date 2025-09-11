import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Activity,
  Droplets,
  Flame,
  Moon,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/AuthProvider';

interface ClientCardProps {
  client: any;
  onPress: () => void;
}

function ClientCard({ client, onPress }: ClientCardProps) {
  const getHealthStatus = () => {
    if (!client.latestHealth) return 'No data';
    
    const lastUpdate = new Date(client.latestHealth.syncedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) return 'Active';
    if (hoursDiff < 72) return 'Recent';
    return 'Inactive';
  };
  
  const status = getHealthStatus();
  const statusColor = status === 'Active' ? '#4CAF50' : status === 'Recent' ? '#FFA500' : '#F44336';
  
  return (
    <TouchableOpacity style={styles.clientCard} onPress={onPress}>
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>
            {client.profile?.firstName} {client.profile?.lastName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#999" />
      </View>
      
      {client.latestHealth && (
        <View style={styles.clientMetrics}>
          <View style={styles.metric}>
            <Activity size={16} color="#666" />
            <Text style={styles.metricValue}>{client.latestHealth.steps || '--'}</Text>
            <Text style={styles.metricLabel}>steps</Text>
          </View>
          
          <View style={styles.metric}>
            <Droplets size={16} color="#666" />
            <Text style={styles.metricValue}>{client.latestHealth.waterIntake || '--'}</Text>
            <Text style={styles.metricLabel}>ml</Text>
          </View>
          
          <View style={styles.metric}>
            <Flame size={16} color="#666" />
            <Text style={styles.metricValue}>{client.latestHealth.caloriesIntake || '--'}</Text>
            <Text style={styles.metricLabel}>kcal</Text>
          </View>
          
          <View style={styles.metric}>
            <Moon size={16} color="#666" />
            <Text style={styles.metricValue}>{client.latestHealth.sleepHours || '--'}</Text>
            <Text style={styles.metricLabel}>hrs</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TrainerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  const clientsQuery = trpc.trainer.getAllClientsData.useQuery(
    { trainerId: user?.id || '' },
    { 
      enabled: !!user?.id,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await clientsQuery.refetch();
    setRefreshing(false);
  };
  
  const handleClientPress = (clientId: string) => {
    router.push({
      pathname: '/trainer-client-detail',
      params: { clientId },
    });
  };
  
  const activeClients = clientsQuery.data?.clients.filter(c => {
    if (!c.latestHealth) return false;
    const hoursDiff = (Date.now() - new Date(c.latestHealth.syncedAt).getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }).length || 0;
  
  const totalClients = clientsQuery.data?.totalClients || 0;
  
  if (clientsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading client data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Client Health Dashboard',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={[styles.overviewCard, { backgroundColor: '#E8F2FF' }]}>
            <Users size={24} color="#007AFF" />
            <Text style={styles.overviewValue}>{totalClients}</Text>
            <Text style={styles.overviewLabel}>Total Clients</Text>
          </View>
          
          <View style={[styles.overviewCard, { backgroundColor: '#E8F5E9' }]}>
            <TrendingUp size={24} color="#4CAF50" />
            <Text style={styles.overviewValue}>{activeClients}</Text>
            <Text style={styles.overviewLabel}>Active Today</Text>
          </View>
          
          <View style={[styles.overviewCard, { backgroundColor: '#FFF3E0' }]}>
            <AlertCircle size={24} color="#FF9800" />
            <Text style={styles.overviewValue}>{totalClients - activeClients}</Text>
            <Text style={styles.overviewLabel}>Need Check-in</Text>
          </View>
        </View>
        
        {/* Clients List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Clients</Text>
          
          {clientsQuery.data?.clients.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No clients yet</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/trainer-add-client')}
              >
                <Text style={styles.addButtonText}>Add Your First Client</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.clientsList}>
              {clientsQuery.data?.clients.map((client) => (
                <ClientCard
                  key={client.profile?.id}
                  client={client}
                  onPress={() => handleClientPress(client.profile?.userId)}
                />
              ))}
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  overviewContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  clientsList: {
    gap: 12,
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clientMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  metric: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  metricLabel: {
    fontSize: 10,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});