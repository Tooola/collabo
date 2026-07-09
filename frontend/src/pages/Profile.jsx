import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Shield, Briefcase, Code2, Check, AlertCircle } from 'lucide-react';

const ROLES = [
  { value: 'ADMIN', label: 'Admin', icon: Shield, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30' },
  { value: 'LEAD', label: 'Lead', icon: Briefcase, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' },
  { value: 'DEV', label: 'Developer', icon: Code2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' },
];

function RoleBadge({ role }) {
  const r = ROLES.find(x => x.value === role?.toUpperCase()) || ROLES[2];
  const Icon = r.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${r.color}`}>
      <Icon className="h-3 w-3" />
      {r.label}
    </span>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { teams, updateUser } = useData();
  
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [nameForm, setNameForm] = useState(user?.name || '');
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const teamName = user?.teamId ? teams.find(t => t.id === user.teamId)?.name : t('profile', 'noTeam');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPassError(t('profile', 'errMismatch'));
    }
    if (passwordForm.newPassword.length < 8) {
      return setPassError(t('profile', 'errLength'));
    }

    setPassLoading(true);
    const res = await api('PUT', '/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    setPassLoading(false);

    if (res.ok) {
      setPassSuccess(t('profile', 'passSuccess'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccess(''), 3000);
    } else {
      setPassError(res.data?.message || 'Error');
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameForm.trim()) return;
    
    setNameLoading(true);
    const res = await updateUser(user.id, { name: nameForm });
    setNameLoading(false);

    if (res.ok) {
      setNameSuccess(t('profile', 'saved'));
      setTimeout(() => setNameSuccess(''), 3000);
      window.location.reload();
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('profile', 'title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile', 'subtitle')}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-black text-white shadow-lg shadow-indigo-500/30">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <RoleBadge role={user.role} />
                <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {teamName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user.role?.toUpperCase() === 'ADMIN' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('profile', 'editProfile')}</h3>
          <form onSubmit={handleNameSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('profile', 'fullName')}</label>
              <div className="flex gap-3">
                <input
                  required
                  type="text"
                  value={nameForm}
                  onChange={e => setNameForm(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={nameLoading || nameForm === user.name}
                  className="rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  {nameLoading ? t('profile', 'saving') : t('profile', 'save')}
                </button>
              </div>
            </div>
            {nameSuccess && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" /> {nameSuccess}
              </p>
            )}
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('profile', 'security')}</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {passError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{passError}</p>
            </div>
          )}
          {passSuccess && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
              <Check className="h-5 w-5 shrink-0" />
              <p>{passSuccess}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('profile', 'currentPass')}</label>
            <input
              required
              type="password"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('profile', 'newPass')}</label>
            <input
              required
              type="password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('profile', 'confirmPass')}</label>
            <input
              required
              type="password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {passLoading ? t('profile', 'updatingPass') : t('profile', 'updatePass')}
          </button>
        </form>
      </div>
    </div>
  );
}
