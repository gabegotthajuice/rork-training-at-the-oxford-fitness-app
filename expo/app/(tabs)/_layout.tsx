import { Tabs } from "expo-router";
import { Home, TrendingUp, Calendar, User, Users } from "lucide-react-native";
import React from "react";
import colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.titanium,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.glass.border,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
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
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: "Metrics",
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="identity"
        options={{
          title: "Identity",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}