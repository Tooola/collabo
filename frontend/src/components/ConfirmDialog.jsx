import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  const { t } = useLanguage();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl border border-gray-200 dark:border-slate-700">
        <div className="mb-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-gray-600 dark:text-slate-400">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            {t('projects', 'cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-danger-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            {t('projects', 'confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
