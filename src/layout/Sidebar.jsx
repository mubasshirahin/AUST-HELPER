import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../utils/messageStorage';

import {
  LayoutDashboard, CalendarDays, BarChart3, BookOpen, MapPin, Users, ShoppingBag, Settings, MessageSquare,
  LogIn, Shield, Eye, Megaphone, Utensils,
  Library, FileText, FolderOpen, FileSpreadsheet, Map, ScrollText,
  ChevronLeft, ChevronRight, ExternalLink, Moon, Crown, School, ClipboardCheck, Code2,  DollarSign, UtensilsCrossed, Banknote, NotebookPen, DoorOpen, Flame, Award, AlarmClock, Globe
} from 'lucide-react';
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
  { path: '/shadow', label: 'Shadow', icon: Moon },
  { path: '/pro', label: 'AUSTWise Pro', icon: Crown },
  { path: '/workspace', label: 'Workspace', icon: ExternalLink },
  { path: '/exam-checklist', label: 'Exam Checklist', icon: ClipboardCheck },
  { path: '/cp-hub', label: 'CP Hub', icon: Code2 },
  { path: '/money-tracker', label: 'Money Tracker', icon: DollarSign },
  { path: '/mess-meal', label: 'Mess Meal', icon: UtensilsCrossed },
  { path: '/aust-bhara', label: 'Aust Bhara', icon: Banknote },
  { path: '/cover-page-generator', label: 'Cover Page Generator', icon: NotebookPen },
  { path: '/empty-classroom', label: 'Empty Classroom', icon: DoorOpen },
  { path: '/roast-cv', label: 'Roast CV', icon: Flame },
  { path: '/certificate', label: 'Certificate', icon: Award },
  { path: '/auto-alarm', label: 'Auto Alarm', icon: AlarmClock },
  { path: '/austeddit', label: 'Austeddit', icon: Globe },
  { path: '/study-room', label: 'Study Room', icon: School },
  { id: 'toggle', label: 'Collapse', icon: ChevronLeft },
  ];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(() => (user?.id ? getUnreadCount(user.id) : 0));

  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) setUnread(getUnreadCount(user.id));
    }, 2000);
    return () => clearInterval(interval);
  }, [user?.id]);



  let navList = [...navItems];
  if (user?.role === 'admin' || user?.role === 'moderator') {
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
      { path: '/workspace', label: 'Workspace', icon: ExternalLink },
      { path: '/exam-checklist', label: 'Exam Checklist', icon: ClipboardCheck },
      { path: '/money-tracker', label: 'Money Tracker', icon: DollarSign },
      { path: '/mess-meal', label: 'Mess Meal', icon: UtensilsCrossed },
      { path: '/study-room', label: 'Study Room', icon: School },
      { id: 'toggle', label: 'Collapse', icon: ChevronLeft },
    ];
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" />


      <nav className="sidebar-nav">
        {navList.map((item) => {
          if (item.id === 'toggle') {
            const ToggleIcon = collapsed ? ChevronRight : ChevronLeft;
            return (
              <button
                key="toggle"
                type="button"
                className={`nav-item sidebar-toggle-btn ${collapsed ? 'collapsed' : ''}`}
                onClick={onToggle}
                style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'transparent' }}
              >
                <div className="nav-icon-wrapper">
                  <ToggleIcon size={20} />
                </div>
              </button>
            );
          }
          return (
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
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!isAuthenticated && (
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
