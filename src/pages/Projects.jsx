import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectFormModal from '../components/ProjectFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Trash2, Edit, FolderKanban } from 'lucide-react';

export default function Projects() {
  const { hasRole } = useAuth();
  const { projects, fetchProjects, deleteProject, getProjectStats } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects().finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProject(deleteId);
      setDeleteId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        {hasRole('admin') && (
          <button
            onClick={() => { setEditProject(null); setShowForm(true); }}
            className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
          <FolderKanban className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No projects found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Project</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Progress</th>
                <th className="px-6 py-3 font-medium text-gray-500">Tasks</th>
                <th className="px-6 py-3 font-medium text-gray-500">Created</th>
                {hasRole('admin') && <th className="px-6 py-3 font-medium text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map(project => {
                const stats = getProjectStats(project.id);
                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <a href={`/projects/${project.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                        {project.name}
                      </a>
                      <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">{project.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        project.status === 'active' ? 'bg-success-50 text-success-600'
                          : project.status === 'on_hold' ? 'bg-warning-50 text-warning-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-primary-500" style={{ width: `${stats.percent}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{stats.percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {stats.completed}/{stats.total}
                      {stats.overdue > 0 && <span className="ml-1 text-danger-600">({stats.overdue} late)</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{project.createdAt}</td>
                    {hasRole('admin') && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditProject(project); setShowForm(true); }}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(project.id)}
                            className="rounded p-1.5 text-gray-400 hover:bg-danger-50 hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ProjectFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditProject(null); }}
        project={editProject}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Project"
        message="This will delete the project and all its tasks. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
