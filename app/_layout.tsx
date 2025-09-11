import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClientProvider } from "@/providers/ClientProvider";
import { AppModeProvider } from "@/providers/AppModeProvider";
import { CloudSyncProvider } from "@/providers/CloudSyncProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CalendarProvider } from "@/providers/CalendarProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      // Prevent JSON parse errors
      structuralSharing: false,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#001F3F',
      },
      headerTintColor: '#FFD700',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="_index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(trainer)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="mode-selection" options={{ headerShown: false }} />
      <Stack.Screen name="progress-photo" options={{ 
        title: "Progress Photo",
        presentation: "modal" 
      }} />
      <Stack.Screen name="trainer-client-detail" options={{ 
        title: "Client Details",
        headerShown: true
      }} />
      <Stack.Screen name="trainer-add-client" options={{ 
        title: "Add Client",
        headerShown: true,
        presentation: "modal"
      }} />
      <Stack.Screen name="trainer-session-detail" options={{ 
        title: "Session Details",
        headerShown: true
      }} />
      <Stack.Screen name="trainer-add-session" options={{ 
        title: "Add Session",
        headerShown: true,
        presentation: "modal"
      }} />
      <Stack.Screen name="client-input" options={{ 
        title: "Update Information",
        headerShown: false
      }} />
      <Stack.Screen name="packages" options={{ 
        title: "Training Packages",
        headerShown: true
      }} />
      <Stack.Screen name="calendar-sync" options={{ 
        title: "Calendar Integration",
        headerShown: false
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppModeProvider>
            <ClientProvider>
              <CloudSyncProvider>
                <CalendarProvider>
                  <RootLayoutNav />
                </CalendarProvider>
              </CloudSyncProvider>
            </ClientProvider>
          </AppModeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}