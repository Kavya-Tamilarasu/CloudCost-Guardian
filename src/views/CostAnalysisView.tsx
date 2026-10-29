import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  TrendingDown,
  Trash2,
  PieChart as PieIcon,
  BarChart3,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const CostAnalysisView: React.FC = () => {
  const { summary, resources, wasteDetections, formatCost, setSelectedResource } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  const costTableData = useMemo(() => {
    return resources
      .map((res) => {
        const detection = wasteDetections.find((d) => d.resourceId === res.id);
        const wasteAmount = detection ? detection.estimatedMonthlyWaste : 0;
        const savingsAmount = detection ? detection.estimatedPotentialSavings : 0;
        const util =
          res.cpuUtilization !== undefined
            ? `${res.cpuUtilization.toFixed(1)}% CPU`
            : res.storageSizeGB
            ? `${res.storageSizeGB} GB`
            : res.status;

        return {
          id: res.id,
          name: res.name,
          service: res.service,
          monthlyCost: res.monthlyCost,
          utilization: util,
          potentialWaste: wasteAmount,
          potentialSavings: savingsAmount,
          resource: res,
        };
      })
      .filter((row) => {
        if (serviceFilter !== 'ALL' && row.service !== serviceFilter) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          return row.id.toLowerCase().includes(q) || row.name.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.monthlyCost - a.monthlyCost);
  }, [resources, wasteDetections, searchTerm, serviceFilter]);

  if (!summary) return null;

  const top5Expensive = [...resources].sort((a, b) => b.monthlyCost - a.monthlyCost).slice(0, 5);

  const handleExportCsv = () => {
    const headers = ['Resource ID', 'Name', 'Service', 'Monthly Cost (INR)', 'Utilization', 'Potential Waste', 'Estimated Potential Savings'];
    const rows = costTableData.map((r) => [
      r.id,
      `"${r.name}"`,
      r.service,
      r.monthlyCost,
      `"${r.utilization}"`,
      r.potentialWaste,
      r.potentialSavings,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CloudCost_Guardian_Cost_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Cloud Cost & Estimated Potential Savings Analysis
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resource-level financial breakdown, detected waste cost, and actionable rightsizing calculations
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Cost CSV</span>
        </button>
      </div>

      {/* Top 3 Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Monthly Cloud Cost
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCost(summary.totalCloudCost)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Combined on-demand gross cost across all monitored regions
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider block">
            Potential Waste Leakage
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCost(summary.potentialWaste)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Cost attributed to idle, underutilized, or orphaned assets
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Estimated Potential Savings
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
              Rule-Derived
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCost(summary.potentialSavings)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Projected recoverable budget upon applying rightsizing rules
          </p>
        </div>
      </div>

      {/* Top 5 Expensive Resources & Service Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Expensive Resources */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Top 5 Most Expensive Resources
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Highest individual monthly line items in cloud inventory
          </p>
          <div className="space-y-3">
            {top5Expensive.map((res, idx) => (
              <div
                key={res.id}
                onClick={() => setSelectedResource(res)}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">
                      {res.id}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[180px] block">
                      {res.name} ({res.service})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {formatCost(res.monthlyCost)}
                  </span>
                  <span className={`text-[10px] ${res.isWasteful ? 'text-amber-500 font-semibold' : 'text-slate-400'}`}>
                    {res.wasteStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Service Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Service-Level Financial Distribution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Gross expenditure aggregated across cloud service categories
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.serviceBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="service" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => formatCost(Number(val))}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="cost" fill="#6366F1" radius={[4, 4, 0, 0]} name="Service Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resource-Level Cost Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Resource-Level Cost & Savings Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Granular financial telemetry with estimated potential savings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
            />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">All Services</option>
              <option value="EC2">EC2</option>
              <option value="EBS">EBS</option>
              <option value="S3">S3</option>
              <option value="RDS">RDS</option>
              <option value="NAT_GATEWAY">NAT Gateway</option>
              <option value="ELASTIC_IP">Elastic IP</option>
              <option value="SNAPSHOT">Snapshots</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Resource</th>
                <th className="py-3 px-4 font-semibold">Service</th>
                <th className="py-3 px-4 font-semibold">Utilization</th>
                <th className="py-3 px-4 font-semibold">Monthly Cost</th>
                <th className="py-3 px-4 font-semibold">Potential Waste</th>
                <th className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  Estimated Potential Savings
                </th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {costTableData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedResource(row.resource)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">
                      {row.id}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px] block">
                      {row.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {row.service}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {row.utilization}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {formatCost(row.monthlyCost)}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {row.potentialWaste > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">{formatCost(row.potentialWaste)}</span>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {row.potentialSavings > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">{formatCost(row.potentialSavings)}</span>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResource(row.resource);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
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
