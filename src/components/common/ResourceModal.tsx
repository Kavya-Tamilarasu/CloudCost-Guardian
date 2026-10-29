import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, SeverityBadge, WasteBadge } from './Badge';
import { X, Server, Database, HardDrive, Network, Layers, ShieldAlert, Cpu, Calendar, DollarSign, Activity } from 'lucide-react';

export const ResourceModal: React.FC = () => {
  const { selectedResource, setSelectedResource, wasteDetections, formatCost } = useApp();

  if (!selectedResource) return null;

  const resourceDetections = wasteDetections.filter((d) => d.resourceId === selectedResource.id);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'EC2':
        return <Server className="w-5 h-5 text-amber-500" />;
      case 'EBS':
        return <HardDrive className="w-5 h-5 text-indigo-500" />;
      case 'S3':
        return <Database className="w-5 h-5 text-emerald-500" />;
      case 'RDS':
        return <Database className="w-5 h-5 text-blue-500" />;
      case 'NAT_GATEWAY':
      case 'ELASTIC_IP':
        return <Network className="w-5 h-5 text-purple-500" />;
      default:
        return <Layers className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="resource-detail-modal"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {getServiceIcon(selectedResource.service)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {selectedResource.id}
                </h3>
                <StatusBadge status={selectedResource.status} />
                <SeverityBadge severity={selectedResource.severity} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {selectedResource.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedResource(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Monthly Cost
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                {formatCost(selectedResource.monthlyCost)}
              </span>
              <span className="text-[11px] text-slate-400">AWS On-Demand Rate</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Waste Status
              </span>
              <div className="mt-1">
                <WasteBadge category={selectedResource.wasteStatus} />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {selectedResource.isWasteful ? 'Action Recommended' : 'Optimal Capacity'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Region / AZ
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block font-mono">
                {selectedResource.region} ({selectedResource.zone})
              </span>
              <span className="text-[11px] text-slate-400">AWS Datacenter</span>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Telemetry & CloudWatch Metrics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedResource.cpuUtilization !== undefined && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg CPU Utilization</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedResource.cpuUtilization.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400">p99 14-day</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedResource.cpuUtilization < 10
                          ? 'bg-amber-500'
                          : selectedResource.cpuUtilization > 85
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, selectedResource.cpuUtilization)}%` }}
                    />
                  </div>
                </div>
              )}

              {selectedResource.instanceType && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Instance Family</span>
                  <span className="text-base font-semibold text-slate-900 dark:text-white mt-1 block font-mono">
                    {selectedResource.instanceType}
                  </span>
                  <span className="text-[11px] text-slate-400">AWS Compute Spec</span>
                </div>
              )}

              {selectedResource.storageSizeGB !== undefined && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Storage Volume</span>
                  <span className="text-base font-semibold text-slate-900 dark:text-white mt-1 block">
                    {selectedResource.storageSizeGB} GB
                    {selectedResource.storageType && (
                      <span className="text-xs font-mono font-normal text-slate-500 ml-1">
                        ({selectedResource.storageType})
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400">Provisioned Capacity</span>
                </div>
              )}

              {selectedResource.metrics.ageDays !== undefined && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Uptime / Age</span>
                  <span className="text-base font-semibold text-slate-900 dark:text-white mt-1 block">
                    {selectedResource.metrics.ageDays} days
                  </span>
                  <span className="text-[11px] text-slate-400">Since Provisioning</span>
                </div>
              )}

              {selectedResource.metrics.attachedTo !== undefined && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Attachment Mapping</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white mt-1 block font-mono">
                    {selectedResource.metrics.attachedTo || 'None (Orphaned)'}
                  </span>
                  <span className="text-[11px] text-slate-400">Parent Instance ID</span>
                </div>
              )}

              {selectedResource.metrics.lastAccessDays !== undefined && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Last Ingress / Access</span>
                  <span className="text-base font-semibold text-slate-900 dark:text-white mt-1 block">
                    {selectedResource.metrics.lastAccessDays} days ago
                  </span>
                  <span className="text-[11px] text-slate-400">S3 Access Logs</span>
                </div>
              )}
            </div>
          </div>

          {/* Detections / Active Rule Violations */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Explainable Rule Engine Violations ({resourceDetections.length})
            </h4>

            {resourceDetections.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm">
                No waste rules violated. Resource conforms to configured efficiency thresholds.
              </div>
            ) : (
              <div className="space-y-3">
                {resourceDetections.map((detection) => (
                  <div
                    key={detection.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {detection.ruleCode}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {detection.ruleName}
                        </span>
                      </div>
                      <SeverityBadge severity={detection.severity} />
                    </div>

                    <div className="text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 block mb-1">// Deterministic Evaluation Logic:</span>
                      {detection.conditionMet}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Observed Metric:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {detection.observedValue}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Threshold:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {detection.threshold}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Actionable Remediation: </span>
                      <span className="text-slate-600 dark:text-slate-400">{detection.recommendedAction}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                      <span>Potential Monthly Savings:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCost(detection.estimatedPotentialSavings)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {selectedResource.tags && Object.keys(selectedResource.tags).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                AWS Resource Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(selectedResource.tags).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono"
                  >
                    <span className="text-slate-400">{k}:</span>
                    <span className="ml-1 font-semibold">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>Last Rule Scan: {new Date(selectedResource.lastChecked).toLocaleString()}</span>
          <button
            onClick={() => setSelectedResource(null)}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
