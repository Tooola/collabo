import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
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
    t => t.status !== 'Done' && new Date(t.dueDate) < new Date()
  );
  const blockedMy = myTasks.filter(t => t.status === 'Blocked');

  if (loading && projects.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
      </div>

      {/* Alerts */}
      {(overdueMy.length > 0 || blockedMy.length > 0) && (
        <div className="mb-6 space-y-3">
          {overdueMy.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-danger-500" />
              <p className="text-sm text-danger-600">
                <span className="font-semibold">{overdueMy.length}</span> overdue task{overdueMy.length > 1 ? 's' : ''} need{overdueMy.length === 1 ? 's' : ''} attention
              </p>
            </div>
          )}
          {blockedMy.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning-500" />
              <p className="text-sm text-warning-600">
                <span className="font-semibold">{blockedMy.length}</span> blocked task{blockedMy.length > 1 ? 's' : ''} requiring resolution
              </p>
            </div>
          )}
        </div>
      )}

      {/* Coming soon banner */}
      <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
        <p className="text-sm text-primary-700">
          <span className="font-medium">Coming soon:</span> Workload suggestions and AI-powered task prioritization
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'projects'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            Project View
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'teams'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            Team View
          </button>
        </nav>
      </div>

      {/* Project View */}
      {activeTab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
              <FolderKanban className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No projects found</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map(project => {
                const stats = getProjectStats(project.id);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                        {project.name}
                      </h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-success-50 text-success-600'
                          : project.status === 'on_hold'
                          ? 'bg-warning-50 text-warning-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-500">{project.description}</p>

                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Completion</span>
                        <span className="font-medium text-gray-700">{stats.percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-primary-500 transition-all"
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" /> {stats.total} tasks
                      </span>
                      <span className="flex items-center gap-1 text-success-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {stats.completed}
                      </span>
                      {stats.overdue > 0 && (
                        <span className="flex items-center gap-1 text-danger-600">
                          <Clock className="h-3.5 w-3.5" /> {stats.overdue} late
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
        <div>
          {teams.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No teams found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map(team => (
                <div key={team.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-1 font-semibold text-gray-900">{team.name}</h3>
                  <p className="mb-4 text-sm text-gray-500">{team.description}</p>
                  {(teamMembersMap[team.id] || []).length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {(teamMembersMap[team.id] || []).map(member => {
                        const stats = getTeamMemberStats(member.id);
                        return (
                          <div key={member.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs capitalize text-gray-500">{member.role}</p>
                            </div>
                            <div className="flex gap-4 text-xs">
                              <span className="text-gray-500">{stats.total} total</span>
                              <span className="text-primary-600">{stats.inProgress} in progress</span>
                              <span className="text-success-600">{stats.completed} done</span>
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
