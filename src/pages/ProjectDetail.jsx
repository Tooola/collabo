import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskBoard from '../components/TaskBoard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectFormModal from '../components/ProjectFormModal';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

const STATUS_FILTERS = ['All', 'To Do', 'In Progress', 'Blocked', 'Done'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const {
    projects, tasks, fetchTasks, fetchProjects, deleteProject, deleteTask,
    getProjectStats, fetchTeamMembers,
  } = useData();

  const [statusFilter, setStatusFilter] = useState('All');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
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

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
              <span className={`rounded-full px-2.5 py-0.5 font-medium ${
                project.status === 'active' ? 'bg-success-50 text-success-600'
                  : project.status === 'on_hold' ? 'bg-warning-50 text-warning-600'
                  : 'bg-gray-100 text-gray-600'
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
                className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setDeleteProjectId(project.id)}
                className="flex items-center gap-1.5 rounded-md border border-danger-300 px-3 py-1.5 text-sm text-danger-600 hover:bg-danger-50"
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
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Overall Progress</span>
          <span className="font-semibold text-primary-600">{stats.percent}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-gray-100">
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
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusFilter === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        {hasRole('admin', 'lead') && (
          <button
            onClick={() => { setEditTask(null); setShowTaskForm(true); }}
            className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        )}
      </div>

      <TaskBoard
        tasks={filteredTasks}
        teamMembers={teamMembers}
        onEdit={task => { setEditTask(task); setShowTaskForm(true); }}
        onDelete={taskId => setDeleteTaskId(taskId)}
      />

      <TaskFormModal
        open={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditTask(null); }}
        task={editTask}
        projectId={id}
        teamMembers={teamMembers}
      />

      <ProjectFormModal
        open={showEditProject}
        onClose={() => setShowEditProject(false)}
        project={project}
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
    gray: 'text-gray-900',
    success: 'text-success-600',
    primary: 'text-primary-600',
    danger: 'text-danger-600',
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
