import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { 
  User, 
  Bell, 
  Calendar, 
  CreditCard, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Globe
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppMode } from '@/providers/AppModeProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, currentUser } = useAppMode();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/mode-selection');
  };

  type SettingItem = {
    icon: typeof User;
    label: string;
  } & (
    | {
        toggle: true;
        value: boolean;
        onToggle: React.Dispatch<React.SetStateAction<boolean>>;
        onPress?: never;
      }
    | {
        toggle?: false;
        value?: string;
        onToggle?: never;
        onPress: () => void;
      }
  );

  const settingSections: Array<{
    title: string;
    items: SettingItem[];
  }> = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          value: currentUser?.name || 'Oxford Trainer',
          onPress: () => console.log('Profile'),
        },
        {
          icon: CreditCard,
          label: 'Billing & Subscriptions',
          value: 'Pro Plan',
          onPress: () => console.log('Billing'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: Globe,
          label: 'Language',
          value: 'English',
          onPress: () => console.log('Language'),
        },
      ],
    },
    {
      title: 'Integrations',
      items: [
        {
          icon: Calendar,
          label: 'Calendar Sync',
          value: 'Connected',
          onPress: () => console.log('Calendar'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          onPress: () => console.log('Help'),
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          onPress: () => console.log('Privacy'),
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <User size={40} color="#FFD700" />
        </View>
        <Text style={styles.profileName}>{currentUser?.name || 'Oxford Trainer'}</Text>
        <Text style={styles.profileEmail}>{currentUser?.email || 'trainer@oxford.com'}</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>TRAINER MODE</Text>
        </View>
      </View>

      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.settingItem}
              onPress={item.onPress}
              disabled={!!item.toggle}
            >
              <View style={styles.settingLeft}>
                <item.icon size={20} color="#666" />
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              <View style={styles.settingRight}>
                {item.toggle === true ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#E0E0E0', true: '#FFD700' }}
                    thumbColor={item.value ? '#001F3F' : '#999'}
                  />
                ) : (
                  <>
                    {item.value && (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    )}
                    <ChevronRight size={16} color="#999" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.switchModeButton} onPress={() => router.replace('/mode-selection')}>
        <Text style={styles.switchModeText}>Switch to Client Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#FF5252" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Training at the Oxford</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#001F3F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  modeBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  switchModeButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#001F3F',
    borderRadius: 12,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});