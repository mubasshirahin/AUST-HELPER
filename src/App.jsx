import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoutineProvider } from './context/RoutineContext';
import Sidebar from './layout/Sidebar';
import TopNavbar from './layout/TopNavbar';
import MobileNav from './layout/MobileNav';
import AuthPage from './features/auth/AuthPage';
import NotificationRunner from './components/NotificationRunner';

import DashboardPage from './features/dashboard/DashboardPage';
import RoutineTemplatesPage from './features/dashboard/RoutineTemplatesPage';
import TranscriptTemplatesPage from './features/dashboard/TranscriptTemplatesPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import VaultPage from './features/vault/VaultPage';
import CampusPage from './features/campus/CampusPage';
import CommunityPage from './features/community/CommunityPage';
import MarketplacePage from './features/marketplace/index.jsx';
import SettingsPage from './features/settings/SettingsPage';
import AdminPanelPage from './features/admin/AdminPanelPage';

import './App.css';

// Admin Route - redirects admin users to admin panel
function AdminRoute() {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <DashboardPage />;
}

// Main App Content Component
function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <RoutineProvider>
      <NotificationRunner />
      <div className="app-layout">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <TopNavbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="page-wrapper">
            <Routes>
              <Route path="/" element={<AdminRoute />} />
              <Route path="/templates" element={<RoutineTemplatesPage />} />
              <Route path="/admin/transcript-templates" element={<TranscriptTemplatesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/vault" element={<VaultPage />} />
              <Route path="/campus" element={<CampusPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="/admin/overview" element={<AdminPanelPage />} />
              <Route path="/admin/notice-board" element={<AdminPanelPage />} />
              <Route path="/admin/canteen" element={<AdminPanelPage />} />
              <Route path="/admin/library" element={<AdminPanelPage />} />
              <Route path="/admin/users" element={<AdminPanelPage />} />
              <Route path="/admin/applications" element={<AdminPanelPage />} />
              <Route path="/admin/cr-sr-directory" element={<AdminPanelPage />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
        <MobileNav />
      </div>
    </RoutineProvider>
  );
}

// Root App Shell with Auth Check
function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#08090a',
        color: '#a1a1aa',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If not authenticated, show only the login page
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // If authenticated, show the full app
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;