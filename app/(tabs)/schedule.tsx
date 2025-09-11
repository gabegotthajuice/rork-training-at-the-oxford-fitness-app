import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react-native';
import { useClient } from '@/providers/ClientProvider';

interface Session {
  id: string;
  date: string;
  time: string;
  type: string;
  location: string;
  completed: boolean;
}

export default function ScheduleScreen() {
  const { clientData } = useClient();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const upcomingSessions: Session[] = [
    {
      id: '1',
      date: 'Tomorrow',
      time: '6:00 AM',
      type: 'Upper Body Strength',
      location: 'Main Gym',
      completed: false,
    },
    {
      id: '2',
      date: 'Dec 28',
      time: '6:00 AM',
      type: 'Lower Body Power',
      location: 'Main Gym',
      completed: false,
    },
    {
      id: '3',
      date: 'Dec 30',
      time: '7:00 AM',
      type: 'Full Body Circuit',
      location: 'Main Gym',
      completed: false,
    },
  ];

  const pastSessions: Session[] = [
    {
      id: '4',
      date: 'Dec 23',
      time: '6:00 AM',
      type: 'Core & Conditioning',
      location: 'Main Gym',
      completed: true,
    },
    {
      id: '5',
      date: 'Dec 21',
      time: '6:00 AM',
      type: 'Upper Body Strength',
      location: 'Main Gym',
      completed: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Training Schedule</Text>
          <View style={styles.packageInfo}>
            <Text style={styles.packageText}>Sessions Remaining</Text>
            <Text style={styles.packageCount}>{clientData.sessionsRemaining}</Text>
          </View>
        </View>

        {/* Calendar Overview */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Calendar size={24} color="#FFD700" />
            <Text style={styles.calendarTitle}>This Week</Text>
          </View>
          <View style={styles.weekDays}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
              const isToday = index === new Date().getDay() - 1;
              const hasSession = index === 1 || index === 3 || index === 5;
              return (
                <View
                  key={index}
                  style={[
                    styles.dayCircle,
                    isToday && styles.todayCircle,
                    hasSession && styles.sessionDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday && styles.todayText,
                      hasSession && styles.sessionDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          {upcomingSessions.map((session) => (
            <TouchableOpacity key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={styles.sessionDateTime}>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={14} color="#999" />
                    <Text style={styles.sessionTime}>{session.time}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sessionRight}>
                <Text style={styles.sessionType}>{session.type}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color="#999" />
                  <Text style={styles.sessionLocation}>{session.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Past Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Sessions</Text>
          {pastSessions.map((session) => (
            <View key={session.id} style={[styles.sessionCard, styles.completedCard]}>
              <View style={styles.sessionLeft}>
                <View style={styles.sessionDateTime}>
                  <Text style={[styles.sessionDate, styles.completedText]}>{session.date}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={14} color="#999" />
                    <Text style={[styles.sessionTime, styles.completedText]}>{session.time}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sessionRight}>
                <Text style={[styles.sessionType, styles.completedText]}>{session.type}</Text>
                <View style={styles.completedBadge}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.completedLabel}>Completed</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Book More Sessions */}
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book More Sessions</Text>
        </TouchableOpacity>
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
    backgroundColor: '#001F3F',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  packageInfo: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  packageText: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 5,
  },
  packageCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  calendarCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginLeft: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    backgroundColor: '#001F3F',
  },
  sessionDay: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  dayText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  todayText: {
    color: '#FFD700',
  },
  sessionDayText: {
    color: '#001F3F',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 15,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  completedCard: {
    backgroundColor: '#F9F9F9',
  },
  sessionLeft: {
    flex: 1,
  },
  sessionDateTime: {
    gap: 5,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sessionTime: {
    fontSize: 14,
    color: '#999',
  },
  sessionRight: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sessionLocation: {
    fontSize: 12,
    color: '#999',
  },
  completedText: {
    opacity: 0.6,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  completedLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
});