import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Recommendation, RiskLevel, EffortLevel, RecommendationStatus } from '../types/cloud';
import {
  Lightbulb,
  CheckCircle,
  XCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const {
    recommendations,
    handleUpdateRecommendationStatus,
    formatCost,
    setSelectedResource,
    resources,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (riskFilter !== 'ALL' && r.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [recommendations, statusFilter, riskFilter]);

  const pendingSavings = recommendations
    .filter((r) => r.status === 'Pending')
    .reduce((sum, r) => sum + r.potentialMonthlySavings, 0);

  const approvedSavings = recommendations
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.potentialMonthlySavings, 0);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
            High Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            Medium Risk
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            Low Risk
          </span>
        );
    }
  };

  const getEffortBadge = (level: EffortLevel) => {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
        Effort: {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Deterministic Remediation Recommendations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Actionable rightsizing, storage decommission, and release recommendations derived from rule evaluations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Pending Savings: </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCost(pendingSavings)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Approved Savings: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCost(approvedSavings)}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Status:</span>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            {(['Pending', 'Approved', 'Dismissed', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Risk Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            No remediation recommendations match your current filter.
          </div>
        ) : (
          filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Left content */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {rec.resourceId}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({rec.service})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                      {rec.ruleCode}
                    </span>
                    {getRiskBadge(rec.riskLevel)}
                    {getEffortBadge(rec.effortLevel)}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        rec.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : rec.status === 'Dismissed'
                          ? 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {rec.action}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                {/* Middle Financial Comparison */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 shrink-0 text-xs grid grid-cols-3 gap-4 min-w-[300px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Current Cost</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {formatCost(rec.currentCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Projected</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {formatCost(rec.projectedCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase font-bold">
                      Est. Savings
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      +{formatCost(rec.potentialMonthlySavings)}
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const res = resources.find((r) => r.id === rec.resourceId);
                      if (res) setSelectedResource(res);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    View Resource
                  </button>

                  {rec.status === 'Pending' && (
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        onClick={() => handleUpdateRecommendationStatus(rec.id, 'Approved')}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateRecommendationStatus(rec.id, 'Dismissed')}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 text-xs transition-colors cursor-pointer"
                        title="Dismiss recommendation"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {rec.status === 'Approved' && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approved for Execution
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
