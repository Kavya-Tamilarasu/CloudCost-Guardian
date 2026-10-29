import React from 'react';
import { useApp } from '../context/AppContext';
import { DetectionRule } from '../types/cloud';
import { SeverityBadge } from '../components/common/Badge';
import {
  Sliders,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  FileCode,
  Terminal,
} from 'lucide-react';

export const RuleEngineView: React.FC = () => {
  const { rules, handleUpdateRule, setSelectedRuleForEdit, isScanning, runScan, wasteDetections } = useApp();

  const handleToggle = async (rule: DetectionRule) => {
    await handleUpdateRule(rule.id, { enabled: !rule.enabled });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Deterministic Rule Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Non-AI, transparent IF-THEN cloud cost optimization & waste detection policies
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Evaluating Policies...' : 'Re-run All Rules'}</span>
        </button>
      </div>

      {/* Academic / Deterministic Methodology Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Deterministic Policy Evaluation Architecture</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
            Non-AI Specification
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Unlike opaque deep-learning models, CloudCost Guardian evaluates cloud inventory against explicit,
          mathematically auditable <strong>IF-THEN clauses</strong>. Every detected waste item directly traces back
          to an enabled policy rule, observed CloudWatch metric, and configured threshold.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-slate-400">
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60">
            <span className="text-indigo-400 block font-bold">1. Ingest Telemetry</span>
            <span>CloudWatch / API specs</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60">
            <span className="text-indigo-400 block font-bold">2. Evaluate Condition</span>
            <span>Deterministic operators</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60">
            <span className="text-indigo-400 block font-bold">3. Classify Waste</span>
            <span>Severity & Savings factor</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60">
            <span className="text-indigo-400 block font-bold">4. Actionable Alerts</span>
            <span>Auditable recommendations</span>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Configurable Detection Policies ({rules.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Active: <strong className="text-slate-900 dark:text-white">{rules.filter((r) => r.enabled).length}</strong> / {rules.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Rule Code</th>
                <th className="py-3 px-4 font-semibold">Rule Name</th>
                <th className="py-3 px-4 font-semibold">Resource Scope</th>
                <th className="py-3 px-4 font-semibold">Evaluated Condition</th>
                <th className="py-3 px-4 font-semibold">Threshold</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Matches</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Configure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map((rule) => {
                const matchCount = wasteDetections.filter((d) => d.ruleCode === rule.code).length;
                return (
                  <tr
                    key={rule.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      !rule.enabled ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {rule.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {rule.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {rule.resourceType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-w-xs">
                      {rule.conditionDescription}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {rule.operator} {rule.threshold} {rule.thresholdUnit}
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={rule.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          matchCount > 0
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {matchCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(rule)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          rule.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            rule.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRuleForEdit(rule)}
                        className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Tune Threshold
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
