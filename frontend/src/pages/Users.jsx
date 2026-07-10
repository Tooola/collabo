import { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  UserCog, Shield, Code2, Briefcase, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, X
} from 'lucide-react';

const DEFAULT_PASSWORD = '';

const ROLES = [
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30' },
  { value: 'lead', label: 'Lead', icon: Briefcase, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' },
  { value: 'dev', label: 'Developer', icon: Code2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' },
];

function RoleBadge({ role }) {
  const r = ROLES.find(x => x.value === role) || ROLES[2];
  const Icon = r.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${r.color}`}>
      <Icon className="h-3 w-3" />
      {r.label}
    </span>
  );
}

function UserModal({ open, onClose, user, teams, onCreate, onUpdate }) {
  const isEdit = !!user;
  const [form, setForm] = useState({ name: '', email: '', role: 'dev', teamId: '', password: DEFAULT_PASSWORD });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
      setShowPass(false);
      if (isEdit) {
        setForm({ name: user.name, email: user.email, role: user.role, teamId: user.teamId || '', password: '' });
      } else {
        setForm({ name: '', email: '', role: 'dev', teamId: '', password: DEFAULT_PASSWORD });
      }
    }
  }, [open, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = { name: form.name, email: form.email, role: form.role, teamId: form.teamId || null };
    if (!isEdit) payload.password = form.password;
    else if (form.password) payload.password = form.password;

    const res = isEdit ? await onUpdate(user.id, payload) : await onCreate(payload);
    setLoading(false);
    if (!res.ok) {
      const msg = res.data?.message;
      // Zod returns an array of error objects — extract the text messages
      setError(Array.isArray(msg) ? msg.map(e => e.message).join(', ') : (msg || 'Une erreur est survenue'));
    } else {
      onClose(isEdit ? null : res.data.user);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h3>
          <button onClick={() => onClose(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nom complet *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Jean Dupont"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="jean@exemple.com"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rôle *</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition-all ${
                      form.role === r.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Équipe</label>
            <select
              value={form.teamId}
              onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Aucune équipe</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {isEdit ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe (optionnel)'}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder={isEdit ? 'Laisser vide pour ne pas changer' : 'Laisser vide pour générer automatiquement'}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isEdit && (
              <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                📧 Si vide, un mot de passe sera généré et envoyé par e-mail à l'utilisateur.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreatedUserModal({ open, user, onClose }) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
          <Check className="h-7 w-7 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Utilisateur créé !</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span> a été créé avec succès.
        </p>

        <div className="mb-4 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">📧</span>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 text-left leading-relaxed">
              Un e-mail de bienvenue a été envoyé à <strong>{user.email}</strong> avec ses identifiants de connexion et un lien direct vers la plateforme.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          L'utilisateur peut se connecter dès maintenant avec le lien dans son e-mail.
        </p>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Parfait !
        </button>
      </div>
    </div>
  );
}

export default function Users() {
  const { users, teams, fetchUsers, fetchTeams, createUser, updateUser, deleteUser, loading } = useData();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
    if (teams.length === 0) fetchTeams();
  }, []);

  const getTeamName = (teamId) => {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId)?.name || 'Équipe inconnue';
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data) => {
    return await createUser(data);
  };

  const handleUpdate = async (id, data) => {
    return await updateUser(id, data);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    setDeleteConfirm(null);
  };

  const handleModalClose = (newUser) => {
    setShowModal(false);
    setEditUser(null);
    if (newUser) setCreatedUser(newUser);
  };

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('users', 'title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} {t('users', 'registered')}</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('users', 'search')}
            className="w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => { setEditUser(null); setShowModal(true); }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus className="h-4 w-4" />
            {t('users', 'add')}
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-16 text-center">
          <UserCog className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {search ? t('users', 'noResults') : t('users', 'noUsers')}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('users', 'user')}</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('users', 'role')}</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('users', 'team')}</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">{t('users', 'actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-6 py-4">
                    {getTeamName(u.teamId) ? (
                      <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {getTeamName(u.teamId)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">{t('users', 'noTeam')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditUser(u); setShowModal(true); }}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title={t('users', 'editUser')}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title={t('projects', 'delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('users', 'deleteTitle')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{deleteConfirm.name}</span> {t('users', 'deleteMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('projects', 'cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                {t('projects', 'confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <UserModal
        open={showModal}
        onClose={handleModalClose}
        user={editUser}
        teams={teams}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <CreatedUserModal
        open={!!createdUser}
        user={createdUser}
        onClose={() => setCreatedUser(null)}
      />
    </div>
  );
}
