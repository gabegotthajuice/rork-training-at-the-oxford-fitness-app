import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  CreditCard,
  Calendar,
  Users,
  Target,
  Activity,
  Award,
  RefreshCw,
  Book,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  Zap,
  Shield,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Package {
  id: string;
  name: string;
  price: string;
  frequency: string;
  description: string;
  features: string[];
  renewUrl: string;
  popular?: boolean;
  sessionsPerWeek: number;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'external';
  url?: string;
  duration?: string;
  category: string;
  premium?: boolean;
}

const packages: Package[] = [
  {
    id: '2day',
    name: '2 Days/Week',
    price: '$200',
    frequency: '/month',
    description: 'Perfect for beginners or maintaining fitness',
    features: [
      'Two personalized training sessions per week',
      'Custom workout plan',
      'Nutrition guidance',
      'Progress tracking',
      'Community access',
    ],
    renewUrl: 'https://www.oxfordtrainning.com/services/p/2-daysweek-training-plan',
    sessionsPerWeek: 2,
  },
  {
    id: '3day',
    name: '3 Days/Week',
    price: '$300',
    frequency: '/month',
    description: 'Optimal for consistent progress and results',
    features: [
      'Three customized sessions per week',
      'Advanced workout programming',
      'Detailed nutrition plan',
      'Weekly check-ins',
      'Priority scheduling',
      'Community access',
    ],
    renewUrl: 'https://www.oxfordtrainning.com/services/p/single-session-f9jg7-jl8g9',
    popular: true,
    sessionsPerWeek: 3,
  },
  {
    id: '4day',
    name: '4 Days/Week',
    price: '$400',
    frequency: '/month',
    description: 'Intensive training for serious transformation',
    features: [
      'Four intensive guided sessions per week',
      'Elite programming & periodization',
      'Comprehensive nutrition coaching',
      'Daily accountability',
      'VIP support',
      'Exclusive community events',
    ],
    renewUrl: 'https://www.oxfordtrainning.com/services/p/single-session-f9jg7-csnks-ak9fp',
    sessionsPerWeek: 4,
  },
];

const resources: Resource[] = [
  {
    id: '1',
    title: 'Oxford Consultation',
    description: 'Required initial anatomical breakdown and personalized plan',
    type: 'guide',
    category: 'Getting Started',
    url: 'https://www.oxfordtrainning.com',
  },
  {
    id: '2',
    title: 'HIIT Training Techniques',
    description: 'High-intensity interval training methods used at Oxford',
    type: 'video',
    category: 'Training',
    duration: '15 min',
    url: 'https://www.oxfordtrainning.com',
  },
  {
    id: '3',
    title: 'Function Patterns',
    description: 'Movement patterns for optimal body mechanics',
    type: 'article',
    category: 'Training',
    url: 'https://www.oxfordtrainning.com',
  },
  {
    id: '4',
    title: 'Progressive Overload',
    description: 'Advanced techniques for continuous gains',
    type: 'guide',
    category: 'Training',
    premium: true,
    url: 'https://www.oxfordtrainning.com',
  },
  {
    id: '5',
    title: 'Plyometric & Cardio',
    description: 'Explosive training and aerobic conditioning',
    type: 'video',
    category: 'Training',
    duration: '20 min',
    url: 'https://www.oxfordtrainning.com',
  },
  {
    id: '6',
    title: 'Community Guidelines',
    description: 'Growing together - body, mind, and spirit',
    type: 'external',
    category: 'Community',
    url: 'https://www.oxfordtrainning.com',
  },
];

export default function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState<'packages' | 'resources'>('packages');

  const handlePackageRenew = (url: string) => {
    Linking.openURL(url);
  };

  const handleResourcePress = (resource: Resource) => {
    if (resource.url) {
      Linking.openURL(resource.url);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={24} color="#FFD700" />;
      case 'article':
        return <FileText size={24} color="#FFD700" />;
      case 'guide':
        return <Book size={24} color="#FFD700" />;
      case 'external':
        return <ExternalLink size={24} color="#FFD700" />;
      default:
        return <Book size={24} color="#FFD700" />;
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
              <Text style={styles.brandName}>THE OXFORD</Text>
              <Text style={styles.tagline}>Training & Transformation</Text>
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
                activeTab === 'packages' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('packages')}
            >
              <CreditCard
                size={18}
                color={activeTab === 'packages' ? '#FFD700' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'packages' && styles.activeTabText,
                ]}
              >
                Packages
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'resources' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('resources')}
            >
              <Book
                size={18}
                color={activeTab === 'resources' ? '#FFD700' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'resources' && styles.activeTabText,
                ]}
              >
                Resources
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'packages' ? (
            <>
              <View style={styles.philosophyCard}>
                <LinearGradient
                  colors={['#1A1A1A', '#2A2A2A']}
                  style={styles.philosophyGradient}
                >
                  <Text style={styles.philosophyTitle}>The Oxford Experience</Text>
                  <Text style={styles.philosophyText}>
                    Build your body, sharpen your mind, and grow in community.
                    Our holistic approach focuses on anatomical optimization,
                    daily improvement, and training with like-minded individuals.
                  </Text>
                  <View style={styles.philosophyFeatures}>
                    <View style={styles.philosophyFeature}>
                      <Target size={20} color="#FFD700" />
                      <Text style={styles.philosophyFeatureText}>Learn the Body</Text>
                    </View>
                    <View style={styles.philosophyFeature}>
                      <Activity size={20} color="#FFD700" />
                      <Text style={styles.philosophyFeatureText}>Sharpen Daily</Text>
                    </View>
                    <View style={styles.philosophyFeature}>
                      <Users size={20} color="#FFD700" />
                      <Text style={styles.philosophyFeatureText}>Grow Together</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <Text style={styles.sectionTitle}>Training Packages</Text>
              
              {packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    pkg.popular && styles.popularPackage,
                  ]}
                  onPress={() => handlePackageRenew(pkg.renewUrl)}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={30}
                    tint="dark"
                    style={styles.packageBlur}
                  >
                    {pkg.popular && (
                      <View style={styles.popularBadge}>
                        <Award size={16} color="#000" />
                        <Text style={styles.popularText}>MOST POPULAR</Text>
                      </View>
                    )}
                    
                    <View style={styles.packageHeader}>
                      <View>
                        <Text style={styles.packageName}>{pkg.name}</Text>
                        <Text style={styles.packageDescription}>
                          {pkg.description}
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{pkg.price}</Text>
                        <Text style={styles.frequency}>{pkg.frequency}</Text>
                      </View>
                    </View>

                    <View style={styles.sessionsIndicator}>
                      {[...Array(4)].map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.sessionDot,
                            index < pkg.sessionsPerWeek && styles.sessionDotActive,
                          ]}
                        />
                      ))}
                    </View>
                    
                    <View style={styles.featuresContainer}>
                      {pkg.features.map((feature, index) => (
                        <View key={index} style={styles.feature}>
                          <View style={styles.featureDot} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.renewButton,
                        pkg.popular && styles.popularRenewButton,
                      ]}
                      onPress={() => handlePackageRenew(pkg.renewUrl)}
                    >
                      <RefreshCw size={18} color={pkg.popular ? '#000' : '#FFD700'} />
                      <Text
                        style={[
                          styles.renewButtonText,
                          pkg.popular && styles.popularRenewButtonText,
                        ]}
                      >
                        Renew Package
                      </Text>
                    </TouchableOpacity>
                  </BlurView>
                </TouchableOpacity>
              ))}

              <View style={styles.consultationCard}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.consultationGradient}
                >
                  <Calendar size={32} color="#000" />
                  <Text style={styles.consultationTitle}>Oxford Consultation</Text>
                  <Text style={styles.consultationText}>
                    Required initial session including anatomical breakdown,
                    dysfunction identification, and personalized plan creation.
                  </Text>
                  <TouchableOpacity
                    style={styles.consultationButton}
                    onPress={() => Linking.openURL('https://www.oxfordtrainning.com')}
                  >
                    <Text style={styles.consultationButtonText}>Book Consultation</Text>
                    <ExternalLink size={16} color="#FFD700" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              <View style={styles.trainingComponents}>
                <Text style={styles.sectionTitle}>Training Components</Text>
                <View style={styles.componentGrid}>
                  <View style={styles.componentCard}>
                    <Zap size={24} color="#FFD700" />
                    <Text style={styles.componentTitle}>HIIT</Text>
                    <Text style={styles.componentDesc}>High Intensity</Text>
                  </View>
                  <View style={styles.componentCard}>
                    <Target size={24} color="#FFD700" />
                    <Text style={styles.componentTitle}>Function</Text>
                    <Text style={styles.componentDesc}>Movement Patterns</Text>
                  </View>
                  <View style={styles.componentCard}>
                    <Activity size={24} color="#FFD700" />
                    <Text style={styles.componentTitle}>Plyometric</Text>
                    <Text style={styles.componentDesc}>Explosive Power</Text>
                  </View>
                  <View style={styles.componentCard}>
                    <TrendingUp size={24} color="#FFD700" />
                    <Text style={styles.componentTitle}>Overload</Text>
                    <Text style={styles.componentDesc}>Progressive Gains</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.categoriesContainer}>
                {Array.from(new Set(resources.map((r) => r.category))).map(
                  (category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.categoryChip}
                    >
                      <Text style={styles.categoryText}>{category}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View style={styles.resourcesList}>
                {resources.map((resource) => (
                  <TouchableOpacity
                    key={resource.id}
                    style={styles.resourceCard}
                    onPress={() => handleResourcePress(resource)}
                    activeOpacity={0.7}
                  >
                    <BlurView
                      intensity={20}
                      tint="dark"
                      style={styles.blurContainer}
                    >
                      <View style={styles.resourceContent}>
                        <View style={styles.resourceIcon}>
                          {getResourceIcon(resource.type)}
                        </View>

                        <View style={styles.resourceInfo}>
                          <View style={styles.resourceHeader}>
                            <Text style={styles.resourceTitle}>
                              {resource.title}
                            </Text>
                            {resource.premium && (
                              <View style={styles.premiumBadge}>
                                <Sparkles size={12} color="#FFD700" />
                                <Text style={styles.premiumText}>PRO</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.resourceDescription}>
                            {resource.description}
                          </Text>
                          <View style={styles.resourceMeta}>
                            <Text style={styles.categoryLabel}>
                              {resource.category}
                            </Text>
                            {resource.duration && (
                              <View style={styles.durationContainer}>
                                <Clock size={12} color="#666" />
                                <Text style={styles.duration}>
                                  {resource.duration}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <ChevronRight size={20} color="#666" />
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                ))}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  philosophyCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  philosophyGradient: {
    padding: 20,
  },
  philosophyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFD700',
    marginBottom: 12,
  },
  philosophyText: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
    marginBottom: 16,
  },
  philosophyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  philosophyFeature: {
    alignItems: 'center',
    gap: 8,
  },
  philosophyFeatureText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  packageCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  popularPackage: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  packageBlur: {
    padding: 20,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#000',
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
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  frequency: {
    fontSize: 12,
    color: '#888',
  },
  sessionsIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sessionDotActive: {
    backgroundColor: '#FFD700',
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
  renewButton: {
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
  popularRenewButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  renewButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  popularRenewButtonText: {
    color: '#000',
  },
  consultationCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  consultationGradient: {
    padding: 24,
    alignItems: 'center',
  },
  consultationTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  consultationText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  consultationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  consultationButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  trainingComponents: {
    marginBottom: 30,
  },
  componentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  componentCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  componentDesc: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
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
    paddingBottom: 30,
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  premiumText: {
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
});