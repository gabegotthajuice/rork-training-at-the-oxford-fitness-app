import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Users,
  UserPlus,
  Share2,
  TrendingUp,
  Gift,
  Target,
  ChevronRight,
  Star,
  Trophy,
  Zap,
  Send,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Lead {
  id: string;
  name: string;
  source: 'referral' | 'walk-in' | 'social' | 'website';
  status: 'new' | 'contacted' | 'scheduled' | 'converted' | 'lost';
  referredBy?: string;
  dateAdded: string;
  lastContact?: string;
  notes?: string;
  phone?: string;
  email?: string;
  interest?: string;
}

interface ReferralClient {
  id: string;
  name: string;
  joinDate: string;
  referrals: number;
  activeReferrals: number;
  totalValue: string;
  lastReferral?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface GrowthMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    source: 'referral',
    status: 'new',
    referredBy: 'Mike Chen',
    dateAdded: '2024-01-15',
    phone: '555-0123',
    email: 'sarah.j@email.com',
    interest: 'Weight loss, strength training',
    notes: 'Friend of Mike, interested in 3x/week',
  },
  {
    id: '2',
    name: 'David Park',
    source: 'social',
    status: 'contacted',
    dateAdded: '2024-01-14',
    lastContact: '2024-01-15',
    phone: '555-0124',
    email: 'dpark@email.com',
    interest: 'Muscle building',
    notes: 'Saw Instagram post, scheduled consultation',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    source: 'referral',
    status: 'scheduled',
    referredBy: 'Jessica Lee',
    dateAdded: '2024-01-13',
    lastContact: '2024-01-14',
    phone: '555-0125',
    email: 'emily.r@email.com',
    interest: 'Athletic performance',
    notes: 'Consultation scheduled for Monday',
  },
  {
    id: '4',
    name: 'Marcus Thompson',
    source: 'walk-in',
    status: 'new',
    dateAdded: '2024-01-16',
    phone: '555-0126',
    interest: 'General fitness',
    notes: 'Toured facility, very interested',
  },
];

const topReferrers: ReferralClient[] = [
  {
    id: '1',
    name: 'Mike Chen',
    joinDate: '2023-03-15',
    referrals: 8,
    activeReferrals: 6,
    totalValue: '$14,400',
    lastReferral: '2024-01-15',
    tier: 'platinum',
  },
  {
    id: '2',
    name: 'Jessica Lee',
    joinDate: '2023-05-20',
    referrals: 5,
    activeReferrals: 4,
    totalValue: '$9,600',
    lastReferral: '2024-01-13',
    tier: 'gold',
  },
  {
    id: '3',
    name: 'Alex Rivera',
    joinDate: '2023-07-10',
    referrals: 3,
    activeReferrals: 3,
    totalValue: '$7,200',
    lastReferral: '2024-01-10',
    tier: 'silver',
  },
  {
    id: '4',
    name: 'Samantha White',
    joinDate: '2023-09-01',
    referrals: 2,
    activeReferrals: 1,
    totalValue: '$2,400',
    lastReferral: '2023-12-20',
    tier: 'bronze',
  },
];

const growthMetrics: GrowthMetric[] = [
  {
    label: 'Total Referrals',
    value: '18',
    change: '+22%',
    trend: 'up',
    icon: Share2,
  },
  {
    label: 'Active Leads',
    value: '12',
    change: '+4',
    trend: 'up',
    icon: UserPlus,
  },
  {
    label: 'Conversion Rate',
    value: '68%',
    change: '+5%',
    trend: 'up',
    icon: Target,
  },
  {
    label: 'Referral Value',
    value: '$33,600',
    change: '+18%',
    trend: 'up',
    icon: DollarSign,
  },
];

export default function TrainerResourcesScreen() {
  const [activeTab, setActiveTab] = useState<'referrals' | 'leads'>('referrals');
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadSource, setNewLeadSource] = useState<Lead['source']>('walk-in');

  const handleContactLead = (lead: Lead) => {
    if (lead.phone) {
      Alert.alert(
        'Contact Lead',
        `Call ${lead.name} at ${lead.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Calling...') },
        ]
      );
    }
  };

  const handleAddLead = () => {
    if (newLeadName && newLeadPhone) {
      Alert.alert('Success', `Lead "${newLeadName}" added successfully!`);
      setNewLeadName('');
      setNewLeadPhone('');
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return '#4CAF50';
      case 'contacted': return '#2196F3';
      case 'scheduled': return '#FF9800';
      case 'converted': return '#FFD700';
      case 'lost': return '#666';
      default: return '#888';
    }
  };

  const getTierColor = (tier: ReferralClient['tier']) => {
    switch (tier) {
      case 'platinum': return '#E5E4E2';
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brandName}>UPPER GROWTH</Text>
              <Text style={styles.tagline}>Referrals & Lead Generation</Text>
            </View>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>OX</Text>
              </LinearGradient>
            </View>
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'referrals' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('referrals')}
            >
              <Share2
                size={18}
                color={activeTab === 'referrals' ? '#FFD700' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'referrals' && styles.activeTabText,
                ]}
              >
                Referrals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'leads' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('leads')}
            >
              <UserPlus
                size={18}
                color={activeTab === 'leads' ? '#FFD700' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'leads' && styles.activeTabText,
                ]}
              >
                Leads
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'referrals' ? (
            <>
              {/* Growth Metrics */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
                <View style={styles.metricsContainer}>
                  {growthMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <View key={index} style={styles.metricCard}>
                        <LinearGradient
                          colors={['#1A1A1A', '#2A2A2A']}
                          style={styles.metricGradient}
                        >
                          <View style={styles.metricHeader}>
                            <Icon size={20} color="#FFD700" />
                            <View style={styles.metricChange}>
                              <Text style={[styles.changeText, { color: metric.trend === 'up' ? '#4CAF50' : '#FF5252' }]}>
                                {metric.change}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.metricValue}>{metric.value}</Text>
                          <Text style={styles.metricLabel}>{metric.label}</Text>
                        </LinearGradient>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              <Text style={styles.sectionTitle}>Top Referrers</Text>
              <Text style={styles.sectionSubtitle}>Clients bringing in the most business</Text>
              
              {topReferrers.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.referrerCard}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={20}
                    tint="dark"
                    style={styles.referrerBlur}
                  >
                    <View style={styles.referrerHeader}>
                      <View style={styles.referrerInfo}>
                        <View style={styles.referrerNameRow}>
                          <Text style={styles.referrerName}>{client.name}</Text>
                          <View style={[styles.tierBadge, { backgroundColor: getTierColor(client.tier) + '20', borderColor: getTierColor(client.tier) }]}>
                            <Trophy size={12} color={getTierColor(client.tier)} />
                            <Text style={[styles.tierText, { color: getTierColor(client.tier) }]}>
                              {client.tier.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.referrerDate}>Member since {client.joinDate}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.referrerStats}>
                      <View style={styles.referrerStat}>
                        <Share2 size={16} color="#FFD700" />
                        <Text style={styles.referrerStatValue}>{client.referrals}</Text>
                        <Text style={styles.referrerStatLabel}>Total</Text>
                      </View>
                      <View style={styles.referrerStat}>
                        <Users size={16} color="#FFD700" />
                        <Text style={styles.referrerStatValue}>{client.activeReferrals}</Text>
                        <Text style={styles.referrerStatLabel}>Active</Text>
                      </View>
                      <View style={styles.referrerStat}>
                        <DollarSign size={16} color="#FFD700" />
                        <Text style={styles.referrerStatValue}>{client.totalValue}</Text>
                        <Text style={styles.referrerStatLabel}>Value</Text>
                      </View>
                    </View>
                    
                    {client.lastReferral && (
                      <View style={styles.lastReferralRow}>
                        <Clock size={12} color="#666" />
                        <Text style={styles.lastReferralText}>
                          Last referral: {client.lastReferral}
                        </Text>
                      </View>
                    )}
                    
                    <TouchableOpacity style={styles.rewardButton}>
                      <Gift size={16} color="#FFD700" />
                      <Text style={styles.rewardButtonText}>Send Reward</Text>
                    </TouchableOpacity>
                  </BlurView>
                </TouchableOpacity>
              ))}

              <View style={styles.referralProgramCard}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.programGradient}
                >
                  <Sparkles size={32} color="#000" />
                  <Text style={styles.programTitle}>Referral Program</Text>
                  <Text style={styles.programText}>
                    Clients earn rewards for successful referrals.
                    Track and manage your referral network.
                  </Text>
                  <TouchableOpacity style={styles.programButton}>
                    <Text style={styles.programButtonText}>Program Details</Text>
                    <ArrowUpRight size={16} color="#FFD700" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </>
          ) : (
            <>
              {/* Quick Add Lead */}
              <View style={styles.quickAddContainer}>
                <Text style={styles.quickAddTitle}>Quick Add Lead</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#666"
                  value={newLeadName}
                  onChangeText={setNewLeadName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#666"
                  value={newLeadPhone}
                  onChangeText={setNewLeadPhone}
                  keyboardType="phone-pad"
                />
                <View style={styles.sourceContainer}>
                  {(['referral', 'walk-in', 'social', 'website'] as const).map((source) => (
                    <TouchableOpacity
                      key={source}
                      style={[
                        styles.sourceChip,
                        newLeadSource === source && styles.sourceChipActive
                      ]}
                      onPress={() => setNewLeadSource(source)}
                    >
                      <Text style={[
                        styles.sourceChipText,
                        newLeadSource === source && styles.sourceChipTextActive
                      ]}>
                        {source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddLead}>
                  <UserPlus size={18} color="#000" />
                  <Text style={styles.addButtonText}>Add Lead</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Active Leads</Text>
              <Text style={styles.sectionSubtitle}>Follow up with potential clients</Text>
              
              {mockLeads.map((lead) => (
                <TouchableOpacity
                  key={lead.id}
                  style={styles.leadCard}
                  onPress={() => handleContactLead(lead)}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={20}
                    tint="dark"
                    style={styles.leadBlur}
                  >
                    <View style={styles.leadHeader}>
                      <View style={styles.leadInfo}>
                        <View style={styles.leadNameRow}>
                          <Text style={styles.leadName}>{lead.name}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) + '20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(lead.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(lead.status) }]}>
                              {lead.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.leadMeta}>
                          <Text style={styles.leadSource}>
                            {lead.source === 'referral' ? `Referred by ${lead.referredBy}` : lead.source.charAt(0).toUpperCase() + lead.source.slice(1).replace('-', ' ')}
                          </Text>
                          <Text style={styles.leadDate}>• Added {lead.dateAdded}</Text>
                        </View>
                      </View>
                    </View>
                    
                    {lead.interest && (
                      <View style={styles.interestContainer}>
                        <Target size={14} color="#FFD700" />
                        <Text style={styles.interestText}>{lead.interest}</Text>
                      </View>
                    )}
                    
                    {lead.notes && (
                      <Text style={styles.notesText}>{lead.notes}</Text>
                    )}
                    
                    <View style={styles.leadActions}>
                      {lead.phone && (
                        <TouchableOpacity style={styles.actionButton}>
                          <Phone size={16} color="#FFD700" />
                          <Text style={styles.actionText}>Call</Text>
                        </TouchableOpacity>
                      )}
                      {lead.email && (
                        <TouchableOpacity style={styles.actionButton}>
                          <Mail size={16} color="#FFD700" />
                          <Text style={styles.actionText}>Email</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={styles.actionButton}>
                        <MessageCircle size={16} color="#FFD700" />
                        <Text style={styles.actionText}>Note</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Calendar size={16} color="#FFD700" />
                        <Text style={styles.actionText}>Schedule</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}

              <View style={styles.leadGenerationCard}>
                <LinearGradient
                  colors={['#1A1A1A', '#2A2A2A']}
                  style={styles.generationGradient}
                >
                  <Zap size={24} color="#FFD700" />
                  <Text style={styles.generationTitle}>Lead Generation Tips</Text>
                  <Text style={styles.generationText}>
                    • Ask satisfied clients for referrals{`\n`}
                    • Share success stories on social media{`\n`}
                    • Host free workshops or consultations{`\n`}
                    • Partner with local businesses
                  </Text>
                  <TouchableOpacity style={styles.generationButton}>
                    <Text style={styles.generationButtonText}>More Strategies</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoContainer: {
    width: 50,
    height: 50,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  activeTabText: {
    color: '#FFD700',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  packageCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  packageBlur: {
    padding: 20,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 12,
    color: '#888',
    maxWidth: width * 0.55,
  },
  commissionContainer: {
    alignItems: 'flex-end',
  },
  commission: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  commissionLabel: {
    fontSize: 11,
    color: '#888',
  },
  packageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  packageStat: {
    alignItems: 'center',
  },
  packageStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  packageStatLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  featureText: {
    fontSize: 13,
    color: '#AAA',
    flex: 1,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  manageButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  commissionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  commissionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  commissionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  commissionText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  commissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  commissionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  resourcesList: {
    paddingHorizontal: 20,
  },
  resourceCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  resourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  trainerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trainerBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  resourceDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600' as const,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 11,
    color: '#666',
  },
  supportCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  supportGradient: {
    padding: 20,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFD700',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  metricsScroll: {
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  metricCard: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricChange: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#888',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 16,
  },
  referrerCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  referrerBlur: {
    padding: 16,
  },
  referrerHeader: {
    marginBottom: 12,
  },
  referrerInfo: {
    flex: 1,
  },
  referrerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  referrerName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  referrerDate: {
    fontSize: 12,
    color: '#666',
  },
  referrerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  referrerStat: {
    alignItems: 'center',
  },
  referrerStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  referrerStatLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  lastReferralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  lastReferralText: {
    fontSize: 12,
    color: '#888',
  },
  rewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  rewardButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  referralProgramCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  programGradient: {
    padding: 24,
    alignItems: 'center',
  },
  programTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  programText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  programButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  programButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  quickAddContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
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
  sourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sourceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceChipActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  sourceChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#666',
  },
  sourceChipTextActive: {
    color: '#FFD700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000',
  },
  leadCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  leadBlur: {
    padding: 16,
  },
  leadHeader: {
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  leadNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leadName: {
    fontSize: 17,
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
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  leadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leadSource: {
    fontSize: 12,
    color: '#888',
  },
  leadDate: {
    fontSize: 12,
    color: '#666',
  },
  interestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  interestText: {
    fontSize: 12,
    color: '#FFD700',
  },
  notesText: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 18,
    marginBottom: 12,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#AAA',
  },
  leadGenerationCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  generationGradient: {
    padding: 20,
  },
  generationTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFD700',
    marginTop: 8,
    marginBottom: 12,
  },
  generationText: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 22,
    marginBottom: 16,
  },
  generationButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignSelf: 'center',
  },
  generationButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
});