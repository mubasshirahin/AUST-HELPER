import { useTheme } from '../context/ThemeContext';
import { Search, Bell, Sun, Moon, Menu, Newspaper, Terminal, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SearchModal from './SearchModal';
import './TopNavbar.css';

const pageTitles = {
  '/': 'Dashboard',
  '/analytics': 'Grade Lab',
  '/vault': 'Resource Vault',
  '/campus': 'Campus',
  '/community': 'Community',
  '/messages': 'Messages',
  '/marketplace': 'Marketplace',
  '/settings': 'Settings',
  '/login': 'Login / Sign up',
};

const themeOptions = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'newsprint', label: 'Newsprint', icon: Newspaper },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: Terminal },
];

export default function TopNavbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeSwitcherRef = useRef(null);

  const activeTheme = themeOptions.find((t) => t.id === theme) || themeOptions[0];
  const ThemeIcon = activeTheme.icon;

  const pageTitle = pageTitles[location.pathname] || 'AUSTWise';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setThemeMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click-outside closes the menu (touch / click fallback for hover-open).
  useEffect(() => {
    if (!themeMenuOpen) return undefined;
    const handleClick = (e) => {
      if (themeSwitcherRef.current && !themeSwitcherRef.current.contains(e.target)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [themeMenuOpen]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn hide-desktop" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="topbar-page-info">
          <h1 className="topbar-title">{pageTitle}</h1>

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

        <div
          className={`theme-switcher ${themeMenuOpen ? 'open' : ''}`}
          ref={themeSwitcherRef}
          onMouseLeave={() => setThemeMenuOpen(false)}
        >
          <button
            type="button"
            className="topbar-icon-btn"
            aria-haspopup="menu"
            aria-expanded={themeMenuOpen}
            aria-label={`Theme: ${activeTheme.label}. Choose a theme`}
            onClick={() => setThemeMenuOpen((open) => !open)}
          >
            <div className={`theme-toggle-icon ${theme}`}>
              <ThemeIcon size={18} />
            </div>
          </button>

          <div className="theme-menu" role="menu" aria-label="Select theme">
            <span className="theme-menu-heading">Theme</span>
            {themeOptions.map(({ id, label, icon: Icon }) => {
              const isActive = theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  className={`theme-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setTheme(id);
                    setThemeMenuOpen(false);
                  }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {isActive && <Check size={14} className="theme-menu-check" />}
                </button>
              );
            })}
          </div>
        </div>

        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-badge">3</span>
        </button>
      </div>

      <SearchModal key={isSearchOpen ? 'open' : 'closed'} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
