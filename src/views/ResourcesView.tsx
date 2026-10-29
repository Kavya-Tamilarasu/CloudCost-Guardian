import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CloudResource, CloudService, SeverityLevel } from '../types/cloud';
import { StatusBadge, SeverityBadge, WasteBadge } from '../components/common/Badge';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Server,
  Database,
  HardDrive,
  Network,
  RefreshCw,
} from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const { resources, formatCost, setSelectedResource, isScanning, runScan } = useApp();

  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wasteFilter, setWasteFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'id' | 'cost' | 'cpu' | 'storage' | 'status'>('cost');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matches =
          res.id.toLowerCase().includes(q) ||
          res.name.toLowerCase().includes(q) ||
          res.region.toLowerCase().includes(q) ||
          (res.instanceType && res.instanceType.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Service
      if (serviceFilter !== 'ALL' && res.service !== serviceFilter) return false;

      // Status
      if (statusFilter !== 'ALL' && res.status !== statusFilter) return false;

      // Waste Category
      if (wasteFilter !== 'ALL' && res.wasteStatus !== wasteFilter) return false;

      // Severity
      if (severityFilter !== 'ALL' && res.severity !== severityFilter) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'cost') comparison = a.monthlyCost - b.monthlyCost;
      else if (sortField === 'cpu') comparison = (a.cpuUtilization ?? 0) - (b.cpuUtilization ?? 0);
      else if (sortField === 'storage') comparison = (a.storageSizeGB ?? 0) - (b.storageSizeGB ?? 0);
      else if (sortField === 'id') comparison = a.id.localeCompare(b.id);
      else if (sortField === 'status') comparison = a.status.localeCompare(b.status);

      return sortAsc ? comparison : -comparison;
    });
  }, [resources, search, serviceFilter, statusFilter, wasteFilter, severityFilter, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for cost/metrics
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cloud Resource Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive catalog of compute, storage, and network cloud assets ({resources.length} scanned)
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>Refresh Inventory</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, name, region, instance type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Services (EC2, EBS, S3...)</option>
              <option value="EC2">EC2 Compute</option>
              <option value="EBS">EBS Storage</option>
              <option value="S3">S3 Buckets</option>
              <option value="RDS">RDS Databases</option>
              <option value="NAT_GATEWAY">NAT Gateways</option>
              <option value="ELASTIC_IP">Elastic IPs</option>
              <option value="SNAPSHOT">EBS Snapshots</option>
            </select>
          </div>

          {/* Waste Status Filter */}
          <div>
            <select
              value={wasteFilter}
              onChange={(e) => setWasteFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Health States</option>
              <option value="Healthy">Healthy (Optimal)</option>
              <option value="Underutilized Resource">Underutilized Compute</option>
              <option value="Orphaned Storage">Orphaned Storage</option>
              <option value="Unused Network Resource">Unused Network</option>
              <option value="Old Snapshot">Old Snapshot</option>
              <option value="Cost Leakage Candidate">Cost Leakage</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical Severity</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
              <option value="Info">Info (Healthy)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredResources.length}</strong> of{' '}
            {resources.length} cloud resources
          </span>
          {(search || serviceFilter !== 'ALL' || wasteFilter !== 'ALL' || severityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setServiceFilter('ALL');
                setStatusFilter('ALL');
                setWasteFilter('ALL');
                setSeverityFilter('ALL');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Resource ID <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Service & Type</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Region</th>
                <th
                  onClick={() => handleSort('cpu')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    CPU / Storage <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cost')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Monthly Cost <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Waste Status</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No cloud resources match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => setSelectedResource(res)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">
                        {res.id}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px] block">
                        {res.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {res.service}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {res.instanceType || res.storageType || res.resourceType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {res.region}
                    </td>
                    <td className="py-3 px-4">
                      {res.cpuUtilization !== undefined ? (
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {res.cpuUtilization.toFixed(1)}% CPU
                          </span>
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                res.cpuUtilization < 10
                                  ? 'bg-amber-500'
                                  : res.cpuUtilization > 80
                                  ? 'bg-red-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, res.cpuUtilization)}%` }}
                            />
                          </div>
                        </div>
                      ) : res.storageSizeGB ? (
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {res.storageSizeGB} GB
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCost(res.monthlyCost)}
                    </td>
                    <td className="py-3 px-4">
                      <WasteBadge category={res.wasteStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={res.severity} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResource(res);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
