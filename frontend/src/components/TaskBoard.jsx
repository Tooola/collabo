import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import ConfirmDialog from './ConfirmDialog';
import { Clock, AlertTriangle, CheckCircle2, Circle, Edit, Trash2, User, ChevronDown, ChevronRight, CheckSquare, Square, Plus } from 'lucide-react';

const STATUS_CONFIG = {
  'To Do': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-slate-800/50', border: 'border-gray-200 dark:border-slate-700' },
  'In Progress': { icon: Clock, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10', border: 'border-primary-200 dark:border-primary-500/20' },
  'Blocked': { icon: AlertTriangle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10', border: 'border-danger-200 dark:border-danger-500/20' },
  'Done': { icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10', border: 'border-success-200 dark:border-success-500/20' },
};

const STATUSES = ['To Do', 'In Progress', 'Blocked', 'Done'];

// ─── Main Board ──────────────────────────────────────────────────────────────
export default function TaskBoard({ tasks, teamMembers, onEdit, onDelete, onAddChild }) {
  const { user, hasRole } = useAuth();
  const { updateTaskStatus } = useData();
  const [confirmDone, setConfirmDone] = useState(null);
  const [blockedDone, setBlockedDone] = useState(null); // task blocked from Done
  const [collapsedEpics, setCollapsedEpics] = useState({});

  // Hierarchy: tasks with no parentId are roots; tasks with parentId are children
  const rootTasks = tasks.filter(t => !t.parentId);
  const childTasks = tasks.filter(t => !!t.parentId);

  const toggleEpic = (id) => setCollapsedEpics(prev => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = async (taskId, newStatus) => {
    if (newStatus === 'Done') {
      // Check if this task has children (subtasks) that are not all Done
      const taskSubtasks = tasks.filter(t => t.parentId === taskId);
      if (taskSubtasks.length > 0) {
        const incomplete = taskSubtasks.filter(t => t.status !== 'Done');
        if (incomplete.length > 0) {
          setBlockedDone({ taskId, incomplete: incomplete.length, total: taskSubtasks.length });
          return;
        }
      }
      setConfirmDone({ taskId, newStatus });
      return;
    }
    await updateTaskStatus(taskId, newStatus);
  };

  const confirmStatusDone = async () => {
    if (confirmDone) { await updateTaskStatus(confirmDone.taskId, confirmDone.newStatus); setConfirmDone(null); }
  };

  const getMemberName = (userId) => teamMembers.find(m => m.id === userId)?.name || 'Unassigned';
  const canEditTask = () => hasRole('admin') || hasRole('lead');
  const canChangeStatus = (task) => hasRole('admin') || hasRole('lead') || (hasRole('dev') && task.assignedToUserId === user?.id);
  const canDeleteTask = () => hasRole('admin') || hasRole('lead');

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-center">
        <Circle className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-700" />
        <p className="text-sm text-gray-500 dark:text-slate-400">No tasks found</p>
      </div>
    );
  }

  // If no child tasks at all, use simple flat Kanban
  const hasHierarchy = childTasks.length > 0;

  if (!hasHierarchy) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map(status => {
            const cfg = STATUS_CONFIG[status];
            const statusTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3`}>
                <div className="mb-3 flex items-center gap-2">
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300">{status}</h4>
                  <span className="ml-auto rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-transparent dark:border-slate-700">
                    {statusTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {statusTasks.map(task => (
                    <TaskCard
                      key={task.id} task={task} getMemberName={getMemberName}
                      canEditTask={canEditTask} canDeleteTask={canDeleteTask} canChangeStatus={canChangeStatus}
                      onEdit={onEdit} onDelete={onDelete} handleStatusChange={handleStatusChange}
                      user={user} tasks={tasks} onAddChild={onAddChild}
                    />
                  ))}
                  {statusTasks.length === 0 && <p className="py-4 text-center text-xs text-gray-400 dark:text-slate-500">No tasks</p>}
                </div>
              </div>
            );
          })}
        </div>
        <ConfirmDialog open={!!confirmDone} title="Mark as Done?" message="Are you sure you want to mark this task as complete?" onConfirm={confirmStatusDone} onCancel={() => setConfirmDone(null)} />
      </>
    );
  }

  // ─── Swimlane view ───────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">
        {rootTasks.map(epic => {
          const epicChildren = childTasks.filter(t => t.parentId === epic.id);
          const isEpic = epicChildren.length > 0;
          const isCollapsed = collapsedEpics[epic.id];
          const doneCount = epicChildren.filter(t => t.status === 'Done').length;

          return (
            <div key={epic.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">

              {/* ── Epic/Task header ── */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                {isEpic ? (
                  <button onClick={() => toggleEpic(epic.id)} className="shrink-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-gray-400 dark:text-slate-500 ml-1" />
                )}

                <div className="flex-1 min-w-0 flex items-center gap-2">
                  {isEpic && (
                    <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                      EPIC
                    </span>
                  )}
                  <span className={`text-sm font-bold truncate ${isEpic ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {epic.title}
                  </span>
                  {epic.description && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:block">{epic.description}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEpic && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                      {doneCount}/{epicChildren.length} done
                    </span>
                  )}
                  {!isEpic && canChangeStatus(epic) && (
                    <div className="flex items-center gap-1">
                      <select value={epic.status} onChange={e => handleStatusChange(epic.id, e.target.value)}
                        className="rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-2 py-1 text-xs">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {epic.status !== 'Done' && (
                        <button onClick={() => handleStatusChange(epic.id, 'Done')}
                          className="p-1 rounded bg-success-50 dark:bg-success-500/10 text-success-600 hover:bg-success-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  {canEditTask() && (
                    <button onClick={() => onEdit(epic)} className="p-1 rounded text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {canDeleteTask() && (
                    <button onClick={() => onDelete(epic.id)} className="p-1 rounded text-slate-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 hover:text-danger-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {canEditTask() && onAddChild && (
                    <button onClick={() => onAddChild(epic)}
                      className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 px-2 py-1 rounded-md transition-colors">
                      <Plus className="h-3 w-3" /> Sub-task
                    </button>
                  )}
                </div>
              </div>

              {/* ── Kanban columns for epic children ── */}
              {isEpic && !isCollapsed && (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-0 bg-white dark:bg-slate-900 divide-x divide-slate-100 dark:divide-slate-800">
                  {STATUSES.map(status => {
                    const cfg = STATUS_CONFIG[status];
                    const colTasks = epicChildren.filter(t => t.status === status);
                    return (
                      <div key={status} className="p-3">
                        <div className={`mb-3 flex items-center gap-1.5 rounded-md px-2 py-1.5 ${cfg.bg} border ${cfg.border}`}>
                          <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{status}</span>
                          <span className="ml-auto text-xs font-bold text-gray-500 dark:text-slate-400">{colTasks.length}</span>
                        </div>
                        <div className="space-y-2">
                          {colTasks.map(task => (
                            <TaskCard
                              key={task.id} task={task} getMemberName={getMemberName}
                              canEditTask={canEditTask} canDeleteTask={canDeleteTask} canChangeStatus={canChangeStatus}
                              onEdit={onEdit} onDelete={onDelete} handleStatusChange={handleStatusChange}
                              user={user} tasks={tasks} onAddChild={onAddChild}
                            />
                          ))}
                          {colTasks.length === 0 && <p className="py-3 text-center text-xs text-gray-300 dark:text-slate-600">—</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog open={!!confirmDone} title="Mark as Done?" message="Are you sure you want to mark this task as complete?" onConfirm={confirmStatusDone} onCancel={() => setConfirmDone(null)} />

      {/* Blocked dialog when subtasks are incomplete */}
      {blockedDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl border dark:border-slate-800 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/20">
                <AlertTriangle className="h-7 w-7 text-warning-500" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Sous-tâches incomplètes</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
              <span className="font-bold text-warning-600 dark:text-warning-400">{blockedDone.incomplete}</span> sous-tâche{blockedDone.incomplete > 1 ? 's' : ''} sur <span className="font-bold">{blockedDone.total}</span> ne sont pas encore terminées.
              <br /><span className="text-xs mt-1 block">Cochez toutes les sous-tâches avant de marquer cette tâche comme Done.</span>
            </p>
            <button onClick={() => setBlockedDone(null)} className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Task Card (used in both flat & swimlane modes) ───────────────────────────
function TaskCard({ task, getMemberName, canEditTask, canDeleteTask, canChangeStatus, onEdit, onDelete, handleStatusChange, user, tasks, onAddChild }) {
  const { updateTaskStatus } = useData();
  const [expanded, setExpanded] = useState(true);

  // Grandchildren: tasks whose parentId === this task's id
  const subtasks = tasks.filter(t => t.parentId === task.id);
  const doneSubtasks = subtasks.filter(s => s.status === 'Done').length;

  const toggleSubtask = async (subtask) => {
    const newStatus = subtask.status === 'Done' ? 'To Do' : 'Done';
    await updateTaskStatus(subtask.id, newStatus);
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-1.5 flex items-start justify-between gap-1">
        <h5 className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{task.title}</h5>
        <div className="flex gap-1 shrink-0">
          {canEditTask() && (
            <button onClick={() => onEdit(task)} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-white">
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {canDeleteTask() && (
            <button onClick={() => onDelete(task.id)} className="rounded p-1 text-gray-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 hover:text-danger-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {task.description && <p className="mb-2 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">{task.description}</p>}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
          <User className="h-3 w-3" />{getMemberName(task.assignedToUserId)}
        </div>
        <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'font-medium text-danger-600' : 'text-gray-400 dark:text-slate-500'}`}>
          {task.dueDate}
        </span>
      </div>

      {/* Subtask checklist (grandchildren) */}
      {subtasks.length > 0 && (
        <div className="mb-2 border-t border-gray-100 dark:border-slate-700 pt-2">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span>Sub-tasks</span>
            <span className={`ml-0.5 ${doneSubtasks === subtasks.length ? 'text-success-500' : 'text-warning-500'}`}>({doneSubtasks}/{subtasks.length})</span>
          </button>
          {expanded && (
            <div className="space-y-1">
              {subtasks.map(sub => (
                <button key={sub.id} onClick={() => toggleSubtask(sub)} className="flex items-start gap-2 w-full text-left group py-0.5">
                  {sub.status === 'Done'
                    ? <CheckSquare className="h-3.5 w-3.5 mt-0.5 text-success-500 shrink-0" />
                    : <Square className="h-3.5 w-3.5 mt-0.5 text-gray-300 dark:text-slate-600 shrink-0 group-hover:text-primary-400" />
                  }
                  <span className={`text-xs leading-snug ${sub.status === 'Done' ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                    {sub.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status control + quick done + add sub-task */}
      <div className="flex items-center gap-1.5 mt-1.5">
        {canChangeStatus(task) && (
          <>
            <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
              className="flex-1 rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-2 py-1.5 text-xs focus:border-primary-500 focus:outline-none">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {task.status !== 'Done' && (() => {
              const allSubtasksDone = subtasks.length === 0 || subtasks.every(s => s.status === 'Done');
              return (
                <button
                  onClick={() => handleStatusChange(task.id, 'Done')}
                  title={allSubtasksDone ? 'Mark as Done' : `${subtasks.filter(s => s.status !== 'Done').length} sub-task(s) remaining`}
                  disabled={!allSubtasksDone}
                  className={`shrink-0 flex items-center justify-center p-1.5 rounded transition-colors border ${
                    allSubtasksDone
                      ? 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-500/20 border-success-200 dark:border-success-500/20'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-slate-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              );
            })()}
          </>
        )}
        {canEditTask() && onAddChild && (
          <button onClick={() => onAddChild(task)} title="Add sub-task"
            className="shrink-0 p-1.5 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
