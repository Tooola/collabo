import { useRef, useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function ImportTasksModal({ open, onClose, projectId }) {
  const { createTask } = useData();
  const [tasksText, setTasksText] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  // Parse text into a hierarchical structure using dash indentation
  const parseHierarchy = (text) => {
    const lines = text.split('\n').map(l => l.trimEnd()).filter(l => l.trim());
    const items = [];

    for (const line of lines) {
      const stripped = line.trim();
      if (!stripped) continue;

      // Count leading dashes to determine level (0 = epic, 1 = task, 2 = subtask)
      const dashMatch = stripped.match(/^(-{1,2})\s+(.+)/);
      if (dashMatch) {
        const level = dashMatch[1].length; // 1 dash = level 1, 2 dashes = level 2
        items.push({ title: dashMatch[2].trim(), level });
      } else {
        items.push({ title: stripped, level: 0 });
      }
    }

    return items;
  };

  const updatePreview = (text) => {
    setTasksText(text);
    if (text.trim()) {
      setPreview(parseHierarchy(text));
      setShowPreview(true);
    } else {
      setPreview([]);
      setShowPreview(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!tasksText.trim()) return;

    setSaving(true);
    const items = parseHierarchy(tasksText);

    // We need to track the ID of last created tasks at each level
    const parentIds = { 0: null, 1: null, 2: null };

    for (const item of items) {
      const parentId = item.level === 0 ? null : parentIds[item.level - 1];

      const res = await createTask({
        title: item.title.substring(0, 100),
        description: item.title,
        status: 'To Do',
        projectId,
        parentId: parentId || null,
        assignedToUserId: '',
        dueDate: new Date().toISOString().slice(0, 10),
      });

      if (res.ok && res.data?.task?.id) {
        parentIds[item.level] = res.data.task.id;
      }
    }

    setSaving(false);
    setTasksText('');
    setPreview([]);
    setShowPreview(false);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      // Parse CSV: extract first column per row, convert indentation to dashes
      const lines = text.split('\n').map(line => {
        const cols = line.split(',');
        const raw = cols[0].replace(/["']/g, '').trimEnd();
        return raw;
      }).filter(l => l.trim());

      const joined = lines.join('\n');
      updatePreview(prev => (prev ? prev + '\n' + joined : joined));
      setTasksText(prev => (prev ? prev + '\n' + joined : joined));
      setPreview(parseHierarchy(prev => (prev ? prev + '\n' + joined : joined)));
      setShowPreview(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const levelConfig = [
    { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', label: 'EPIC', indent: '' },
    { color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800', label: 'Task', indent: 'ml-5' },
    { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-white dark:bg-slate-900', label: 'Sub', indent: 'ml-10' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl border dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary-500" />
            Import Tasks
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Format hint */}
        <div className="mb-4 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-3 text-xs text-indigo-700 dark:text-indigo-300">
          <p className="font-bold mb-1">Format (tirets = niveau de hiérarchie) :</p>
          <pre className="font-mono leading-relaxed opacity-80">{`Créer le site web          ← EPIC (pas de tiret)
- Design frontend          ← Tâche (1 tiret)
-- Maquette accueil        ← Sous-tâche (2 tirets)
-- Maquette contact        ← Sous-tâche
- Développer le backend    ← Tâche`}</pre>
        </div>

        <form onSubmit={handleImport} className="flex-1 flex flex-col overflow-hidden space-y-4">
          {/* Text input */}
          <div className="shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Coller les tâches (une par ligne)
              </label>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                <FileText className="h-3.5 w-3.5" />
                Upload CSV
              </button>
              <input type="file" accept=".csv,.txt" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>
            <textarea
              value={tasksText}
              onChange={e => updatePreview(e.target.value)}
              rows={6}
              placeholder={"Créer le site web\n- Design frontend\n-- Maquette accueil\n- Développer le backend"}
              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Live preview */}
          {showPreview && preview.length > 0 && (
            <div className="flex-1 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Aperçu — {preview.length} tâche{preview.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-1">
                {preview.map((item, i) => {
                  const cfg = levelConfig[Math.min(item.level, 2)];
                  return (
                    <div key={i} className={`flex items-center gap-2 ${cfg.indent}`}>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} shrink-0`}>
                        {cfg.label}
                      </span>
                      <span className={`text-xs ${cfg.color} truncate`}>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1 shrink-0">
            <button type="button" onClick={onClose}
              className="rounded-md border border-gray-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">
              Annuler
            </button>
            <button type="submit" disabled={saving || !tasksText.trim()}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {saving ? 'Importation...' : `Importer ${preview.length > 0 ? `(${preview.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
