
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Theme, MOCRequest, Asset, Notification, Facility, RegulatoryStandard, UsefulLink } from '../types';
import { storageService } from '../services/storageService';

interface AppContextType {
  user: User | null;
  language: Language;
  theme: Theme;
  mocs: MOCRequest[];
  assets: Asset[];
  facilities: Facility[];
  users: User[];
  standards: RegulatoryStandard[];
  usefulLinks: UsefulLink[];
  notifications: Notification[];
  loading: boolean;
  emergencyWizardActive: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  refreshMOCs: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  refreshFacilities: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshStandards: () => Promise<void>;
  refreshLinks: () => Promise<void>;
  saveAsset: (asset: Asset) => Promise<void>;
  deleteAsset: (tag: string) => Promise<void>;
  saveFacility: (facility: Facility) => Promise<void>;
  deleteFacility: (id: string) => Promise<void>;
  saveUser: (user: User) => Promise<void>;
  saveStandard: (standard: RegulatoryStandard) => Promise<void>;
  deleteStandard: (id: string) => Promise<void>;
  saveUsefulLink: (link: UsefulLink) => Promise<void>;
  deleteUsefulLink: (id: string) => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  register: (name: string, email: string, role: User['role']) => Promise<boolean>;
  recoverPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  startEmergencyMOC: () => void;
  closeEmergencyMOC: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'moc_studio_auth';
const NOTIFICATIONS_STORAGE_KEY = 'moc_studio_notifications';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('moc_lang') as Language) || 'en-US';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('moc_theme') as Theme) || 'light';
  });
  
  const [mocs, setMocs] = useState<MOCRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [standards, setStandards] = useState<RegulatoryStandard[]>([]);
  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyWizardActive, setEmergencyWizardActive] = useState(false);

  useEffect(() => {
    const init = async () => {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) setUser(JSON.parse(storedAuth));
      
      const storedNotifs = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      
      await Promise.all([refreshMOCs(), refreshAssets(), refreshFacilities(), refreshUsers(), refreshStandards(), refreshLinks()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('moc_theme', theme);
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('moc_lang', lang);
  };

  const setTheme = (theme: Theme) => setThemeState(theme);

  const refreshMOCs = async () => {
    const data = await storageService.getMOCs();
    setMocs(data);
  };

  const refreshAssets = async () => {
    const data = await storageService.getAssets();
    setAssets(data);
  };

  const refreshFacilities = async () => {
    const data = await storageService.getFacilities();
    setFacilities(data);
  };

  const refreshUsers = async () => {
    const data = await storageService.getUsers();
    setUsers(data);
  };

  const refreshStandards = async () => {
    const data = await storageService.getStandards();
    setStandards(data);
  };

  const refreshLinks = async () => {
    const data = await storageService.getLinks();
    setUsefulLinks(data);
  };

  const saveAsset = async (asset: Asset) => {
    await storageService.saveAsset(asset);
    await refreshAssets();
  };

  const deleteAsset = async (tag: string) => {
    await storageService.deleteAsset(tag);
    await refreshAssets();
  };

  const saveFacility = async (facility: Facility) => {
    await storageService.saveFacility(facility);
    await refreshFacilities();
  };

  const deleteFacility = async (id: string) => {
    await storageService.deleteFacility(id);
    await refreshFacilities();
  };

  const saveUser = async (u: User) => {
    await storageService.saveUser(u);
    await refreshUsers();
    // If the updated user is the current user, update session
    if (user?.id === u.id) {
      setUser(u);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    }
  };

  const saveStandard = async (s: RegulatoryStandard) => {
    await storageService.saveStandard(s);
    await refreshStandards();
  };

  const deleteStandard = async (id: string) => {
    await storageService.deleteStandard(id);
    await refreshStandards();
  };

  const saveUsefulLink = async (link: UsefulLink) => {
    await storageService.saveLink(link);
    await refreshLinks();
  };

  const deleteUsefulLink = async (id: string) => {
    await storageService.deleteLink(id);
    await refreshLinks();
  };

  const login = async (email: string, _password: string, rememberMe: boolean) => {
    const users = await storageService.getUsers();
    const found = users.find(u => u.email === email);
    
    const loggedUser: User = found || { 
      id: 'U01', 
      name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '), 
      email, 
      role: email.includes('manager') ? 'Manager' : email.includes('auditor') ? 'Auditor' : 'Engineer' 
    };
    setUser(loggedUser);
    if (rememberMe) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
    return true;
  };

  const register = async (name: string, email: string, role: User['role']) => {
    const mockUser: User = { id: Date.now().toString(), name, email, role, status: 'Active' };
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    await saveUser(mockUser);
    return true;
  };

  const recoverPassword = async (_email: string) => true;

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };
    const updated = [newNotif, ...notifications].slice(0, 50);
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  };

  const startEmergencyMOC = () => setEmergencyWizardActive(true);
  const closeEmergencyMOC = () => setEmergencyWizardActive(false);

  return (
    <AppContext.Provider value={{
      user, language, theme, mocs, assets, facilities, users, standards, usefulLinks, notifications, loading, emergencyWizardActive,
      setLanguage, setTheme, refreshMOCs, refreshAssets, refreshFacilities, refreshUsers, refreshStandards, refreshLinks,
      saveAsset, deleteAsset, saveFacility, deleteFacility, saveUser, saveStandard, deleteStandard, saveUsefulLink, deleteUsefulLink,
      login, register, recoverPassword, logout, addNotification,
      markNotificationAsRead, markAllNotificationsAsRead, clearNotifications,
      startEmergencyMOC, closeEmergencyMOC
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
