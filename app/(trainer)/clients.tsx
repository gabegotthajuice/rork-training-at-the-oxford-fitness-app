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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, User, TrendingUp, Calendar } from 'lucide-react-native';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  lastSession: string;
  sessionsRemaining: number;
  packageType: string;
  progressScore: number;
  avatar?: string;
  status: 'active' | 'inactive' | 'paused';
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    joinDate: '2024-01-15',
    lastSession: '2024-12-18',
    sessionsRemaining: 8,
    packageType: '12-Session Package',
    progressScore: 85,
    status: 'active',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    joinDate: '2024-02-20',
    lastSession: '2024-12-17',
    sessionsRemaining: 4,
    packageType: '8-Session Package',
    progressScore: 72,
    status: 'active',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 345-6789',
    joinDate: '2024-03-10',
    lastSession: '2024-12-16',
    sessionsRemaining: 12,
    packageType: '16-Session Package',
    progressScore: 91,
    status: 'active',
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'dthompson@email.com',
    phone: '(555) 456-7890',
    joinDate: '2024-01-05',
    lastSession: '2024-11-30',
    sessionsRemaining: 0,
    packageType: '8-Session Package',
    progressScore: 68,
    status: 'paused',
  },
];

export default function ClientsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'paused'>('all');

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || client.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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

      <View style={styles.lastSessionContainer}>
        <Text style={styles.lastSessionLabel}>Last Session: </Text>
        <Text style={styles.lastSessionDate}>
          {new Date(item.lastSession).toLocaleDateString()}
        </Text>
      </View>
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
          <Text style={styles.overviewValue}>{mockClients.length}</Text>
          <Text style={styles.overviewLabel}>Total Clients</Text>
        </View>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewValue}>
            {mockClients.filter(c => c.status === 'active').length}
          </Text>
          <Text style={styles.overviewLabel}>Active</Text>
        </View>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewValue}>
            {mockClients.reduce((sum, c) => sum + c.sessionsRemaining, 0)}
          </Text>
          <Text style={styles.overviewLabel}>Total Sessions</Text>
        </View>
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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