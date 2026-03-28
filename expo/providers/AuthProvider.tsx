import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import createContextHook from '@nkzw/create-context-hook';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'client' | 'trainer';
  profileImage?: string;
  trainerId?: string;
  createdAt: string;
  lastLogin: string;
  authProvider?: 'google' | 'apple' | 'squarespace' | 'email';
  squarespaceCustomerId?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  profile?: {
    phone?: string;
    dateOfBirth?: string;
    height?: number;
    currentWeight?: number;
    targetWeight?: number;
    fitnessGoals?: string[];
    medicalConditions?: string[];
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  hasCompletedOnboarding: boolean;
  hasCompletedProfileSetup: boolean;
}

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const SQUARESPACE_CLIENT_ID = process.env.EXPO_PUBLIC_SQUARESPACE_CLIENT_ID || '';

// Secure storage helpers
const secureStorage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

WebBrowser.maybeCompleteAuthSession();

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null,
    hasCompletedOnboarding: false,
    hasCompletedProfileSetup: false,
  });

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userData, onboardingStatus, profileStatus] = await Promise.all([
        secureStorage.getItem('authToken'),
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('onboardingCompleted'),
        AsyncStorage.getItem('profileSetupCompleted'),
      ]);

      if (token && userData) {
        try {
          let user: User;
          if (typeof userData === 'string') {
            user = JSON.parse(userData);
          } else {
            console.warn('Unexpected non-string userData from AsyncStorage');
            user = userData as User;
          }
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            token,
            hasCompletedOnboarding: onboardingStatus === 'true',
            hasCompletedProfileSetup: profileStatus === 'true',
          });
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          await Promise.all([
            AsyncStorage.removeItem('userData'),
            secureStorage.removeItem('authToken'),
          ]);
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

  // Google OAuth
  const [googleRequest, googleResponse, googlePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri(),
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleAuth(googleResponse.params.code);
    }
  }, [googleResponse]);

  const handleGoogleAuth = async (code: string) => {
    try {
      // Exchange code for tokens and user info
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          code,
          grant_type: 'authorization_code',
          redirect_uri: AuthSession.makeRedirectUri(),
        }),
      });

      const tokens = await tokenResponse.json();
      
      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const googleUser = await userResponse.json();
      
      const user: User = {
        id: `google_${googleUser.id}`,
        email: googleUser.email,
        name: googleUser.name,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        profileImage: googleUser.picture,
        role: 'client',
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await saveAuthData(user, tokens.access_token);
    } catch (error) {
      console.error('Google auth error:', error);
      setAuthState(prev => ({ ...prev, error: 'Google authentication failed' }));
    }
  };

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Mock authentication - replace with actual backend
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: email.includes('trainer') ? 'trainer' : 'client',
        authProvider: 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return { user: mockUser, token: mockToken };
    },
    onSuccess: async ({ user, token }) => {
      await saveAuthData(user, token);
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
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role,
        authProvider: 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return { user: newUser, token };
    },
    onSuccess: async ({ user, token }) => {
      await saveAuthData(user, token);
    },
    onError: (error) => {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Signup failed',
        isLoading: false,
      }));
    },
  });

  // Save auth data helper
  const saveAuthData = async (user: User, token: string) => {
    const [onboardingStatus, profileStatus] = await Promise.all([
      AsyncStorage.getItem('onboardingCompleted'),
      AsyncStorage.getItem('profileSetupCompleted'),
    ]);

    await Promise.all([
      secureStorage.setItem('authToken', token),
      AsyncStorage.setItem('userData', JSON.stringify(user)),
      AsyncStorage.setItem('userRole', user.role),
    ]);

    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      token,
      hasCompletedOnboarding: onboardingStatus === 'true',
      hasCompletedProfileSetup: profileStatus === 'true',
    });

    queryClient.invalidateQueries();
  };

  // Apple Sign-In
  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const user: User = {
        id: `apple_${credential.user}`,
        email: credential.email || '',
        name: credential.fullName ? 
          `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
          'Apple User',
        firstName: credential.fullName?.givenName || undefined,
        lastName: credential.fullName?.familyName || undefined,
        role: 'client',
        authProvider: 'apple',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await saveAuthData(user, credential.identityToken || '');
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled
        return;
      }
      console.error('Apple Sign-In error:', error);
      setAuthState(prev => ({ ...prev, error: 'Apple Sign-In failed' }));
    }
  };

  // Squarespace OAuth - Links account for package/session tracking
  const signInWithSquarespace = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri();
      const state = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(),
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      const authUrl = `https://login.squarespace.com/api/1/login/oauth/provider/authorize?` +
        `client_id=${SQUARESPACE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=website.read,website.orders,commerce.read&` +
        `state=${state}&` +
        `response_type=code`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          await handleSquarespaceAuth(code);
        }
      }
    } catch (error) {
      console.error('Squarespace auth error:', error);
      setAuthState(prev => ({ ...prev, error: 'Squarespace authentication failed' }));
    }
  };

  const handleSquarespaceAuth = async (code: string) => {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://login.squarespace.com/api/1/login/oauth/provider/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SQUARESPACE_CLIENT_ID,
          client_secret: process.env.EXPO_PUBLIC_SQUARESPACE_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: AuthSession.makeRedirectUri(),
        }),
      });

      const tokens = await tokenResponse.json();
      
      // Get user info and subscription data from Squarespace
      const userResponse = await fetch('https://api.squarespace.com/1.0/authorization/website', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const squarespaceData = await userResponse.json();
      
      // Get customer orders/subscriptions for package tracking
      const ordersResponse = await fetch('https://api.squarespace.com/1.0/commerce/orders', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const ordersData = await ordersResponse.json();
      
      const user: User = {
        id: `squarespace_${squarespaceData.websiteId}`,
        email: squarespaceData.ownerEmail || 'squarespace@example.com',
        name: squarespaceData.title || 'Squarespace User',
        role: 'client',
        authProvider: 'squarespace',
        squarespaceCustomerId: squarespaceData.websiteId,
        subscription: {
          plan: 'active',
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await saveAuthData(user, tokens.access_token);
      
      // Store Squarespace customer data for package/session tracking
      await AsyncStorage.setItem('squarespaceCustomerId', squarespaceData.websiteId);
      await AsyncStorage.setItem('squarespaceOrders', JSON.stringify(ordersData.result || []));
      
      console.log('Squarespace account linked successfully for package tracking');
    } catch (error) {
      console.error('Squarespace token exchange error:', error);
      setAuthState(prev => ({ ...prev, error: 'Squarespace authentication failed' }));
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        secureStorage.removeItem('authToken'),
        AsyncStorage.removeItem('userData'),
        AsyncStorage.removeItem('userRole'),
        AsyncStorage.removeItem('onboardingCompleted'),
        AsyncStorage.removeItem('profileSetupCompleted'),
      ]);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
        hasCompletedOnboarding: false,
        hasCompletedProfileSetup: false,
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
      // Sync with backend through tRPC
      // This would be implemented in your backend
      console.log(`Syncing client ${authState.user?.id} with trainer ${trainerId}`);
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      return false;
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    setAuthState(prev => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const completeProfileSetup = async () => {
    await AsyncStorage.setItem('profileSetupCompleted', 'true');
    setAuthState(prev => ({ ...prev, hasCompletedProfileSetup: true }));
  };

  // Check if Apple Sign-In is available
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleSignInAvailable);
    }
  }, []);

  return {
    ...authState,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    signInWithGoogle: googlePromptAsync,
    signInWithApple,
    signInWithSquarespace,
    logout,
    updateProfile,
    linkTrainer,
    completeOnboarding,
    completeProfileSetup,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    isAppleSignInAvailable,
    loginError: loginMutation.error?.message,
    signupError: signupMutation.error?.message,
  };
});