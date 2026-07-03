import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPortalSubtitle, getRoleLabel } from '../utils/authStorage';
import {
  LayoutDashboard, CalendarDays, BarChart3, BookOpen, MapPin, Users, ShoppingBag, Settings,
  ChevronLeft, ChevronRight, GraduationCap, LogOut, LogIn, Shield, Eye, Megaphone, Utensils,
  Library, FileText, FolderOpen, FileSpreadsheet, Map, ScrollText
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Grade Lab', icon: BarChart3 },
  { path: '/vault', label: 'Resource Vault', icon: BookOpen },
  { path: '/campus', label: 'Campus', icon: MapPin },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { path: '/career-roadmaps', label: 'Career Roadmaps', icon: Map },
  { path: '/cheatsheets', label: 'Cheatsheets', icon: ScrollText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function getUserSubtitle(user) {
  if (!user) return '';
  if (user.role === 'faculty') {
    return `${user.department} - ${user.designation || 'Faculty'}`;
  }
  if (user.role === 'alumni') {
    return `${user.department} - Batch ${user.batchNo || user.batch}${user.company ? ` - ${user.company}` : ''}`;
  }
  return `${user.department} - ${user.batch || `Batch ${user.batchNo}`}`;
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
      { path: '/settings', label: 'Settings', icon: Settings },
    ];
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <GraduationCap size={22} />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">AUST Helper</span>
              <span className="logo-subtitle">{getPortalSubtitle(user?.role)}</span>
            </div>
          )}
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
            </div>
            {!collapsed && <span className="nav-label">{item.label}</span>}
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
              <span className="user-dept">
                {isAuthenticated
                  ? `${getRoleLabel(user.role)} - ${getUserSubtitle(user)}`
                  : 'Browsing as guest'}
              </span>
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
