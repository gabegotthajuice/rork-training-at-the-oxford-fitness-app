import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FileText, Download, Eye, Send, CheckCircle, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Form {
  id: string;
  title: string;
  description: string;
  type: 'intake' | 'assessment' | 'consent' | 'feedback';
  lastUpdated: string;
  completions: number;
  status: 'active' | 'draft';
}

const mockForms: Form[] = [
  {
    id: '1',
    title: 'Client Intake Form',
    description: 'Initial health questionnaire and goals assessment',
    type: 'intake',
    lastUpdated: '2024-12-15',
    completions: 24,
    status: 'active',
  },
  {
    id: '2',
    title: 'Fitness Assessment',
    description: 'Physical assessment and baseline measurements',
    type: 'assessment',
    lastUpdated: '2024-12-10',
    completions: 18,
    status: 'active',
  },
  {
    id: '3',
    title: 'Liability Waiver',
    description: 'Legal consent and liability release form',
    type: 'consent',
    lastUpdated: '2024-11-20',
    completions: 24,
    status: 'active',
  },
  {
    id: '4',
    title: 'Progress Feedback',
    description: 'Monthly progress and satisfaction survey',
    type: 'feedback',
    lastUpdated: '2024-12-01',
    completions: 15,
    status: 'active',
  },
];

export default function FormsScreen() {
  const router = useRouter();
  const getTypeColor = (type: Form['type']) => {
    switch (type) {
      case 'intake': return '#4CAF50';
      case 'assessment': return '#2196F3';
      case 'consent': return '#FF9800';
      case 'feedback': return '#9C27B0';
      default: return '#999';
    }
  };

  const renderForm = (form: Form) => (
    <View key={form.id} style={styles.formCard}>
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(form.type) }]} />
      
      <View style={styles.formContent}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{form.title}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: form.status === 'active' ? '#4CAF50' : '#FFA726' 
          }]}>
            <Text style={styles.statusText}>{form.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.formDescription}>{form.description}</Text>
        
        <View style={styles.formStats}>
          <View style={styles.statItem}>
            <CheckCircle size={14} color="#666" />
            <Text style={styles.statText}>{form.completions} completions</Text>
          </View>
          <Text style={styles.lastUpdated}>
            Updated {new Date(form.lastUpdated).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Eye size={16} color="#001F3F" />
            <Text style={styles.actionText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Send size={16} color="#001F3F" />
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={16} color="#001F3F" />
            <Text style={styles.actionText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Form Templates</Text>
        <Text style={styles.headerSubtitle}>Manage and send forms to clients</Text>
      </View>

      <View style={styles.formsList}>
        {mockForms.map(renderForm)}
      </View>

      <TouchableOpacity style={styles.createButton}>
        <FileText size={20} color="#001F3F" />
        <Text style={styles.createButtonText}>Create New Form</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.createButton, { backgroundColor: '#4285F4', marginTop: 0 }]}
        onPress={() => router.push('/calendar-sync' as any)}
      >
        <Calendar size={20} color="#FFFFFF" />
        <Text style={[styles.createButtonText, { color: '#FFFFFF' }]}>Calendar Integration</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  formsList: {
    padding: 16,
  },
  formCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeIndicator: {
    width: 4,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
  formDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  formStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#001F3F',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFD700',
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
});