import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, User, TrendingUp, Calendar, RefreshCw, MoreVertical } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  lastSession?: string;
  sessionsRemaining: number;
  packageType: string;
  progressScore: number;
  avatar?: string;
  status: 'active' | 'inactive' | 'paused';
  goals?: string;
  currentWeight?: string;
  targetWeight?: string;
}

export default function ClientsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'paused'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch clients from backend
  const clientsQuery = trpc.clients.getAll.useQuery({
    search: searchQuery,
    status: selectedFilter,
    limit: 50,
    offset: 0,
  });

  const clients = clientsQuery.data?.clients || [];
  const stats = clientsQuery.data?.stats;
  
  // Delete client mutation
  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      clientsQuery.refetch();
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await clientsQuery.refetch();
    setRefreshing(false);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    Alert.alert(
      'Remove Client',
      `Are you sure you want to remove ${clientName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteClientMutation.mutateAsync({ clientId });
              Alert.alert('Success', result.message);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove client.');
            }
          },
        },
      ]
    );
  };
  
  const handleClientOptions = (client: Client) => {
    Alert.alert(
      client.name,
      'Choose an action',
      [
        { text: 'View Details', onPress: () => router.push(`/trainer-client-detail?id=${client.id}`) },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => handleDeleteClient(client.id, client.name)
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF5252';
      case 'paused': return '#FFA726';
      default: return '#999';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFD700';
    return '#FF5252';
  };

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => router.push(`/trainer-client-detail?id=${item.id}`)}
      onLongPress={() => handleClientOptions(item)}
      activeOpacity={0.7}
    >
      <View style={styles.clientHeader}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={24} color="#FFD700" />
            </View>
          )}
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.name}</Text>
          <Text style={styles.clientEmail}>{item.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleClientOptions(item)}
        >
          <MoreVertical size={20} color="#666" />
        </TouchableOpacity>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.clientStats}>
        <View style={styles.statItem}>
          <Calendar size={16} color="#666" />
          <Text style={styles.statLabel}>Sessions Left</Text>
          <Text style={styles.statValue}>{item.sessionsRemaining}</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={16} color="#666" />
          <Text style={styles.statLabel}>Progress</Text>
          <Text style={[styles.statValue, { color: getProgressColor(item.progressScore) }]}>
            {item.progressScore}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Package</Text>
          <Text style={styles.statValueSmall}>{item.packageType}</Text>
        </View>
      </View>

      {item.lastSession && (
        <View style={styles.lastSessionContainer}>
          <Text style={styles.lastSessionLabel}>Last Session: </Text>
          <Text style={styles.lastSessionDate}>
            {new Date(item.lastSession).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/trainer-add-client')}
        >
          <Plus size={24} color="#001F3F" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'active', 'inactive', 'paused'] as const).map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsOverview}>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewValue}>{stats?.total || 0}</Text>
          <Text style={styles.overviewLabel}>Total Clients</Text>
        </View>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewValue}>{stats?.active || 0}</Text>
          <Text style={styles.overviewLabel}>Active</Text>
        </View>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewValue}>{stats?.totalSessions || 0}</Text>
          <Text style={styles.overviewLabel}>Total Sessions</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw size={16} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {clientsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      ) : clientsQuery.isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load clients</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => clientsQuery.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <User size={48} color="#666" />
          <Text style={styles.emptyTitle}>No Clients Yet</Text>
          <Text style={styles.emptyText}>Add your first client to get started</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => router.push('/trainer-add-client')}
          >
            <Plus size={20} color="#001F3F" />
            <Text style={styles.addFirstButtonText}>Add First Client</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clients as Client[]}
          renderItem={renderClient}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FFD700"
            />
          }
          ListEmptyComponent={
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No clients found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#001F3F',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#001F3F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noResultsContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  moreButton: {
    padding: 8,
    marginRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    maxHeight: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#001F3F',
    borderColor: '#001F3F',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFD700',
  },
  statsOverview: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#001F3F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  statValueSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#001F3F',
    textAlign: 'center',
  },
  lastSessionContainer: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  lastSessionLabel: {
    fontSize: 12,
    color: '#666',
  },
  lastSessionDate: {
    fontSize: 12,
    color: '#001F3F',
    fontWeight: '600',
  },
});