import React from 'react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import {
  DollarSign,
  TrendingDown,
  Sparkles,
  Server,
  Trash2,
  AlertOctagon,
  ArrowRight,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { summary, formatCost, setCurrentView, setSelectedResource, resources } = useApp();

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading CloudCost Guardian dashboard metrics...
      </div>
    );
  }

  const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EC4899', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Sample Data Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-indigo-900 dark:text-indigo-200">
            <strong className="font-semibold">Demonstration Cloud Dataset:</strong> Current metrics reflect simulated
            enterprise resources evaluated by the transparent deterministic rule engine. Ready for future AWS integration.
          </span>
        </div>
        <button
          onClick={() => setCurrentView('rules')}
          className="self-start sm:self-auto font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          Inspect Active Rules <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          id="kpi-total-cost"
          title="Total Cloud Cost"
          value={formatCost(summary.totalCloudCost)}
          description="Monthly cloud expenditure"
          trend={{ value: '+3.8%', isPositive: false, label: 'vs baseline' }}
          icon={DollarSign}
          variant="default"
        />
        <MetricCard
          id="kpi-potential-waste"
          title="Potential Waste"
          value={formatCost(summary.potentialWaste)}
          description="Estimated cost from detected waste"
          trend={{ value: `${((summary.potentialWaste / (summary.totalCloudCost || 1)) * 100).toFixed(0)}%`, isPositive: false, label: 'of total' }}
          icon={Trash2}
          variant="danger"
        />
        <MetricCard
          id="kpi-potential-savings"
          title="Estimated Potential Savings"
          value={formatCost(summary.potentialSavings)}
          description="Estimated avoidable expenditure"
          trend={{ value: `${((summary.potentialSavings / (summary.totalCloudCost || 1)) * 100).toFixed(0)}%`, isPositive: true, label: 'recovery' }}
          icon={TrendingDown}
          variant="success"
        />
        <MetricCard
          id="kpi-resources-scanned"
          title="Resources Scanned"
          value={summary.resourcesScanned.toString()}
          description="Cloud resources evaluated"
          trend={{ value: '100%', isPositive: true, label: 'covered' }}
          icon={Server}
          variant="default"
        />
        <MetricCard
          id="kpi-wasteful-resources"
          title="Wasteful Resources"
          value={summary.wastefulResourcesCount.toString()}
          description="Resources violating configured rules"
          trend={{ value: `${((summary.wastefulResourcesCount / (summary.resourcesScanned || 1)) * 100).toFixed(0)}%`, isPositive: false, label: 'flagged' }}
          icon={AlertOctagon}
          variant="warning"
        />
        <MetricCard
          id="kpi-critical-issues"
          title="Critical Issues"
          value={summary.criticalIssuesCount.toString()}
          description="High-priority detected issues"
          trend={{ value: 'P0', isPositive: false, label: 'severity' }}
          icon={ShieldAlert}
          variant="danger"
        />
      </div>

      {/* Primary Charts Row: Monthly Trend & Resource Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Cost & Waste Trend (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Monthly Cost & Waste Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                6-Month trajectory comparing gross cost vs. detected waste leakage
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Total Cost
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Detected Waste
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Potential Savings
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  formatter={(val: any) => formatCost(Number(val))}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="totalCost" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Cost" />
                <Area type="monotone" dataKey="wasteCost" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorWaste)" name="Waste Cost" />
                <Line type="monotone" dataKey="optimizedCost" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Potential Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Health Donut (1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Resource Health Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of health & optimization states
            </p>
          </div>
          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.resourceHealth}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {summary.resourceHealth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} resources (${((Number(value) / (summary.resourcesScanned || 1)) * 100).toFixed(0)}%)`,
                    item.payload.status,
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {summary.resourceHealth.map((h) => (
              <div key={h.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.color }}></span>
                <span className="text-slate-600 dark:text-slate-400 truncate">{h.status}:</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">{h.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts: Cost by Cloud Service & Waste by Resource Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Cloud Service */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Cost & Waste by Cloud Service
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly expenditure vs waste across AWS services
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">INR (₹)</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.serviceBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="service" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  formatter={(val: any) => formatCost(Number(val))}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="cost" fill="#6366F1" radius={[4, 4, 0, 0]} name="Total Cost" />
                <Bar dataKey="waste" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Detected Waste" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste by Resource Type */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Waste by Classification Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic detection categorizations
              </p>
            </div>
            <button
              onClick={() => setCurrentView('waste')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Detections <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.wasteByType}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={120} stroke="#64748b" />
                <Tooltip
                  formatter={(val: any) => formatCost(Number(val))}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="wasteAmount" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Waste Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Waste Detections Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Waste Detections
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest resources violating deterministic efficiency rules
            </p>
          </div>
          <button
            onClick={() => setCurrentView('waste')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All {summary.wastefulResourcesCount} Detections <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Resource ID</th>
                <th className="pb-3 font-semibold">Service</th>
                <th className="pb-3 font-semibold">Triggered Rule</th>
                <th className="pb-3 font-semibold">Observed Metric</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Est. Monthly Waste</th>
                <th className="pb-3 font-semibold">Est. Potential Savings</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {summary.recentDetections.map((detection) => (
                <tr key={detection.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {detection.resourceId}
                    <span className="block text-[10px] font-normal text-slate-400 font-sans truncate max-w-[140px]">
                      {detection.resourceName}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                    {detection.service}
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold block">
                      {detection.ruleCode}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] block">
                      {detection.ruleName}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-700 dark:text-slate-300">
                    {detection.observedValue}
                  </td>
                  <td className="py-3">
                    <SeverityBadge severity={detection.severity} />
                  </td>
                  <td className="py-3 font-semibold text-red-600 dark:text-red-400">
                    {formatCost(detection.estimatedMonthlyWaste)}
                  </td>
                  <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCost(detection.estimatedPotentialSavings)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        const target = resources.find((r) => r.id === detection.resourceId);
                        if (target) setSelectedResource(target);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
