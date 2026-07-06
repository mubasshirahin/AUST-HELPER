import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../utils/messageStorage';

import {
  LayoutDashboard, CalendarDays, BarChart3, BookOpen, MapPin, Users, ShoppingBag, Settings, MessageSquare,
  ChevronLeft, ChevronRight, LogOut, LogIn, Shield, Eye, Megaphone, Utensils,
  Library, FileText, FolderOpen, FileSpreadsheet, Map, ScrollText
} from 'lucide-react';
import logoSilver from '../assets/logo-silver.png';
import logoRed from '../assets/logo-red.png';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Grade Lab', icon: BarChart3 },
  { path: '/vault', label: 'Resource Vault', icon: BookOpen },
  { path: '/campus', label: 'Campus', icon: MapPin },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { path: '/career-roadmaps', label: 'Career Roadmaps', icon: Map },
  { path: '/cheatsheets', label: 'Cheatsheets', icon: ScrollText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(() => (user?.id ? getUnreadCount(user.id) : 0));

  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) setUnread(getUnreadCount(user.id));
    }, 2000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const [logoVariant, setLogoVariant] = useState(
    () => localStorage.getItem('logoVariant') || 'silver'
  );

  const [logoClicked, setLogoClicked] = useState(false);

  const toggleLogo = () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600);
    setLogoVariant((prev) => {
      const next = prev === 'silver' ? 'red' : 'silver';
      localStorage.setItem('logoVariant', next);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
  };

  let navList = [...navItems];
  if (user?.role === 'admin') {
    // For admin users, show Admin Panel related navigation
    navList = [
      { path: '/admin', label: 'Admin Panel', icon: Shield },
      { path: '/templates', label: 'Routine Templates', icon: CalendarDays },
      { path: '/admin/transcript-templates', label: 'Transcript Templates', icon: FileSpreadsheet },
      { path: '/admin/overview', label: 'Overview', icon: Eye },
      { path: '/admin/notice-board', label: 'Notice Board', icon: Megaphone },
      { path: '/admin/canteen', label: 'Canteen', icon: Utensils },
      { path: '/admin/library', label: 'Library', icon: Library },
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/applications', label: 'Applications', icon: FileText },
      { path: '/admin/cr-sr-directory', label: 'CR/SR Directory', icon: FolderOpen },
      { path: '/messages', label: 'Messages', icon: MessageSquare },
      { path: '/settings', label: 'Settings', icon: Settings },
    ];
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-brand-row">
              <div className="logo-icon-wrapper">
                <button
                  type="button"
                  className={`logo-icon ${logoClicked ? 'clicked' : ''}`}
                  onClick={toggleLogo}
                  title="Click to switch logo"
                  aria-label="Toggle logo color"
                >
                  <img
                    src={logoVariant === 'silver' ? logoSilver : logoRed}
                    alt="AUSTWise logo"
                    className="logo-img"
                  />
                </button>
                <div className="logo-burst" aria-hidden="true">
                  <i></i><i></i><i></i><i></i>
                  <i></i><i></i><i></i><i></i>
                </div>
              </div>
            {!collapsed && (
              <div className="logo-text">
                <div className="logo-wordmark">
                  <span className="wm-ust">
                    <span className="wc">u</span>
                    <span className="wc">s</span>
                    <span className="wc">t</span>
                  </span>
                  <span className="wm-ise">
                    <span className="wc">i</span>
                    <span className="wc">s</span>
                    <span className="wc">e</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navList.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
            }
            end={item.path === '/'}
          >
            <div className="nav-icon-wrapper">
              <item.icon size={20} />
              {item.path === '/messages' && unread > 0 && (
                <span className="nav-badge">{unread > 99 ? '99+' : unread}</span>
              )}
            </div>
            {!collapsed && (
              <span className="nav-label">
                {item.label}
                {item.path === '/messages' && unread > 0 && (
                  <span className="nav-badge-inline">{unread > 99 ? '99+' : unread}</span>
                )}
              </span>
            )}
            {collapsed && <div className="nav-tooltip">{item.label}</div>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`user-card ${collapsed ? 'collapsed' : ''}`}>
          <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
            {user?.initials}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-dept">{user.department}, AUST - {user.batchName || 'Quanta'} {user.batchNo}</span>
              <span className="user-dept">{user.id}</span>
            </div>
          )}
        </div>
        {isAuthenticated ? (
          <button
            type="button"
            className={`nav-item logout-btn ${collapsed ? 'collapsed' : ''}`}
            onClick={handleLogout}
            style={{ marginTop: '8px', width: '100%', border: 'none', cursor: 'pointer' }}
          >
            <div className="nav-icon-wrapper">
              <LogOut size={18} />
            </div>
            {!collapsed && <span className="nav-label">Logout</span>}
            {collapsed && <div className="nav-tooltip">Logout</div>}
          </button>
        ) : (
          <button
            type="button"
            className={`nav-item logout-btn ${collapsed ? 'collapsed' : ''}`}
            onClick={() => navigate('/login')}
            style={{ marginTop: '8px', width: '100%', border: 'none', cursor: 'pointer' }}
          >
            <div className="nav-icon-wrapper">
              <LogIn size={18} />
            </div>
            {!collapsed && <span className="nav-label">Login / Sign up</span>}
            {collapsed && <div className="nav-tooltip">Login / Sign up</div>}
          </button>
        )}
      </div>
    </aside>
  );
}
