import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, SeverityLevel, AlertStatus } from '../types/cloud';
import { SeverityBadge } from '../components/common/Badge';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  ShieldAlert,
  Clock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, handleUpdateAlertStatus, formatCost, setSelectedResource, resources } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      return true;
    });
  }, [alerts, severityFilter, statusFilter]);

  const activeCount = alerts.filter((a) => a.status === 'Active').length;
  const criticalCount = alerts.filter((a) => a.severity === 'Critical' && a.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Proactive Resource Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rule-triggered notifications for resource underutilization, orphaned storage, and budget anomalies
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 font-semibold">
            {criticalCount} Critical Active
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 font-semibold">
            {activeCount} Total Active
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Status:</span>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            {(['ALL', 'Active', 'Reviewed', 'Dismissed'] as const).map((st) => (
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
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            No alerts match your current filter parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isDismissed = alert.status === 'Dismissed';
            const isReviewed = alert.status === 'Reviewed';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isDismissed
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 opacity-60'
                    : isReviewed
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {alert.resourceId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                        {alert.ruleCode}
                      </span>
                      <SeverityBadge severity={alert.severity} />
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          alert.status === 'Active'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                            : alert.status === 'Reviewed'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {alert.reason}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Action: </span>
                      <span className="text-slate-600 dark:text-slate-400">{alert.recommendedAction}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span>Service: <strong className="text-slate-600 dark:text-slate-300">{alert.service}</strong></span>
                    </div>
                  </div>

                  {/* Right side cost impact and actions */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Cost Impact</span>
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {formatCost(alert.estimatedCostImpact)} / mo
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const res = resources.find((r) => r.id === alert.resourceId);
                          if (res) setSelectedResource(res);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      {alert.status !== 'Reviewed' && (
                        <button
                          onClick={() => handleUpdateAlertStatus(alert.id, 'Reviewed')}
                          className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                        </button>
                      )}

                      {alert.status !== 'Dismissed' && (
                        <button
                          onClick={() => handleUpdateAlertStatus(alert.id, 'Dismissed')}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
