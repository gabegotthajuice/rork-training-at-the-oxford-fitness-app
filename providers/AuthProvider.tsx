import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'trainer';
  profileImage?: string;
  trainerId?: string;
  createdAt: string;
  lastLogin: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const AUTH_API_URL = 'https://toolkit.rork.com/text/llm/';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null,
  });

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('userData'),
      ]);

      if (token && userData) {
        try {
          // AsyncStorage always returns strings, safely parse
          let user: User;
          if (typeof userData === 'string') {
            user = JSON.parse(userData);
          } else {
            // This shouldn't happen with AsyncStorage, but handle it
            console.warn('Unexpected non-string userData from AsyncStorage');
            user = userData as User;
          }
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            token,
          });
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem('userData');
          await AsyncStorage.removeItem('authToken');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Failed to load authentication' }));
    }
  };

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Simulate API call - replace with actual backend
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'Simulate user authentication. Return success with user data.'
          }, {
            role: 'user',
            content: `Login attempt: ${email}`
          }]
        }),
      });

      if (!response.ok) throw new Error('Login failed');

      // Mock user data - replace with actual response
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: email.includes('trainer') ? 'trainer' : 'client',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return { user: mockUser, token: mockToken };
    },
    onSuccess: async ({ user, token }) => {
      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('userData', JSON.stringify(user)),
        AsyncStorage.setItem('userRole', user.role),
      ]);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token,
      });

      queryClient.invalidateQueries();
    },
    onError: (error) => {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Login failed',
        isLoading: false,
      }));
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({ email, password, name, role }: {
      email: string;
      password: string;
      name: string;
      role: 'client' | 'trainer';
    }) => {
      // Simulate API call
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'Simulate user registration. Return success with new user data.'
          }, {
            role: 'user',
            content: `Register: ${email}, ${name}, ${role}`
          }]
        }),
      });

      if (!response.ok) throw new Error('Signup failed');

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return { user: newUser, token };
    },
    onSuccess: async ({ user, token }) => {
      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('userData', JSON.stringify(user)),
        AsyncStorage.setItem('userRole', user.role),
      ]);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token,
      });

      queryClient.invalidateQueries();
    },
    onError: (error) => {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Signup failed',
        isLoading: false,
      }));
    },
  });

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('userData'),
        AsyncStorage.removeItem('userRole'),
      ]);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
      });

      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  const linkTrainer = async (trainerId: string) => {
    if (!authState.user || authState.user.role !== 'client') return;

    const updatedUser = { ...authState.user, trainerId };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));

    // Sync with cloud
    await syncWithTrainer(trainerId);
  };

  const syncWithTrainer = async (trainerId: string) => {
    try {
      // Simulate syncing with trainer's account
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'Sync client data with trainer account.'
          }, {
            role: 'user',
            content: `Link client ${authState.user?.id} with trainer ${trainerId}`
          }]
        }),
      });

      if (!response.ok) throw new Error('Sync failed');
      
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      return false;
    }
  };

  return {
    ...authState,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout,
    updateProfile,
    linkTrainer,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    loginError: loginMutation.error?.message,
    signupError: signupMutation.error?.message,
  };
});