import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TrendingUp, Users, Calendar, Award, ArrowUp, ArrowDown } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
}

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const metrics: Metric[] = [
    { label: 'Total Clients', value: 24, change: 12, trend: 'up' },
    { label: 'Active Clients', value: 18, change: 5, trend: 'up' },
    { label: 'Sessions This Month', value: 142, change: -8, trend: 'down' },
    { label: 'Avg Progress Score', value: '78%', change: 15, trend: 'up' },
    { label: 'Client Retention', value: '92%', change: 3, trend: 'up' },
    { label: 'Revenue', value: '$12,450', change: 18, trend: 'up' },
  ];

  const topPerformers = [
    { name: 'Emily Rodriguez', score: 91, sessions: 16 },
    { name: 'Sarah Johnson', score: 85, sessions: 12 },
    { name: 'Michael Chen', score: 72, sessions: 8 },
  ];

  const renderMetricCard = (metric: Metric, index: number) => (
    <View key={index} style={styles.metricCard}>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <View style={styles.metricChange}>
        {metric.trend === 'up' ? (
          <ArrowUp size={16} color="#4CAF50" />
        ) : (
          <ArrowDown size={16} color="#FF5252" />
        )}
        <Text style={[
          styles.changeText,
          { color: metric.trend === 'up' ? '#4CAF50' : '#FF5252' }
        ]}>
          {Math.abs(metric.change)}%
        </Text>
      </View>
    </View>
  );

  const renderProgressBar = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period && styles.periodTextActive
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => renderMetricCard(metric, index))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Award size={20} color="#FFD700" />
          <Text style={styles.sectionTitle}>Top Performers</Text>
        </View>
        {topPerformers.map((performer, index) => (
          <View key={index} style={styles.performerCard}>
            <View style={styles.performerRank}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.performerInfo}>
              <Text style={styles.performerName}>{performer.name}</Text>
              <View style={styles.performerStats}>
                <Text style={styles.performerStat}>Score: {performer.score}%</Text>
                <Text style={styles.performerStat}>Sessions: {performer.sessions}</Text>
              </View>
              {renderProgressBar(performer.score)}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color="#FFD700" />
          <Text style={styles.sectionTitle}>Session Distribution</Text>
        </View>
        <View style={styles.distributionCard}>
          <View style={styles.distributionItem}>
            <View style={[styles.distributionColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.distributionLabel}>Personal Training</Text>
            <Text style={styles.distributionValue}>68%</Text>
          </View>
          <View style={styles.distributionItem}>
            <View style={[styles.distributionColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.distributionLabel}>Group Sessions</Text>
            <Text style={styles.distributionValue}>22%</Text>
          </View>
          <View style={styles.distributionItem}>
            <View style={[styles.distributionColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.distributionLabel}>Assessments</Text>
            <Text style={styles.distributionValue}>10%</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#FFD700" />
          <Text style={styles.sectionTitle}>Growth Trends</Text>
        </View>
        <View style={styles.trendCard}>
          <Text style={styles.trendText}>
            Client base has grown by <Text style={styles.highlightText}>23%</Text> this quarter
          </Text>
          <Text style={styles.trendText}>
            Average session attendance: <Text style={styles.highlightText}>94%</Text>
          </Text>
          <Text style={styles.trendText}>
            Most popular time slot: <Text style={styles.highlightText}>9:00 AM - 10:00 AM</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  periodButtonActive: {
    backgroundColor: '#001F3F',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodTextActive: {
    color: '#FFD700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  metricCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  performerCard: {
    flexDirection: 'row',
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
  performerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  performerStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  performerStat: {
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  distributionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  distributionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  highlightText: {
    color: '#001F3F',
    fontWeight: 'bold',
  },
});