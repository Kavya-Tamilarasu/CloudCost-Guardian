import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { summary, resources, wasteDetections, recommendations, formatCost } = useApp();

  const [reportType, setReportType] = useState<'cost' | 'waste' | 'inventory' | 'optimization'>('cost');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  if (!summary) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    let filename = '';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'cost') {
      filename = `CloudCost_Guardian_Monthly_Cost_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['Service', 'Monthly Cost (INR)', 'Detected Waste (INR)', 'Potential Savings (INR)'];
      rows = summary.serviceBreakdown.map((s) => [s.service, s.cost, s.waste, s.cost - s.waste]);
    } else if (reportType === 'waste') {
      filename = `CloudCost_Guardian_Waste_Summary_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['Resource ID', 'Service', 'Rule Code', 'Rule Name', 'Observed Value', 'Severity', 'Monthly Waste (INR)', 'Estimated Potential Savings (INR)'];
      rows = wasteDetections.map((w) => [w.resourceId, w.service, w.ruleCode, `"${w.ruleName}"`, `"${w.observedValue}"`, w.severity, w.estimatedMonthlyWaste, w.estimatedPotentialSavings]);
    } else if (reportType === 'inventory') {
      filename = `CloudCost_Guardian_Resource_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['Resource ID', 'Name', 'Service', 'Type', 'Region', 'Status', 'Monthly Cost (INR)', 'Waste Status'];
      rows = resources.map((r) => [r.id, `"${r.name}"`, r.service, r.instanceType || r.storageType || r.resourceType, r.region, r.status, r.monthlyCost, r.wasteStatus]);
    } else {
      filename = `CloudCost_Guardian_Optimization_Opportunities_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['Resource ID', 'Action', 'Current Cost (INR)', 'Projected Cost (INR)', 'Monthly Savings (INR)', 'Risk Level', 'Status'];
      rows = recommendations.map((rec) => [rec.resourceId, `"${rec.action}"`, rec.currentCost, rec.projectedCost, rec.potentialMonthlySavings, rec.riskLevel, rec.status]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Audit & FinOps Compliance Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate executive cost leak summaries, inventory audits, and exportable CSV ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Template Selector & Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <button
          onClick={() => setReportType('cost')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            reportType === 'cost'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Monthly Cost Summary</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Aggregated gross spend and service distribution
          </p>
        </button>

        <button
          onClick={() => setReportType('waste')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            reportType === 'waste'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <TrendingDown className="w-5 h-5 text-rose-500 mb-2" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Waste Summary Report</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Violated IF-THEN rules and quantified leakage
          </p>
        </button>

        <button
          onClick={() => setReportType('inventory')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            reportType === 'inventory'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <FileText className="w-5 h-5 text-amber-500 mb-2" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Resource Inventory Audit</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Catalog of all 30 scanned cloud resources
          </p>
        </button>

        <button
          onClick={() => setReportType('optimization')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            reportType === 'optimization'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Optimization Opportunities</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Actionable rightsizing, stopping, and cleanup ledger
          </p>
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs print:hidden">
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>Report Evaluation Timeframe:</span>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
          {['Last 30 Days', 'Last 90 Days', 'Current Quarter', 'All-Time Simulation'].map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                dateRange === d
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Report View (Styled for both on-screen and print) */}
      <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 print:border-none print:p-0 print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                CLOUDCOST GUARDIAN // EXECUTIVE REPORT
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {reportType === 'cost' && 'Monthly Cloud Cost & Waste Summary'}
              {reportType === 'waste' && 'Deterministic Waste Detection Audit'}
              {reportType === 'inventory' && 'Active Cloud Resource Inventory Log'}
              {reportType === 'optimization' && 'Remediation Opportunities & Financial Impact'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generated: {new Date().toLocaleString()} | Period: {dateRange} | System Engine: Deterministic IF-THEN
            </p>
          </div>
          <div className="text-right">
            <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              AUDIT SPEC V1.0
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Academic Prototype</p>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Cloud Cost</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatCost(summary.totalCloudCost)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Detected Waste Leakage</span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
              {formatCost(summary.potentialWaste)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Est. Potential Savings</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {formatCost(summary.potentialSavings)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Resources Evaluated</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
              {summary.resourcesScanned} ({summary.wastefulResourcesCount} flagged)
            </span>
          </div>
        </div>

        {/* Dynamic Table Content based on selected report type */}
        <div className="overflow-x-auto">
          {reportType === 'cost' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Service Category</th>
                  <th className="py-2.5">Gross Monthly Spend</th>
                  <th className="py-2.5">Identified Waste</th>
                  <th className="py-2.5">Optimized Target</th>
                  <th className="py-2.5 text-right">% of Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary.serviceBreakdown.map((s) => (
                  <tr key={s.service} className="py-2">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{s.service}</td>
                    <td className="py-2.5">{formatCost(s.cost)}</td>
                    <td className="py-2.5 text-rose-600 dark:text-rose-400 font-semibold">{formatCost(s.waste)}</td>
                    <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">{formatCost(s.cost - s.waste)}</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">
                      {((s.cost / (summary.totalCloudCost || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'waste' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Resource ID</th>
                  <th className="py-2.5">Violated Rule</th>
                  <th className="py-2.5">Observed Metric</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Monthly Waste</th>
                  <th className="py-2.5 text-right">Estimated Potential Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {wasteDetections.map((w) => (
                  <tr key={w.id} className="py-2">
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">{w.resourceId}</td>
                    <td className="py-2.5">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{w.ruleCode}</span>: {w.ruleName}
                    </td>
                    <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">{w.observedValue}</td>
                    <td className="py-2.5">{w.severity}</td>
                    <td className="py-2.5 text-rose-600 dark:text-rose-400 font-semibold">{formatCost(w.estimatedMonthlyWaste)}</td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">{formatCost(w.estimatedPotentialSavings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'inventory' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Service</th>
                  <th className="py-2.5">Region</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Monthly Cost</th>
                  <th className="py-2.5 text-right">Health Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resources.map((r) => (
                  <tr key={r.id} className="py-2">
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">{r.id}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-400">{r.name}</td>
                    <td className="py-2.5 font-medium">{r.service}</td>
                    <td className="py-2.5 font-mono text-[11px]">{r.region}</td>
                    <td className="py-2.5">{r.status}</td>
                    <td className="py-2.5 font-bold">{formatCost(r.monthlyCost)}</td>
                    <td className="py-2.5 text-right">{r.wasteStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'optimization' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Target Resource</th>
                  <th className="py-2.5">Recommended Remediation</th>
                  <th className="py-2.5">Current Cost</th>
                  <th className="py-2.5">Projected Cost</th>
                  <th className="py-2.5">Monthly Recovery</th>
                  <th className="py-2.5 text-right">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="py-2">
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">{rec.resourceId}</td>
                    <td className="py-2.5 font-medium">{rec.action}</td>
                    <td className="py-2.5 font-mono">{formatCost(rec.currentCost)}</td>
                    <td className="py-2.5 font-mono">{formatCost(rec.projectedCost)}</td>
                    <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{formatCost(rec.potentialMonthlySavings)}</td>
                    <td className="py-2.5 text-right font-semibold">{rec.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Academic Project Audit Certification Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>College Academic Project: Cloud Resource Waste & Cost Leakage Detection System</span>
          <span>Verified Non-AI Deterministic Rule Calculation</span>
        </div>
      </div>
    </div>
  );
};
