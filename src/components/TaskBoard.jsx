import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import ConfirmDialog from './ConfirmDialog';
import { Clock, AlertTriangle, CheckCircle2, Circle, Edit, Trash2, User } from 'lucide-react';

const STATUS_CONFIG = {
  'To Do': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
  'In Progress': { icon: Clock, color: 'text-primary-500', bg: 'bg-primary-50', border: 'border-primary-200' },
  'Blocked': { icon: AlertTriangle, color: 'text-danger-500', bg: 'bg-danger-50', border: 'border-danger-200' },
  'Done': { icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50', border: 'border-success-200' },
};

const STATUSES = ['To Do', 'In Progress', 'Blocked', 'Done'];

export default function TaskBoard({ tasks, teamMembers, onEdit, onDelete }) {
  const { user, hasRole } = useAuth();
  const { updateTaskStatus } = useData();
  const [confirmDone, setConfirmDone] = useState(null);

  const handleStatusChange = async (taskId, newStatus) => {
    if (newStatus === 'Done') {
      setConfirmDone({ taskId, newStatus });
      return;
    }
    await updateTaskStatus(taskId, newStatus);
  };

  const confirmStatusDone = async () => {
    if (confirmDone) {
      await updateTaskStatus(confirmDone.taskId, confirmDone.newStatus);
      setConfirmDone(null);
    }
  };

  const getMemberName = (userId) => {
    const member = teamMembers.find(m => m.id === userId);
    return member?.name || 'Unassigned';
  };

  const canEditTask = () => hasRole('admin') || hasRole('lead');
  const canChangeStatus = (task) =>
    hasRole('admin') || hasRole('lead') || (hasRole('dev') && task.assignedToUserId === user?.id);
  const canDeleteTask = () => hasRole('admin') || hasRole('lead');

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
        <Circle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">No tasks found</p>
      </div>
    );
  }

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map(status => {
          const cfg = STATUS_CONFIG[status];
          const statusTasks = grouped[status] || [];
          return (
            <div key={status} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3`}>
              <div className="mb-3 flex items-center gap-2">
                <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                <h4 className="text-sm font-semibold text-gray-700">{status}</h4>
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600">
                  {statusTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {statusTasks.map(task => (
                  <div
                    key={task.id}
                    className="rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h5 className="text-sm font-medium text-gray-900">{task.title}</h5>
                      <div className="flex gap-1">
                        {canEditTask() && (
                          <button
                            onClick={() => onEdit(task)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDeleteTask() && (
                          <button
                            onClick={() => onDelete(task.id)}
                            className="rounded p-1 text-gray-400 hover:bg-danger-50 hover:text-danger-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mb-2 line-clamp-2 text-xs text-gray-500">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <User className="h-3 w-3" />
                        {getMemberName(task.assignedToUserId)}
                      </div>
                      <span className={`text-xs ${
                        new Date(task.dueDate) < new Date() && task.status !== 'Done'
                          ? 'font-medium text-danger-600'
                          : 'text-gray-400'
                      }`}>
                        {task.dueDate}
                      </span>
                    </div>
                    {canChangeStatus(task) && (
                      <div className="mt-2">
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
                {statusTasks.length === 0 && (
                  <p className="py-4 text-center text-xs text-gray-400">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDone}
        title="Mark as Done?"
        message="Are you sure you want to mark this task as complete?"
        onConfirm={confirmStatusDone}
        onCancel={() => setConfirmDone(null)}
      />
    </>
  );
}
