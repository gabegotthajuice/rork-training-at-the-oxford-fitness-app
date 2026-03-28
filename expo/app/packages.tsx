import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, CreditCard, Check, Star, Users, Calendar } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import * as WebBrowser from 'expo-web-browser';

interface TrainingPackage {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  sessions: number;
  duration: string;
  features: string[];
  popular?: boolean;
  squarespaceProductId: string;
  description: string;
}

const packages: TrainingPackage[] = [
  {
    id: 'starter',
    name: 'Starter Package',
    price: 299,
    originalPrice: 399,
    sessions: 4,
    duration: '1 Month',
    squarespaceProductId: 'starter-package-4-sessions',
    description: 'Perfect for beginners looking to start their fitness journey',
    features: [
      '4 Personal Training Sessions',
      'Nutrition Consultation',
      'Workout Plan Creation',
      'Progress Tracking',
      'Email Support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Package',
    price: 799,
    originalPrice: 999,
    sessions: 12,
    duration: '3 Months',
    squarespaceProductId: 'premium-package-12-sessions',
    description: 'Most popular choice for serious fitness transformation',
    popular: true,
    features: [
      '12 Personal Training Sessions',
      'Custom Meal Planning',
      'Body Composition Analysis',
      'Progress Photos & Measurements',
      '24/7 Chat Support',
      'Supplement Recommendations',
      'Workout Video Library Access'
    ]
  },
  {
    id: 'elite',
    name: 'Elite Package',
    price: 1499,
    originalPrice: 1899,
    sessions: 24,
    duration: '6 Months',
    squarespaceProductId: 'elite-package-24-sessions',
    description: 'Complete transformation program with maximum support',
    features: [
      '24 Personal Training Sessions',
      'Weekly Meal Prep Guidance',
      'Monthly Body Scans',
      'Lifestyle Coaching',
      'Priority Scheduling',
      'Supplement Stack Included',
      'Private Facebook Group Access',
      'Monthly Check-in Calls'
    ]
  }
];

export default function PackagesScreen() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutMutation = trpc.payments.createSquarespaceCheckout.useMutation({
    onSuccess: async (data) => {
      setIsProcessing(false);
      if (data.checkoutUrl) {
        if (Platform.OS === 'web') {
          window.open(data.checkoutUrl, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(data.checkoutUrl);
        }
      }
    },
    onError: (error: any) => {
      setIsProcessing(false);
      console.error('Checkout error:', error?.message || 'Unknown error');
    }
  });

  const handlePurchase = async (pkg: TrainingPackage) => {
    setSelectedPackage(pkg.id);
    setIsProcessing(true);

    try {
      await createCheckoutMutation.mutateAsync({
        productId: pkg.squarespaceProductId,
        packageName: pkg.name,
        price: pkg.price,
        sessions: pkg.sessions
      });
    } catch (error) {
      console.error('Purchase error:', error);
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  const renderPackageCard = (pkg: TrainingPackage) => {
    const isSelected = selectedPackage === pkg.id;
    const isLoading = isProcessing && isSelected;

    return (
      <View key={pkg.id} style={[styles.packageCard, pkg.popular && styles.popularCard]}>
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <Star size={16} color="#001F3F" />
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}
        
        <LinearGradient
          colors={pkg.popular ? ['#FFD700', '#FFA500'] : ['#f8f9fa', '#e9ecef']}
          style={styles.packageHeader}
        >
          <Package size={32} color={pkg.popular ? '#001F3F' : '#666'} />
          <Text style={[styles.packageName, pkg.popular && styles.popularPackageName]}>
            {pkg.name}
          </Text>
        </LinearGradient>

        <View style={styles.packageContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${pkg.price}</Text>
            {pkg.originalPrice && (
              <Text style={styles.originalPrice}>${pkg.originalPrice}</Text>
            )}
          </View>

          <Text style={styles.description}>{pkg.description}</Text>

          <View style={styles.packageDetails}>
            <View style={styles.detailRow}>
              <Users size={18} color="#FFD700" />
              <Text style={styles.detailText}>{pkg.sessions} Sessions</Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={18} color="#FFD700" />
              <Text style={styles.detailText}>{pkg.duration}</Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What&apos;s Included:</Text>
            {pkg.features.map((feature, featureIndex) => (
              <View key={`${pkg.id}-feature-${featureIndex}`} style={styles.featureRow}>
                <Check size={16} color="#28a745" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.purchaseButton,
              pkg.popular && styles.popularPurchaseButton,
              isLoading && styles.disabledButton
            ]}
            onPress={() => handlePurchase(pkg)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <CreditCard size={20} color="white" />
                <Text style={styles.purchaseButtonText}>Purchase Package</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#001F3F', '#003366']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Training Packages</Text>
          <Text style={styles.headerSubtitle}>
            Choose the perfect package for your fitness journey
          </Text>
        </LinearGradient>

        <View style={styles.packagesContainer}>
          {packages.map(renderPackageCard)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All packages include access to our mobile app and progress tracking tools.
          </Text>
          <Text style={styles.footerNote}>
            Secure payment processing powered by Squarespace Commerce.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  packagesContainer: {
    padding: 16,
    gap: 20,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  packageHeader: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  packageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  popularPackageName: {
    color: '#001F3F',
  },
  packageContent: {
    padding: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  originalPrice: {
    fontSize: 20,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  packageDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  purchaseButton: {
    backgroundColor: '#001F3F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  popularPurchaseButton: {
    backgroundColor: '#FFD700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});