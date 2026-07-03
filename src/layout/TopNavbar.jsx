import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SearchModal from './SearchModal';
import './TopNavbar.css';

const pageTitles = {
  '/': 'Dashboard',
  '/analytics': 'Grade Lab',
  '/vault': 'Resource Vault',
  '/campus': 'Campus',
  '/community': 'Community',
  '/marketplace': 'Marketplace',
  '/settings': 'Settings',
  '/login': 'Login / Sign up',
};

export default function TopNavbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'AUST Helper';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn hide-desktop" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="topbar-page-info">
          <h1 className="topbar-title">{pageTitle}</h1>
          <span className="topbar-greeting hide-mobile">
            {isAuthenticated
              ? `Welcome back, ${user.name.split(' ')[0]}! 👋`
              : 'Browse freely — login anytime to save your profile'}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search hide-mobile" onClick={() => setIsSearchOpen(true)} role="button" tabIndex={0}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search anything... (⌘K)"
            readOnly
          />
        </div>

        <button className="topbar-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          <div className={`theme-toggle-icon ${theme}`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </div>
        </button>

        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-badge">3</span>
        </button>
      </div>

      <SearchModal key={isSearchOpen ? 'open' : 'closed'} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
