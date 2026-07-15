import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskBoard from '../components/TaskBoard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectFormModal from '../components/ProjectFormModal';
import ImportTasksModal from '../components/ImportTasksModal';
import { ArrowLeft, Plus, Edit, Trash2, Upload } from 'lucide-react';

const STATUS_FILTERS = ['All', 'To Do', 'In Progress', 'Blocked', 'Done'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const {
    projects, tasks, fetchTasks, fetchProjects, deleteProject, deleteTask,
    getProjectStats, fetchTeamMembers,
  } = useData();

  const [statusFilter, setStatusFilter] = useState('All');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [parentTask, setParentTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showEditProject, setShowEditProject] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const project = projects.find(p => p.id === id);

  useEffect(() => {
    const load = async () => {
      if (projects.length === 0) await fetchProjects();
      await fetchTasks(id);
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (project?.teamId) {
      fetchTeamMembers(project.teamId).then(res => {
        if (res.ok) setTeamMembers(res.data.members);
      });
    }
  }, [project?.teamId]);

  const filteredTasks = statusFilter === 'All'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  const handleDeleteTask = async () => {
    if (deleteTaskId) {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
    }
  };

  const handleDeleteProject = async () => {
    if (deleteProjectId) {
      await deleteProject(deleteProjectId);
      navigate('/projects');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center text-gray-500">Project not found</div>;

  const stats = getProjectStats(project.id);

  // Determine if user can write tasks in THIS project:
  // - ADMIN: always yes
  // - Otherwise: check the user's role INSIDE the team that owns this project
  //   → LEAD in the team = can write | DEV in the team = buttons grayed
  const userRole = user?.role?.toLowerCase();
  let canWriteTasks = false;

  if (userRole === 'admin') {
    canWriteTasks = true;
  } else if (project?.teamId) {
    const teamEntry = (user?.teams || []).find(t => t.teamId === project.teamId);
    if (teamEntry) {
      canWriteTasks = teamEntry.role?.toLowerCase() === 'lead';
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{project.description}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
              <span className={`rounded-full px-2.5 py-0.5 font-medium ${
                project.status === 'active' ? 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400'
                  : project.status === 'on_hold' ? 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              <span>Created: {project.createdAt}</span>
            </div>
          </div>
          {hasRole('admin') && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditProject(true)}
                className="flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-slate-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setDeleteProjectId(project.id)}
                className="flex items-center gap-1.5 rounded-md border border-danger-300 dark:border-danger-500/30 px-3 py-1.5 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Tasks" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} color="success" />
        <StatCard label="In Progress" value={stats.inProgress} color="primary" />
        <StatCard label="Blocked" value={stats.blocked} color="danger" />
      </div>

      {/* Progress bar */}
      <div className="mb-6 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="font-semibold text-primary-600">{stats.percent}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-gray-100 dark:bg-slate-700">
          <div className="h-3 rounded-full bg-primary-500 transition-all" style={{ width: `${stats.percent}%` }} />
        </div>
      </div>

      {/* Task section */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm border border-transparent transition-colors ${
                statusFilter === filter
                  ? 'bg-primary-600 text-white dark:border-primary-500'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 dark:border-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => canWriteTasks && setShowImportModal(true)}
            disabled={!canWriteTasks}
            title={!canWriteTasks ? "Action non autorisée. Veuillez informer votre Lead." : ""}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              canWriteTasks 
                ? "border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-60"
            }`}
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => { if(canWriteTasks) { setEditTask(null); setShowTaskForm(true); } }}
            disabled={!canWriteTasks}
            title={!canWriteTasks ? "Action non autorisée. Veuillez informer votre Lead." : ""}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              canWriteTasks
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-primary-300 dark:bg-primary-900/50 text-white/70 cursor-not-allowed opacity-60"
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      <TaskBoard
        tasks={filteredTasks}
        teamMembers={teamMembers}
        onEdit={task => { setEditTask(task); setParentTask(null); setShowTaskForm(true); }}
        onDelete={taskId => setDeleteTaskId(taskId)}
        onAddChild={parentTask => { setEditTask(null); setParentTask(parentTask); setShowTaskForm(true); }}
      />

      <TaskFormModal
        open={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditTask(null); setParentTask(null); }}
        task={editTask}
        projectId={id}
        teamMembers={teamMembers}
        parentTask={parentTask}
      />

      <ProjectFormModal
        open={showEditProject}
        onClose={() => setShowEditProject(false)}
        project={project}
      />

      <ImportTasksModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        projectId={id}
      />

      <ConfirmDialog
        open={!!deleteTaskId}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTaskId(null)}
      />

      <ConfirmDialog
        open={!!deleteProjectId}
        title="Delete Project"
        message="This will delete the project and all its tasks. This cannot be undone."
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteProjectId(null)}
      />
    </div>
  );
}

function StatCard({ label, value, color = 'gray' }) {
  const colors = {
    gray: 'text-gray-900 dark:text-white',
    success: 'text-success-600',
    primary: 'text-primary-600',
    danger: 'text-danger-600',
  };
  return (
    <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
