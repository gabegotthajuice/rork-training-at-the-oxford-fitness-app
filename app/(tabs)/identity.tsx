import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Target, Activity, Brain } from 'lucide-react-native';
import { useClient } from '@/providers/ClientProvider';
import { LinearGradient } from 'expo-linear-gradient';

export default function IdentityScreen() {
  const { clientData } = useClient();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#001F3F', '#002855']}
          style={styles.header}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{clientData.name}</Text>
          <Text style={styles.memberSince}>Member since {clientData.memberSince}</Text>
        </LinearGradient>

        {/* Body Type Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={24} color="#FFD700" />
            <Text style={styles.sectionTitle}>Body Type Analysis</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.bodyType}>{clientData.identity.bodyType}</Text>
            <Text style={styles.description}>{clientData.identity.description}</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Height</Text>
                <Text style={styles.statValue}>{clientData.identity.height}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Starting Weight</Text>
                <Text style={styles.statValue}>{clientData.identity.startingWeight} lbs</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current Weight</Text>
                <Text style={styles.statValue}>{clientData.identity.currentWeight} lbs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={24} color="#FFD700" />
            <Text style={styles.sectionTitle}>Your Goals</Text>
          </View>
          <View style={styles.card}>
            {clientData.identity.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={styles.goalBullet} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Training Focus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={24} color="#FFD700" />
            <Text style={styles.sectionTitle}>Training Focus</Text>
          </View>
          <View style={styles.card}>
            {clientData.identity.trainingFocus.map((focus, index) => (
              <View key={index} style={styles.focusCard}>
                <Text style={styles.focusTitle}>{focus.area}</Text>
                <Text style={styles.focusDescription}>{focus.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lifestyle Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={24} color="#FFD700" />
            <Text style={styles.sectionTitle}>Lifestyle Notes</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.notesText}>{clientData.identity.lifestyleNotes}</Text>
          </View>
        </View>

        {/* Progress Summary */}
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.progressCard}
        >
          <Text style={styles.progressTitle}>Your Journey</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>
                {Math.abs(clientData.identity.currentWeight - clientData.identity.startingWeight)} lbs
              </Text>
              <Text style={styles.progressLabel}>Weight Change</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>30 days</Text>
              <Text style={styles.progressLabel}>Training</Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    color: '#FFD700',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bodyType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginRight: 12,
  },
  goalText: {
    fontSize: 16,
    color: '#001F3F',
    flex: 1,
  },
  focusCard: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 5,
  },
  focusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  progressCard: {
    margin: 20,
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  progressLabel: {
    fontSize: 14,
    color: '#001F3F',
    marginTop: 5,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#001F3F',
    opacity: 0.2,
  },
});