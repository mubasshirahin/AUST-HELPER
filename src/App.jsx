import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoutineProvider } from './context/RoutineContext';
import Sidebar from './layout/Sidebar';
import TopNavbar from './layout/TopNavbar';
import MobileNav from './layout/MobileNav';
import AuthPage from './features/auth/AuthPage';
import NotificationRunner from './components/NotificationRunner';

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const RoutineTemplatesPage = lazy(() => import('./features/dashboard/RoutineTemplatesPage'));
const TranscriptTemplatesPage = lazy(() => import('./features/dashboard/TranscriptTemplatesPage'));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'));
const VaultPage = lazy(() => import('./features/vault/VaultPage'));
const CareerRoadmapsPage = lazy(() => import('./features/vault/CareerRoadmapsPage'));
const CheatsheetsPage = lazy(() => import('./features/vault/CheatsheetsPage'));
const CampusPage = lazy(() => import('./features/campus/CampusPage'));
const CommunityPage = lazy(() => import('./features/community/CommunityPage'));
const MarketplacePage = lazy(() => import('./features/marketplace/index.jsx'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const AdminPanelPage = lazy(() => import('./features/admin/AdminPanelPage'));
const MessagesPage = lazy(() => import('./features/messages/MessagesPage'));

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
            <Suspense fallback={<div className="page-loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<AdminRoute />} />
                <Route path="/templates" element={<RoutineTemplatesPage />} />
                <Route path="/admin/transcript-templates" element={<TranscriptTemplatesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/vault" element={<VaultPage />} />
                <Route path="/career-roadmaps" element={<CareerRoadmapsPage />} />
                <Route path="/cheatsheets" element={<CheatsheetsPage />} />
                <Route path="/campus" element={<CampusPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
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
            </Suspense>
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
