import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'lead', 'dev'] },
  { to: '/projects', label: 'Projects', icon: FolderKanban, roles: ['admin', 'lead', 'dev'] },
  { to: '/teams', label: 'Teams', icon: Users, roles: ['admin', 'lead', 'dev'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(item => hasRole(...item.roles));

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const sidebarContent = (
    <>
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold text-gray-900">PM Dashboard</h1>
        <p className="mt-1 text-xs text-gray-500">Project Management</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs capitalize text-gray-500">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow-md lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col pt-16">{sidebarContent}</div>
      </aside>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        {sidebarContent}
      </aside>
    </>
  );
}
