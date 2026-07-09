import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { X } from 'lucide-react';

const STATUSES = ['To Do', 'In Progress', 'Blocked', 'Done'];

export default function TaskFormModal({ open, onClose, task, projectId, teamMembers, parentTask }) {
  const { createTask, updateTask } = useData();
  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', status: 'To Do', assignedToUserId: '', projectId, parentId: null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        status: task.status,
        assignedToUserId: task.assignedToUserId || '',
        projectId: task.projectId,
        parentId: task.parentId || null,
      });
    } else {
      setForm({
        title: '', description: '', dueDate: '', status: 'To Do',
        assignedToUserId: '', projectId,
        parentId: parentTask?.id || null,
      });
    }
    setErrors({});
  }, [task, open, parentTask]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.dueDate) errs.dueDate = 'Due date is required';
    else if (new Date(form.dueDate) < new Date(new Date().toISOString().slice(0, 10))) {
      errs.dueDate = 'Due date cannot be in the past';
    }
    // Assignee is optional for epics / sub-tasks to allow importing without assignment
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, projectId };
    if (task) {
      await updateTask(task.id, payload);
    } else {
      await createTask(payload);
    }
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl border dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {task ? 'Edit Task' : parentTask ? `New Sub-task` : 'New Task'}
            </h3>
            {parentTask && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Parent: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{parentTask.title}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.title && <p className="mt-1 text-xs text-danger-600">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {errors.dueDate && <p className="mt-1 text-xs text-danger-600">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To <span className="text-gray-400 font-normal">(optional)</span></label>
            <select
              value={form.assignedToUserId}
              onChange={e => setForm({ ...form, assignedToUserId: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Unassigned</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
            {errors.assignedToUserId && <p className="mt-1 text-xs text-danger-600">{errors.assignedToUserId}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
