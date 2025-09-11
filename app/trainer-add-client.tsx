import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Switch,
  Animated,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  ArrowLeft, 
  Save, 
  Link2, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Wifi,
  Activity,
  Target,
  User,
  Scale,
  Calendar,
  ChevronRight,
  CheckCircle,
  Zap,
  UserPlus,
  X,
  Search,
  Phone,
  Users
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Contacts from 'expo-contacts';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: { number?: string }[] | undefined;
  emails?: { email?: string }[] | undefined;
}

export default function AddClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goals: '',
    bodyType: '',
    currentWeight: '',
    targetWeight: '',
    packageType: '',
    sessionsTotal: '',
    height: '',
    age: '',
    activityLevel: '',
    dietaryRestrictions: '',
    medicalConditions: '',
  });
  
  const [integrations, setIntegrations] = useState({
    smartScale: false,
    groupMe: false,
    myFitnessPal: false,
    appleHealth: false,
    googleFit: false,
  });
  
  const [scaleConnected, setScaleConnected] = useState(false);
  const [selectedScaleBrand, setSelectedScaleBrand] = useState('');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (contactSearch) {
      const filtered = contacts.filter(contact => 
        contact.name?.toLowerCase().includes(contactSearch.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [contactSearch, contacts]);

  const loadContacts = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Contact import is only available on mobile devices.');
      return;
    }

    setLoadingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          const sortedContacts = data
            .filter(contact => contact.name)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setContacts(sortedContacts as Contact[]);
          setFilteredContacts(sortedContacts as Contact[]);
          setShowContactPicker(true);
        } else {
          Alert.alert('No Contacts', 'No contacts found on this device.');
        }
      } else {
        Alert.alert('Permission Denied', 'Please enable contact access in settings.');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts.');
    } finally {
      setLoadingContacts(false);
    }
  };

  const selectContact = (contact: Contact) => {
    const phone = contact.phoneNumbers?.[0]?.number || '';
    const email = contact.emails?.[0]?.email || '';
    
    setFormData({
      ...formData,
      name: contact.name || '',
      phone: phone,
      email: email,
    });
    
    setShowContactPicker(false);
    setContactSearch('');
    
    if (contact.name) {
      Alert.alert(
        'Contact Imported',
        `${contact.name} has been added to the form.${!phone ? '\n\nNote: No phone number found.' : ''}${!email ? '\n\nNote: No email found.' : ''}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    // In production, save to database with integrations
    console.log('Saving client:', { ...formData, integrations });
    
    Alert.alert(
      'Client Added Successfully',
      `${formData.name} has been added to your client roster.${scaleConnected ? ' Smart scale integration is active.' : ''}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  const handleScaleConnect = () => {
    Alert.alert(
      'Connect Smart Scale',
      'Select the client\'s smart scale brand:',
      [
        { text: 'Withings', onPress: () => connectScale('Withings') },
        { text: 'Fitbit Aria', onPress: () => connectScale('Fitbit Aria') },
        { text: 'Garmin Index', onPress: () => connectScale('Garmin Index') },
        { text: 'Renpho', onPress: () => connectScale('Renpho') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  const connectScale = (brand: string) => {
    setSelectedScaleBrand(brand);
    setScaleConnected(true);
    setIntegrations({ ...integrations, smartScale: true });
    Alert.alert(
      'Scale Connected',
      `${brand} scale will sync automatically with client\'s profile.`
    );
  };
  
  const handleGroupMeConnect = () => {
    Alert.alert(
      'Connect GroupMe',
      'Enter the GroupMe chat ID or invite link to sync with existing chat.',
      [
        { text: 'Connect Existing Chat', onPress: () => setIntegrations({ ...integrations, groupMe: true }) },
        { text: 'Create New Chat', onPress: () => setIntegrations({ ...integrations, groupMe: true }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Futuristic Background */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      {Platform.OS !== 'web' && (
        <View style={styles.gridOverlay}>
          {[...Array(20)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, { top: i * 50 }]} />
          ))}
          {[...Array(10)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 50 }]} />
          ))}
        </View>
      )}
      
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'ATHLETE ONBOARDING',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#00FFFF',
          headerTitleStyle: {
            fontSize: 14,
            letterSpacing: 3,
            fontWeight: '300',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#00FFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.animatedContainer}>
          {/* Integration Hub */}
          <View style={styles.integrationCard}>
            <LinearGradient
              colors={['rgba(0,255,255,0.05)', 'rgba(0,0,0,0.9)', 'rgba(255,0,255,0.05)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Zap size={20} color="#00FFFF" />
                <Text style={styles.cardTitle}>INTEGRATION HUB</Text>
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>SETUP</Text>
                </View>
              </View>
              
              {/* Smart Scale Integration */}
              <TouchableOpacity 
                style={styles.integrationItem}
                onPress={handleScaleConnect}
                activeOpacity={0.7}
              >
                <View style={styles.integrationLeft}>
                  <Scale size={20} color={scaleConnected ? '#00FF00' : '#FF00FF'} />
                  <View style={styles.integrationInfo}>
                    <Text style={styles.integrationName}>SMART SCALE SYNC</Text>
                    <Text style={styles.integrationDesc}>
                      {scaleConnected ? `Connected: ${selectedScaleBrand}` : 'Auto-sync weight & body composition'}
                    </Text>
                  </View>
                </View>
                <View style={styles.integrationRight}>
                  {scaleConnected ? (
                    <CheckCircle size={20} color="#00FF00" />
                  ) : (
                    <ChevronRight size={20} color="#00FFFF" />
                  )}
                </View>
              </TouchableOpacity>
              
              {/* GroupMe Integration */}
              <TouchableOpacity 
                style={styles.integrationItem}
                onPress={handleGroupMeConnect}
                activeOpacity={0.7}
              >
                <View style={styles.integrationLeft}>
                  <MessageSquare size={20} color={integrations.groupMe ? '#00FF00' : '#0080FF'} />
                  <View style={styles.integrationInfo}>
                    <Text style={styles.integrationName}>GROUPME CHAT</Text>
                    <Text style={styles.integrationDesc}>
                      {integrations.groupMe ? 'Chat synced' : 'Connect existing GroupMe chat'}
                    </Text>
                  </View>
                </View>
                <View style={styles.integrationRight}>
                  {integrations.groupMe ? (
                    <CheckCircle size={20} color="#00FF00" />
                  ) : (
                    <ChevronRight size={20} color="#00FFFF" />
                  )}
                </View>
              </TouchableOpacity>
              
              {/* Additional Integrations */}
              <View style={styles.integrationToggleGroup}>
                <View style={styles.toggleItem}>
                  <View style={styles.toggleLeft}>
                    <Activity size={16} color="#FFD700" />
                    <Text style={styles.toggleLabel}>APPLE HEALTH</Text>
                  </View>
                  <Switch
                    value={integrations.appleHealth}
                    onValueChange={(value) => setIntegrations({ ...integrations, appleHealth: value })}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(0,255,255,0.3)' }}
                    thumbColor={integrations.appleHealth ? '#00FFFF' : '#666'}
                  />
                </View>
                
                <View style={styles.toggleItem}>
                  <View style={styles.toggleLeft}>
                    <Wifi size={16} color="#8A2BE2" />
                    <Text style={styles.toggleLabel}>GOOGLE FIT</Text>
                  </View>
                  <Switch
                    value={integrations.googleFit}
                    onValueChange={(value) => setIntegrations({ ...integrations, googleFit: value })}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(0,255,255,0.3)' }}
                    thumbColor={integrations.googleFit ? '#00FFFF' : '#666'}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
          
          {/* Personal Information */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(0,128,255,0.05)', 'rgba(0,0,0,0.95)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <User size={20} color="#0080FF" />
                <Text style={styles.cardTitle}>ATHLETE PROFILE</Text>
                <TouchableOpacity
                  style={styles.importButton}
                  onPress={loadContacts}
                  activeOpacity={0.7}
                  disabled={loadingContacts}
                >
                  {loadingContacts ? (
                    <ActivityIndicator size="small" color="#00FFFF" />
                  ) : (
                    <>
                      <Users size={16} color="#00FFFF" />
                      <Text style={styles.importButtonText}>IMPORT</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
          
              <View style={styles.inputGroup}>
                <Text style={styles.label}>FULL NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter athlete's full name"
                  placeholderTextColor="#333"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>
          
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="athlete@example.com"
                  placeholderTextColor="#333"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>
          
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PHONE *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#333"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>AGE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="25"
                    placeholderTextColor="#333"
                    keyboardType="numeric"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>HEIGHT</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5'10"
                    placeholderTextColor="#333"
                    value={formData.height}
                    onChangeText={(text) => setFormData({ ...formData, height: text })}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Biometric Data */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255,0,255,0.05)', 'rgba(0,0,0,0.95)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Target size={20} color="#FF00FF" />
                <Text style={styles.cardTitle}>BIOMETRIC DATA</Text>
              </View>
          
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CURRENT WEIGHT</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="180 lbs"
                    placeholderTextColor="#333"
                    keyboardType="numeric"
                    value={formData.currentWeight}
                    onChangeText={(text) => setFormData({ ...formData, currentWeight: text })}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>TARGET WEIGHT</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="165 lbs"
                    placeholderTextColor="#333"
                    keyboardType="numeric"
                    value={formData.targetWeight}
                    onChangeText={(text) => setFormData({ ...formData, targetWeight: text })}
                  />
                </View>
              </View>
          
              <View style={styles.inputGroup}>
                <Text style={styles.label}>BODY TYPE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mesomorph, Ectomorph, or Endomorph"
                  placeholderTextColor="#333"
                  value={formData.bodyType}
                  onChangeText={(text) => setFormData({ ...formData, bodyType: text })}
                />
              </View>
          
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ACTIVITY LEVEL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sedentary, Moderate, Active, Very Active"
                  placeholderTextColor="#333"
                  value={formData.activityLevel}
                  onChangeText={(text) => setFormData({ ...formData, activityLevel: text })}
                />
              </View>
            </LinearGradient>
          </View>
          
          {/* Training Protocol */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(0,255,0,0.05)', 'rgba(0,0,0,0.95)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Calendar size={20} color="#00FF00" />
                <Text style={styles.cardTitle}>TRAINING PROTOCOL</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PRIMARY GOALS</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Weight loss, muscle gain, endurance, etc."
                  placeholderTextColor="#333"
                  multiline
                  numberOfLines={3}
                  value={formData.goals}
                  onChangeText={(text) => setFormData({ ...formData, goals: text })}
                />
              </View>
          
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PACKAGE TYPE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Monthly, 3-Month, 6-Month, Annual"
                  placeholderTextColor="#333"
                  value={formData.packageType}
                  onChangeText={(text) => setFormData({ ...formData, packageType: text })}
                />
              </View>
          
              <View style={styles.inputGroup}>
                <Text style={styles.label}>TOTAL SESSIONS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20"
                  placeholderTextColor="#333"
                  keyboardType="numeric"
                  value={formData.sessionsTotal}
                  onChangeText={(text) => setFormData({ ...formData, sessionsTotal: text })}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DIETARY RESTRICTIONS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Allergies, preferences, restrictions"
                  placeholderTextColor="#333"
                  value={formData.dietaryRestrictions}
                  onChangeText={(text) => setFormData({ ...formData, dietaryRestrictions: text })}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>MEDICAL CONDITIONS</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any relevant medical history or conditions"
                  placeholderTextColor="#333"
                  multiline
                  numberOfLines={2}
                  value={formData.medicalConditions}
                  onChangeText={(text) => setFormData({ ...formData, medicalConditions: text })}
                />
              </View>
            </LinearGradient>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
            <LinearGradient
              colors={['#00FFFF', '#0080FF', '#FF00FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              <Save size={20} color="#000" />
              <Text style={styles.saveButtonText}>INITIALIZE ATHLETE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Contact Picker Modal */}
      <Modal
        visible={showContactPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#000000', '#0A0A0A']}
              style={styles.modalGradient}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Phone size={20} color="#00FFFF" />
                  <Text style={styles.modalTitle}>SELECT FROM CONTACTS</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowContactPicker(false);
                    setContactSearch('');
                  }}
                  style={styles.closeButton}
                >
                  <X size={24} color="#FF00FF" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Search size={18} color="#00FFFF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search contacts..."
                  placeholderTextColor="#666"
                  value={contactSearch}
                  onChangeText={setContactSearch}
                  autoCapitalize="none"
                />
              </View>

              {/* Contact List */}
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                style={styles.contactList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {contactSearch ? 'No contacts found' : 'No contacts available'}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => selectContact(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactInitial}>
                        {item.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      {item.phoneNumbers?.[0]?.number && (
                        <Text style={styles.contactDetail}>
                          <Phone size={10} color="#00FFFF" /> {item.phoneNumbers[0].number}
                        </Text>
                      )}
                      {item.emails?.[0]?.email && (
                        <Text style={styles.contactDetail}>
                          <Mail size={10} color="#FF00FF" /> {item.emails[0].email}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={20} color="#00FFFF" />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.contactSeparator} />}
              />
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.03)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,255,255,0.03)',
  },
  backButton: {
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  integrationCard: {
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  section: {
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginLeft: 10,
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF00',
  },
  statusText: {
    fontSize: 10,
    color: '#00FF00',
    letterSpacing: 1,
    fontWeight: '300',
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.1)',
  },
  integrationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 15,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 3,
  },
  integrationDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  integrationRight: {
    marginLeft: 10,
  },
  integrationToggleGroup: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: '300',
    color: '#00FFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 15,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginBottom: 30,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  saveGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    backgroundColor: 'rgba(0,255,255,0.05)',
  },
  importButtonText: {
    fontSize: 10,
    color: '#00FFFF',
    letterSpacing: 1,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,255,0.2)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 2,
    fontWeight: '300',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  contactList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 15,
  },
  contactAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: {
    fontSize: 18,
    color: '#00FFFF',
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  contactSeparator: {
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.1)',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
  animatedContainer: {
    opacity: 1,
  },
});