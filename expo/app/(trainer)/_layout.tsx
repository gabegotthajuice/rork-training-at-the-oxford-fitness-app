import { Tabs } from 'expo-router';
import React from 'react';
import { Users, Calendar, TrendingUp, MessageSquare, Settings, Scan, Package } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function TrainerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.titanium,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.glass.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.glass.border,
        },
        headerTintColor: colors.secondary,
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: -0.5,
        },
      }}
    >
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="body-scan"
        options={{
          title: 'Body Scan',
          tabBarIcon: ({ color }) => <Scan size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}