import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

export type AppMode = 'client' | 'trainer';

export interface User {
  id: string;
  name: string;
  email: string;
  mode: AppMode;
}

export const [AppModeProvider, useAppMode] = createContextHook(() => {
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't load stored mode - always start fresh at mode selection
    setIsLoading(false);
  }, []);

  const switchToClientMode = async (user: User) => {
    setAppMode('client');
    setCurrentUser(user);
  };

  const switchToTrainerMode = async (user: User) => {
    setAppMode('trainer');
    setCurrentUser(user);
  };

  const logout = async () => {
    setAppMode(null);
    setCurrentUser(null);
  };

  return {
    appMode,
    currentUser,
    isLoading,
    switchToClientMode,
    switchToTrainerMode,
    logout,
  };
});