import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { WasteCategory, SeverityLevel } from '../types/cloud';
import { SeverityBadge, WasteBadge } from '../components/common/Badge';
import {
  Trash2,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const WasteDetectionView: React.FC = () => {
  const { wasteDetections, formatCost, setSelectedResource, resources, setCurrentView } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories: WasteCategory[] = [
    'Underutilized Resource',
    'Orphaned Storage',
    'Unused Network Resource',
    'Old Snapshot',
    'Cost Leakage Candidate',
    'Idle Resource',
  ];

  const filteredDetections = useMemo(() => {
    return wasteDetections.filter((d) => {
      if (selectedCategory !== 'ALL' && d.wasteCategory !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && d.severity !== selectedSeverity) return false;
      return true;
    });
  }, [wasteDetections, selectedCategory, selectedSeverity]);

  const totalWaste = filteredDetections.reduce((sum, d) => sum + d.estimatedMonthlyWaste, 0);
  const totalSavings = filteredDetections.reduce((sum, d) => sum + d.estimatedPotentialSavings, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            Deterministic Waste Detection Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rule-based identification of idle compute, orphaned volumes, unassociated IPs, and storage leakage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Waste: </span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{formatCost(totalWaste)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Estimated Potential Savings: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCost(totalSavings)}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          All Categories ({wasteDetections.length})
        </button>
        {categories.map((cat) => {
          const count = wasteDetections.filter((d) => d.wasteCategory === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1 rounded font-bold ${selectedCategory === cat ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detections List */}
      <div className="space-y-3">
        {filteredDetections.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            No waste detections found for the selected category.
          </div>
        ) : (
          filteredDetections.map((detection) => {
            const isExpanded = expandedId === detection.id;
            return (
              <div
                key={detection.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Resource ID & Rule metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {detection.resourceId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                        {detection.ruleCode}
                      </span>
                      <WasteBadge category={detection.wasteCategory} />
                      <SeverityBadge severity={detection.severity} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="font-semibold text-slate-800 dark:text-slate-200">
                        {detection.ruleName}:
                      </strong>{' '}
                      {detection.explanation.evaluationStep}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Service: <strong className="text-slate-700 dark:text-slate-300">{detection.service} ({detection.resourceType})</strong></span>
                      <span>Region: <strong className="text-slate-700 dark:text-slate-300">{detection.region}</strong></span>
                    </div>
                  </div>

                  {/* Middle: Metrics comparison */}
                  <div className="grid grid-cols-2 gap-3 sm:px-4 py-2 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-100 dark:border-slate-800 shrink-0 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Observed Metric:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {detection.observedValue}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Configured Threshold:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {detection.threshold}
                      </span>
                    </div>
                  </div>

                  {/* Right: Cost Impact & Action button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block">Est. Monthly Waste:</span>
                      <span className="text-base font-bold text-rose-600 dark:text-rose-400 block">
                        {formatCost(detection.estimatedMonthlyWaste)}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Save {formatCost(detection.estimatedPotentialSavings)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const res = resources.find((r) => r.id === detection.resourceId);
                          if (res) setSelectedResource(res);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : detection.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        title="Toggle rule logic explanation"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Explainable Logic Breakdown */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-xs space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                      <Info className="w-4 h-4 text-indigo-500" />
                      <span>Deterministic Rule Evaluation Trace</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-slate-400 block font-sans font-semibold text-xs">Evaluated Condition:</span>
                        <code className="text-indigo-600 dark:text-indigo-400 block">{detection.conditionMet}</code>
                      </div>

                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-slate-400 block font-sans font-semibold text-xs">Financial Impact Calculation:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-sans">{detection.explanation.impactReason}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-2 text-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">Actionable Recommendation:</strong>
                        <span>{detection.recommendedAction}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
