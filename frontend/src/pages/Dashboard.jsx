import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  FolderKanban,
} from 'lucide-react';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const { t } = useLanguage();
  const {
    projects, teams, tasks, fetchProjects, fetchTeams,
    getProjectStats, getTeamMemberStats, fetchTeamMembers, loading,
  } = useData();
  const [activeTab, setActiveTab] = useState('projects');
  const [teamMembersMap, setTeamMembersMap] = useState({});

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchProjects(), fetchTeams()]);
    };
    load();
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      const map = {};
      for (const team of teams) {
        const res = await fetchTeamMembers(team.id);
        if (res.ok) map[team.id] = res.data.members;
      }
      setTeamMembersMap(map);
    };
    if (teams.length > 0) loadMembers();
  }, [teams]);

  const myTasks = hasRole('dev')
    ? tasks.filter(t => t.assignedToUserId === user?.id)
    : tasks;

  const overdueMy = myTasks.filter(
    t => t.status !== 'TERMINE' && new Date(t.dueDate) < new Date()
  );
  const blockedMy = myTasks.filter(t => t.status === 'BLOQUE');

  if (loading && projects.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('dashboard', 'title')}</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t('dashboard', 'welcome').replace('{name}', user?.name)}</p>
      </div>

      {/* Alerts */}
      {(overdueMy.length > 0 || blockedMy.length > 0) && (
        <div className="mb-6 space-y-3">
          {overdueMy.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-danger-500/30 bg-danger-50 dark:bg-danger-500/10 px-5 py-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-danger-500" />
              <p className="text-sm text-danger-700 dark:text-danger-300">
                <span className="font-bold">{overdueMy.length}</span> {overdueMy.length > 1 ? t('dashboard', 'overdueTasks') : t('dashboard', 'overdueTask')} {overdueMy.length === 1 ? t('dashboard', 'needsAttention') : t('dashboard', 'needAttention')}
              </p>
            </div>
          )}
          {blockedMy.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning-500/30 bg-warning-50 dark:bg-warning-500/10 px-5 py-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning-500" />
              <p className="text-sm text-warning-700 dark:text-warning-300">
                <span className="font-bold">{blockedMy.length}</span> {blockedMy.length > 1 ? t('dashboard', 'blockedTasks') : t('dashboard', 'blockedTask')} {t('dashboard', 'reqResolution')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Coming soon banner */}
      <div className="mb-8 rounded-xl border border-primary-200 dark:border-primary-900/50 bg-primary-50 dark:bg-primary-500/10 px-5 py-4 shadow-sm">
        <p className="text-sm text-primary-700 dark:text-primary-300">
          <span className="font-bold">{t('dashboard', 'comingSoon')}</span> {t('dashboard', 'comingSoonText')}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 border-b-2 px-2 pb-4 text-sm font-semibold transition-all ${
              activeTab === 'projects'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            {t('dashboard', 'projectView')}
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 border-b-2 px-2 pb-4 text-sm font-semibold transition-all ${
              activeTab === 'teams'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <Users className="h-4 w-4" />
            {t('dashboard', 'teamView')}
          </button>
        </nav>
      </div>

      {/* Project View */}
      {activeTab === 'projects' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 py-16 text-center backdrop-blur-sm">
              <FolderKanban className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard', 'noProjects')}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map(project => {
                const stats = getProjectStats(project.id);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                        {project.name}
                      </h3>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        project.status === 'active'
                          ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400'
                          : project.status === 'on_hold'
                          ? 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mb-6 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{project.description}</p>

                    <div className="mb-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500 dark:text-slate-400">{t('dashboard', 'completion')}</span>
                        <span className="text-slate-900 dark:text-white">{stats.percent}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all duration-1000 ease-out"
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <BarChart3 className="h-3.5 w-3.5" /> {stats.total}
                      </span>
                      <span className="flex items-center gap-1.5 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 px-2 py-1 rounded-md">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {stats.completed}
                      </span>
                      {stats.overdue > 0 && (
                        <span className="flex items-center gap-1.5 bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 px-2 py-1 rounded-md">
                          <Clock className="h-3.5 w-3.5" /> {stats.overdue}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Team View */}
      {activeTab === 'teams' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {teams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 py-16 text-center backdrop-blur-sm">
              <Users className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard', 'noTeams')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {teams.map(team => (
                <div key={team.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{team.name}</h3>
                  <p className="mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">{team.description}</p>
                  {(teamMembersMap[team.id] || []).length > 0 && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                      {(teamMembersMap[team.id] || []).map(member => {
                        const stats = getTeamMemberStats(member.id);
                        return (
                          <div key={member.id} className="flex items-center justify-between py-4 group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex gap-3 text-xs font-semibold">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg">{stats.total} {t('dashboard', 'total')}</span>
                              <span className="bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg">{stats.inProgress} {t('dashboard', 'active')}</span>
                              <span className="bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 px-3 py-1.5 rounded-lg">{stats.completed} {t('dashboard', 'done')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
