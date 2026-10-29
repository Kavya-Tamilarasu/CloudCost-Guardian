import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DetectionRule, SeverityLevel } from '../../types/cloud';
import { SeverityBadge } from './Badge';
import { X, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';

export const RuleEditModal: React.FC = () => {
  const { selectedRuleForEdit, setSelectedRuleForEdit, handleUpdateRule } = useApp();
  const [threshold, setThreshold] = useState<string | number>('');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedRuleForEdit) {
      setThreshold(selectedRuleForEdit.threshold);
      setSeverity(selectedRuleForEdit.severity);
      setEnabled(selectedRuleForEdit.enabled);
    }
  }, [selectedRuleForEdit]);

  if (!selectedRuleForEdit) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedThreshold = isNaN(Number(threshold)) ? threshold : Number(threshold);
      await handleUpdateRule(selectedRuleForEdit.id, {
        threshold: parsedThreshold,
        severity,
        enabled,
      });
      setSelectedRuleForEdit(null);
    } catch (err) {
      console.error('Failed to save rule updates:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="rule-edit-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {selectedRuleForEdit.code}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Configure Detection Rule
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic Rule Threshold Tuning
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRuleForEdit(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Rule Name & Category Info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Rule Definition
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
              {selectedRuleForEdit.name}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
              {selectedRuleForEdit.conditionDescription}
            </p>
          </div>

          {/* Enabled Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white block">
                Rule Active Status
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                When enabled, resources will be evaluated against this rule.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Threshold Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Evaluation Threshold ({selectedRuleForEdit.thresholdUnit})
            </label>
            <div className="relative">
              <input
                type="text"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="Enter threshold value"
                required
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">
                {selectedRuleForEdit.operator} {selectedRuleForEdit.thresholdUnit}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Metric: <code className="font-mono">{selectedRuleForEdit.metric}</code>
            </p>
          </div>

          {/* Severity Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Alert Severity Level
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="Critical">Critical - Immediate budget/security breach</option>
              <option value="High">High - Significant resource waste</option>
              <option value="Medium">Medium - Moderate cost leakage</option>
              <option value="Low">Low - Minor optimization opportunity</option>
              <option value="Info">Info - Informational baseline metric</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedRuleForEdit(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Applying & Re-evaluating...' : 'Save & Re-evaluate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
