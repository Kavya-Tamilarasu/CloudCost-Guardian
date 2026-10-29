import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CloudResource,
  DetectionRule,
  WasteDetection,
  Alert,
  Recommendation,
  DashboardSummary,
  UserSession,
  AlertStatus,
} from '../types/cloud';
import * as api from '../services/api';

export type NavigationTab =
  | 'dashboard'
  | 'resources'
  | 'waste'
  | 'costs'
  | 'alerts'
  | 'recommendations'
  | 'rules'
  | 'reports'
  | 'settings';

export type Currency = 'INR' | 'USD';

export interface AppSettings {
  cloudProvider: 'AWS' | 'Azure' | 'GCP';
  currency: Currency;
  thresholdSensitivity: 'Conservative' | 'Balanced' | 'Aggressive';
  scanIntervalMinutes: number;
  inAppNotifications: boolean;
  emailNotifications: boolean;
  emailRecipient: string;
  awsDefaultRegion: string;
  awsAccessKeyPlaceholder: string;
  awsSecretKeyPlaceholder: string;
}

interface AppContextType {
  currentView: NavigationTab;
  setCurrentView: (view: NavigationTab) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCost: (amountInInr: number) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: UserSession;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  
  // Data
  summary: DashboardSummary | null;
  resources: CloudResource[];
  wasteDetections: WasteDetection[];
  alerts: Alert[];
  recommendations: Recommendation[];
  rules: DetectionRule[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  isScanning: boolean;
  runScan: () => Promise<void>;

  // Settings
  settings: AppSettings;
  saveSettings: (updates: Partial<AppSettings>) => void;
  
  // Selection
  selectedResource: CloudResource | null;
  setSelectedResource: (res: CloudResource | null) => void;
  selectedRuleForEdit: DetectionRule | null;
  setSelectedRuleForEdit: (rule: DetectionRule | null) => void;
  
  // Mutators
  handleUpdateAlertStatus: (id: string, status: AlertStatus) => Promise<void>;
  handleUpdateRecommendationStatus: (id: string, status: 'Pending' | 'Approved' | 'Dismissed') => Promise<void>;
  handleUpdateRule: (id: string, updates: { enabled?: boolean; threshold?: number | string; severity?: string }) => Promise<void>;
  
  // Quick stats
  unreadAlertsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<NavigationTab>('dashboard');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [user, setUser] = useState<UserSession>({
    isAuthenticated: true,
    email: 'admin@cloudcostguardian.edu',
    name: 'Prof. Cloud Admin',
    role: 'Cloud FinOps Administrator',
  });

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [wasteDetections, setWasteDetections] = useState<WasteDetection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [settings, setSettings] = useState<AppSettings>({
    cloudProvider: 'AWS',
    currency: 'INR',
    thresholdSensitivity: 'Balanced',
    scanIntervalMinutes: 60,
    inAppNotifications: true,
    emailNotifications: false,
    emailRecipient: 'admin@cloudcostguardian.edu',
    awsDefaultRegion: 'ap-south-1',
    awsAccessKeyPlaceholder: 'AKIAIOSFODNN7EXAMPLE',
    awsSecretKeyPlaceholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  });

  const saveSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    if (updates.currency) {
      setCurrency(updates.currency);
    }
  };

  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<DetectionRule | null>(null);

  // Sync dark theme with HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sumData, resData, wasteData, alertData, recData, ruleData] = await Promise.all([
        api.fetchDashboardSummary(),
        api.fetchResources(),
        api.fetchWasteDetections(),
        api.fetchAlerts(),
        api.fetchRecommendations(),
        api.fetchRules(),
      ]);
      setSummary(sumData);
      setResources(resData);
      setWasteDetections(wasteData);
      setAlerts(alertData);
      setRecommendations(recData);
      setRules(ruleData);
    } catch (err) {
      console.error('Error loading initial CloudCost Guardian data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const runScan = async () => {
    setIsScanning(true);
    try {
      await api.triggerReEvaluation();
      await loadAllData();
    } catch (err) {
      console.error('Error during cloud scan:', err);
    } finally {
      setTimeout(() => setIsScanning(false), 500);
    }
  };

  const handleUpdateAlertStatus = async (id: string, status: AlertStatus) => {
    try {
      await api.updateAlertStatus(id, status);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error('Error updating alert:', err);
    }
  };

  const handleUpdateRecommendationStatus = async (id: string, status: 'Pending' | 'Approved' | 'Dismissed') => {
    try {
      await api.updateRecommendationStatus(id, status);
      setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error('Error updating recommendation:', err);
    }
  };

  const handleUpdateRule = async (
    id: string,
    updates: { enabled?: boolean; threshold?: number | string; severity?: string }
  ) => {
    try {
      const { rule, summary: updatedSummary } = await api.updateRule(id, updates);
      setRules((prev) => prev.map((r) => (r.id === id ? rule : r)));
      if (updatedSummary) {
        setSummary(updatedSummary);
      }
      // Refresh resources and detections because thresholds or enabled state changed
      const [resData, wasteData, alertData, recData] = await Promise.all([
        api.fetchResources(),
        api.fetchWasteDetections(),
        api.fetchAlerts(),
        api.fetchRecommendations(),
      ]);
      setResources(resData);
      setWasteDetections(wasteData);
      setAlerts(alertData);
      setRecommendations(recData);
    } catch (err) {
      console.error('Error updating rule:', err);
    }
  };

  const formatCost = (amountInInr: number): string => {
    if (currency === 'USD') {
      const inUsd = amountInInr / 83.2;
      return `$${inUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `₹${Math.round(amountInInr).toLocaleString('en-IN')}`;
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const loggedUser = await api.loginAdmin(email, pass);
      setUser(loggedUser);
      setIsAuthModalOpen(false);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setUser({
      isAuthenticated: false,
      email: '',
      name: 'Guest User',
      role: 'Viewer',
    });
  };

  const unreadAlertsCount = alerts.filter((a) => a.status === 'Active').length;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currency,
        setCurrency,
        formatCost,
        theme,
        toggleTheme,
        user,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        summary,
        resources,
        wasteDetections,
        alerts,
        recommendations,
        rules,
        loading,
        isLoading: loading,
        error,
        isScanning,
        runScan,
        settings,
        saveSettings,
        selectedResource,
        setSelectedResource,
        selectedRuleForEdit,
        setSelectedRuleForEdit,
        handleUpdateAlertStatus,
        handleUpdateRecommendationStatus,
        handleUpdateRule,
        unreadAlertsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
