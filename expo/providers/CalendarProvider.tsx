import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import createContextHook from '@nkzw/create-context-hook';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  googleEventId?: string;
  acuityAppointmentId?: string;
  synced: boolean;
  lastSyncedAt?: Date;
}

interface CalendarSync {
  enabled: boolean;
  googleCalendarId?: string;
  acuityApiKey?: string;
  acuityUserId?: string;
  lastSyncTime?: Date;
  syncDirection: 'one-way' | 'two-way';
}

interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export const [CalendarProvider, useCalendar] = createContextHook(() => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [syncSettings, setSyncSettings] = useState<CalendarSync>({
    enabled: false,
    syncDirection: 'two-way'
  });
  const [googleTokens, setGoogleTokens] = useState<GoogleTokens | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Google OAuth configuration
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'fitness-tracker',
    path: 'auth/google-calendar'
  });

  const clientId = Platform.select({
    web: 'YOUR_WEB_CLIENT_ID',
    default: 'YOUR_MOBILE_CLIENT_ID'
  });

  // Load saved data
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [savedEvents, savedSettings, savedTokens] = await Promise.all([
        AsyncStorage.getItem('calendar_events'),
        AsyncStorage.getItem('calendar_sync_settings'),
        AsyncStorage.getItem('google_tokens')
      ]);

      if (savedEvents) {
        try {
          const parsed = JSON.parse(savedEvents);
          if (Array.isArray(parsed)) setEvents(parsed);
        } catch (e) {
          console.warn('Failed to parse saved events:', e);
        }
      }
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (typeof parsed === 'object') setSyncSettings(parsed);
        } catch (e) {
          console.warn('Failed to parse sync settings:', e);
        }
      }
      if (savedTokens) {
        try {
          const tokens = JSON.parse(savedTokens);
          if (tokens.expiresAt > Date.now()) {
            setGoogleTokens(tokens);
          }
        } catch (e) {
          console.warn('Failed to parse Google tokens:', e);
        }
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  // Google Calendar Authentication
  const authenticateGoogle = async () => {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: clientId!,
        scopes: ['https://www.googleapis.com/auth/calendar'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge: AuthSession.AuthRequest.PKCE.codeChallenge,
        extraParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success' && result.params.code) {
        // Exchange code for tokens
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: clientId!,
            code: result.params.code,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier!
            }
          },
          discovery
        );

        const tokens: GoogleTokens = {
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken,
          expiresAt: Date.now() + (tokenResult.expiresIn || 3600) * 1000
        };

        setGoogleTokens(tokens);
        await AsyncStorage.setItem('google_tokens', JSON.stringify(tokens));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google auth error:', error);
      setSyncError('Failed to authenticate with Google');
      return false;
    }
  };

  // Fetch Google Calendar Events
  const fetchGoogleCalendarEvents = async () => {
    if (!googleTokens) return [];

    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
        new URLSearchParams({
          maxResults: '100',
          orderBy: 'startTime',
          singleEvents: 'true',
          timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          timeMax: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }),
        {
          headers: {
            Authorization: `Bearer ${googleTokens.accessToken}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch Google Calendar events');

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar:', error);
      throw error;
    }
  };

  // Create Google Calendar Event
  const createGoogleCalendarEvent = async (event: CalendarEvent) => {
    if (!googleTokens) return null;

    try {
      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: event.attendees?.map(email => ({ email }))
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleTokens.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(googleEvent)
        }
      );

      if (!response.ok) throw new Error('Failed to create Google Calendar event');

      const createdEvent = await response.json();
      return createdEvent.id;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  };

  // Sync with Google Calendar
  const syncWithGoogle = async () => {
    if (!syncSettings.enabled || !googleTokens) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Fetch events from Google Calendar
      const googleEvents = await fetchGoogleCalendarEvents();

      // Convert Google events to our format
      const convertedEvents: CalendarEvent[] = googleEvents.map((gEvent: any) => ({
        id: `google_${gEvent.id}`,
        googleEventId: gEvent.id,
        title: gEvent.summary || 'Untitled',
        description: gEvent.description,
        startTime: new Date(gEvent.start.dateTime || gEvent.start.date),
        endTime: new Date(gEvent.end.dateTime || gEvent.end.date),
        location: gEvent.location,
        attendees: gEvent.attendees?.map((a: any) => a.email),
        synced: true,
        lastSyncedAt: new Date()
      }));

      // Merge with existing events
      const mergedEvents = [...events];
      
      convertedEvents.forEach(gEvent => {
        const existingIndex = mergedEvents.findIndex(
          e => e.googleEventId === gEvent.googleEventId
        );
        
        if (existingIndex >= 0) {
          mergedEvents[existingIndex] = { ...mergedEvents[existingIndex], ...gEvent };
        } else {
          mergedEvents.push(gEvent);
        }
      });

      // If two-way sync, push local events to Google
      if (syncSettings.syncDirection === 'two-way') {
        const localOnlyEvents = mergedEvents.filter(e => !e.googleEventId && !e.synced);
        
        for (const event of localOnlyEvents) {
          try {
            const googleEventId = await createGoogleCalendarEvent(event);
            event.googleEventId = googleEventId;
            event.synced = true;
            event.lastSyncedAt = new Date();
          } catch (error) {
            console.error('Failed to sync event to Google:', error);
          }
        }
      }

      setEvents(mergedEvents);
      await AsyncStorage.setItem('calendar_events', JSON.stringify(mergedEvents));

      const updatedSettings = {
        ...syncSettings,
        lastSyncTime: new Date()
      };
      setSyncSettings(updatedSettings);
      await AsyncStorage.setItem('calendar_sync_settings', JSON.stringify(updatedSettings));

    } catch (error) {
      console.error('Sync error:', error);
      setSyncError('Failed to sync with Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add local event
  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'synced'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `local_${Date.now()}`,
      synced: false
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    await AsyncStorage.setItem('calendar_events', JSON.stringify(updatedEvents));

    // Sync to Google if enabled
    if (syncSettings.enabled && syncSettings.syncDirection === 'two-way') {
      try {
        const googleEventId = await createGoogleCalendarEvent(newEvent);
        newEvent.googleEventId = googleEventId;
        newEvent.synced = true;
        newEvent.lastSyncedAt = new Date();
        
        const index = updatedEvents.findIndex(e => e.id === newEvent.id);
        updatedEvents[index] = newEvent;
        setEvents(updatedEvents);
        await AsyncStorage.setItem('calendar_events', JSON.stringify(updatedEvents));
      } catch (error) {
        console.error('Failed to sync new event to Google:', error);
      }
    }

    return newEvent;
  };

  // Update sync settings
  const updateSyncSettings = async (settings: Partial<CalendarSync>) => {
    const updated = { ...syncSettings, ...settings };
    setSyncSettings(updated);
    await AsyncStorage.setItem('calendar_sync_settings', JSON.stringify(updated));
  };

  // Disconnect Google Calendar
  const disconnectGoogle = async () => {
    setGoogleTokens(null);
    await AsyncStorage.removeItem('google_tokens');
    
    const updated = {
      ...syncSettings,
      enabled: false,
      googleCalendarId: undefined
    };
    setSyncSettings(updated);
    await AsyncStorage.setItem('calendar_sync_settings', JSON.stringify(updated));
  };

  return {
    events,
    syncSettings,
    googleTokens,
    isSyncing,
    syncError,
    authenticateGoogle,
    syncWithGoogle,
    addEvent,
    updateSyncSettings,
    disconnectGoogle,
    isGoogleConnected: !!googleTokens
  };
});