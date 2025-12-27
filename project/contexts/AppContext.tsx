import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OFFLINE_HISTORY } from '@/utils/offlineData';

export interface Alert {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  location?: string;
  timestamp: Date;
  completed: boolean;
  photo?: string;
  voiceNote?: string;
}

export interface User {
  name: string;
  phone: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  markSafe: (alertId: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: 'en' | 'hi' | 'te';
  setLanguage: (lang: 'en' | 'hi' | 'te') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en');

  const addAlert = (alertData: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const markSafe = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, completed: true } : alert
    ));
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      alerts,
      addAlert,
      markSafe,
      darkMode,
      toggleDarkMode,
      language,
      setLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}