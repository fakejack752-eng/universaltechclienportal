import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types/index.ts';
import { api } from '../api/client.ts';

export type PortalView =
  | 'landing'
  | 'login'
  | 'overview'
  | 'services'
  | 'projects'
  | 'project_detail'
  | 'requests'
  | 'documents'
  | 'messages'
  | 'billing'
  | 'support'
  | 'team_settings'
  | 'admin_organizations'
  | 'admin_integrations'
  | 'admin_audit'
  | 'admin_security_tests'
  | 'system_documentation';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  permissions: {
    canViewBilling: boolean;
    canApproveDeliverables: boolean;
    canManageTeam: boolean;
    canAccessInternalNotes: boolean;
    isAdmin: boolean;
    isStaff: boolean;
  };
  loading: boolean;
  error: string | null;
  currentView: PortalView;
  setCurrentView: (view: PortalView) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  demoUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    title: string;
    organizationName: string;
    canViewBilling: boolean;
  }>;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  goToLanding: () => void;
  goToLogin: () => void;
  goToPortal: () => void;
  switchPersona: (userId: string) => Promise<void>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [permissions, setPermissions] = useState({
    canViewBilling: false,
    canApproveDeliverables: false,
    canManageTeam: false,
    canAccessInternalNotes: false,
    isAdmin: false,
    isStaff: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<PortalView>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [meData, demoList] = await Promise.all([api.getMe(), api.getDemoUsers()]);
      setUser(meData.user);
      setOrganization(meData.organization);
      setPermissions(meData.permissions);
      setDemoUsers(demoList);
    } catch (err: any) {
      console.error('Failed to load user state:', err);
      setError(err.message || 'Session verification failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'landing') {
        setCurrentView('landing');
      } else if (viewParam === 'login') {
        setCurrentView('login');
      }
    }
    loadData();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(email, password);
      setUser(res.user);
      setOrganization(res.organization);
      setPermissions(res.permissions);
      setCurrentView('overview');
      showToast(`Welcome back, ${res.user.fullName}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setOrganization(null);
    setCurrentView('landing');
    showToast('Signed out of Universal Tech client portal', 'info');
  };

  const goToLanding = () => {
    setCurrentView('landing');
  };

  const goToLogin = () => {
    setCurrentView('login');
  };

  const goToPortal = () => {
    if (user) {
      setCurrentView('overview');
    } else {
      setCurrentView('login');
    }
  };

  const switchPersona = async (userId: string) => {
    try {
      setLoading(true);
      const res = await api.switchDemo(userId);
      setUser(res.user);
      setOrganization(res.organization);
      setPermissions(res.permissions);
      setSelectedProjectId(null);
      setCurrentView('overview');
      showToast(`Switched persona to ${res.user.fullName} (${res.user.role})`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch demo persona', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        permissions,
        loading,
        error,
        currentView,
        setCurrentView,
        selectedProjectId,
        setSelectedProjectId,
        demoUsers,
        login,
        logout,
        goToLanding,
        goToLogin,
        goToPortal,
        switchPersona,
        darkMode,
        toggleDarkMode,
        toast,
        showToast,
        refreshState: loadData,
      }}
    >
      <div className={darkMode ? 'dark' : ''}>{children}</div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
