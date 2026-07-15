import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LayoutDashboard, FolderKanban, Users, UserCog, LogOut, Menu, X, Sun, Moon, User, Languages
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'lead', 'dev'] },
  { to: '/projects', label: 'Projects', icon: FolderKanban, roles: ['admin', 'lead', 'dev'] },
  { to: '/teams', label: 'Teams', icon: Users, roles: ['admin', 'lead', 'dev'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['admin'] },
  { to: '/profile', label: 'Profile', icon: User, roles: ['admin', 'lead', 'dev'] },
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const visibleItems = navItems.filter(item => hasRole(...item.roles));

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  const sidebarContent = (
    <>
      {/* Logo + Theme toggle */}
      <div className="mb-8 px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Gest<span className="text-indigo-500">Pro</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('sidebar', 'workspace')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title={language === 'en' ? 'Passer en Français' : 'Switch to English'}
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title={isDark ? 'Mode Clair' : 'Mode Sombre'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map(item => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMobileOpen(false)}>
            <item.icon className="h-5 w-5 shrink-0" />
            {t('common', item.label.toLowerCase())}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="mx-3 mb-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
              {user?.role?.toLowerCase()}
              {user?.role !== 'admin' && user?.role !== 'lead' && (user?.teams || []).some(t => t.role === 'lead') && (
                <span className="ml-1 text-indigo-400">· Team Lead</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t('sidebar', 'logout')}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center px-4 justify-between shadow-sm">
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Gest<span className="text-indigo-500">Pro</span>
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Languages className="w-4 h-4" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col pt-6">{sidebarContent}</div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-10 pt-6">
        {sidebarContent}
      </aside>
    </>
  );
}
