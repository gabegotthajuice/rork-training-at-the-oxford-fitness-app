import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Palette, 
  Globe, 
  Send, 
  Save,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  AlertCircle
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { Stack } from 'expo-router';

interface BusinessInfo {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    tagline: string;
    logo?: string;
  };
}

export default function BusinessSettingsScreen() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const businessQuery = trpc.business.getInfo.useQuery();
  
  useEffect(() => {
    if (businessQuery.data?.success && businessQuery.data.data) {
      setBusinessInfo(businessQuery.data.data);
    }
  }, [businessQuery.data]);

  const updateBusinessMutation = trpc.business.updateInfo.useMutation();
  
  useEffect(() => {
    if (updateBusinessMutation.isSuccess && updateBusinessMutation.data) {
      console.log('Success:', updateBusinessMutation.data.message);
      setIsEditing(false);
      businessQuery.refetch();
    }
    if (updateBusinessMutation.isError) {
      console.error('Error:', updateBusinessMutation.error?.message);
    }
  }, [updateBusinessMutation.isSuccess, updateBusinessMutation.isError, updateBusinessMutation.data, updateBusinessMutation.error]);

  const syncToSquarespaceMutation = trpc.business.syncToSquarespace.useMutation();
  
  useEffect(() => {
    if (syncToSquarespaceMutation.isSuccess && syncToSquarespaceMutation.data) {
      console.log('Sync Complete:', syncToSquarespaceMutation.data.message);
      setLastSyncTime(syncToSquarespaceMutation.data.syncedData.lastSyncTime);
    }
    if (syncToSquarespaceMutation.isError) {
      console.error('Sync Failed:', syncToSquarespaceMutation.error?.message);
    }
  }, [syncToSquarespaceMutation.isSuccess, syncToSquarespaceMutation.isError, syncToSquarespaceMutation.data, syncToSquarespaceMutation.error]);

  const handleSave = () => {
    if (!businessInfo) return;

    updateBusinessMutation.mutate({
      ...businessInfo,
      autoSyncToSquarespace: autoSync
    });
  };

  const handleSync = () => {
    syncToSquarespaceMutation.mutate({ forceUpdate: true });
  };

  const updateField = (field: string, value: any) => {
    if (!businessInfo) return;
    
    setBusinessInfo(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: string) => {
    if (!businessInfo) return;
    
    setBusinessInfo(prev => ({
      ...prev!,
      [parent]: {
        ...prev![parent as keyof BusinessInfo] as any,
        [field]: value
      }
    }));
  };

  if (businessQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001F3F" />
          <Text style={styles.loadingText}>Loading business information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!businessInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#dc3545" />
          <Text style={styles.errorText}>Failed to load business information</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => businessQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Business Settings',
          headerStyle: { backgroundColor: '#001F3F' },
          headerTintColor: '#FFD700',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#001F3F', '#003366']}
          style={styles.header}
        >
          <Building2 size={32} color="#FFD700" />
          <Text style={styles.headerTitle}>Business Information</Text>
          <Text style={styles.headerSubtitle}>
            Manage your business details and sync with Squarespace
          </Text>
        </LinearGradient>

        {/* Sync Status */}
        <View style={styles.syncSection}>
          <View style={styles.syncHeader}>
            <View style={styles.syncInfo}>
              <Send size={20} color="#001F3F" />
              <Text style={styles.syncTitle}>Squarespace Sync</Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#ccc', true: '#FFD700' }}
              thumbColor={autoSync ? '#001F3F' : '#f4f3f4'}
            />
          </View>
          
          {lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.syncButton, syncToSquarespaceMutation.isPending && styles.disabledButton]}
            onPress={handleSync}
            disabled={syncToSquarespaceMutation.isPending}
          >
            {syncToSquarespaceMutation.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Send size={18} color="white" />
                <Text style={styles.syncButtonText}>Sync to Squarespace</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Building2 size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={businessInfo.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Business Name"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Mail size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={businessInfo.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="Business Email"
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={businessInfo.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Globe size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={businessInfo.website}
              onChangeText={(text) => updateField('website', text)}
              placeholder="Website URL"
              keyboardType="url"
              editable={isEditing}
            />
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={businessInfo.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Business Description"
            multiline
            numberOfLines={4}
            editable={isEditing}
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MapPin size={20} color="#001F3F" /> Address
          </Text>
          
          <TextInput
            style={styles.input}
            value={businessInfo.address.street}
            onChangeText={(text) => updateNestedField('address', 'street', text)}
            placeholder="Street Address"
            editable={isEditing}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              value={businessInfo.address.city}
              onChangeText={(text) => updateNestedField('address', 'city', text)}
              placeholder="City"
              editable={isEditing}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              value={businessInfo.address.state}
              onChangeText={(text) => updateNestedField('address', 'state', text)}
              placeholder="State"
              editable={isEditing}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              value={businessInfo.address.zipCode}
              onChangeText={(text) => updateNestedField('address', 'zipCode', text)}
              placeholder="ZIP Code"
              editable={isEditing}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              value={businessInfo.address.country}
              onChangeText={(text) => updateNestedField('address', 'country', text)}
              placeholder="Country"
              editable={isEditing}
            />
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.inputGroup}>
            <Instagram size={20} color="#E4405F" />
            <TextInput
              style={styles.input}
              value={businessInfo.socialMedia.instagram || ''}
              onChangeText={(text) => updateNestedField('socialMedia', 'instagram', text)}
              placeholder="@username"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Facebook size={20} color="#1877F2" />
            <TextInput
              style={styles.input}
              value={businessInfo.socialMedia.facebook || ''}
              onChangeText={(text) => updateNestedField('socialMedia', 'facebook', text)}
              placeholder="Facebook Page"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Twitter size={20} color="#1DA1F2" />
            <TextInput
              style={styles.input}
              value={businessInfo.socialMedia.twitter || ''}
              onChangeText={(text) => updateNestedField('socialMedia', 'twitter', text)}
              placeholder="@username"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Linkedin size={20} color="#0A66C2" />
            <TextInput
              style={styles.input}
              value={businessInfo.socialMedia.linkedin || ''}
              onChangeText={(text) => updateNestedField('socialMedia', 'linkedin', text)}
              placeholder="Company Name"
              editable={isEditing}
            />
          </View>
        </View>

        {/* Branding */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Palette size={20} color="#001F3F" /> Branding
          </Text>
          
          <TextInput
            style={styles.input}
            value={businessInfo.branding.tagline}
            onChangeText={(text) => updateNestedField('branding', 'tagline', text)}
            placeholder="Business Tagline"
            editable={isEditing}
          />

          <View style={styles.colorRow}>
            <View style={styles.colorInput}>
              <Text style={styles.colorLabel}>Primary Color</Text>
              <View style={styles.colorPreview}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: businessInfo.branding.primaryColor }
                  ]} 
                />
                <TextInput
                  style={styles.colorText}
                  value={businessInfo.branding.primaryColor}
                  onChangeText={(text) => updateNestedField('branding', 'primaryColor', text)}
                  placeholder="#000000"
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.colorInput}>
              <Text style={styles.colorLabel}>Secondary Color</Text>
              <View style={styles.colorPreview}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: businessInfo.branding.secondaryColor }
                  ]} 
                />
                <TextInput
                  style={styles.colorText}
                  value={businessInfo.branding.secondaryColor}
                  onChangeText={(text) => updateNestedField('branding', 'secondaryColor', text)}
                  placeholder="#000000"
                  editable={isEditing}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Information</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  businessQuery.refetch();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, updateBusinessMutation.isPending && styles.disabledButton]}
                onPress={handleSave}
                disabled={updateBusinessMutation.isPending}
              >
                {updateBusinessMutation.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Save size={18} color="white" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Changes will automatically sync to your Squarespace site when auto-sync is enabled.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#001F3F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  syncSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  syncButton: {
    backgroundColor: '#001F3F',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
  },
  colorInput: {
    flex: 1,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorText: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  actionButtons: {
    padding: 16,
  },
  editButton: {
    backgroundColor: '#001F3F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});