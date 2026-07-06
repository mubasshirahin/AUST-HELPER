import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, BookOpen, Users, ShoppingBag, MessageSquare } from 'lucide-react';
import './MobileNav.css';

const navItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/analytics', label: 'Grades', icon: BarChart3 },
  { path: '/vault', label: 'Vault', icon: BookOpen },
  { path: '/community', label: 'Social', icon: Users },
  { path: '/messages', label: 'Chat', icon: MessageSquare },
  { path: '/marketplace', label: 'Market', icon: ShoppingBag },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav hide-desktop">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          end={item.path === '/'}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
