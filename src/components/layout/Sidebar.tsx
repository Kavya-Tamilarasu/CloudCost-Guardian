import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Server,
  Trash2,
  TrendingDown,
  Bell,
  Lightbulb,
  Sliders,
  FileText,
  Settings,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'waste' | 'alerts' | 'rules' | 'recommendations';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'resources', label: 'Resources', icon: Server },
  { id: 'waste', label: 'Waste Detection', icon: Trash2, badgeKey: 'waste' },
  { id: 'costs', label: 'Cost Analysis', icon: TrendingDown },
  { id: 'alerts', label: 'Alerts', icon: Bell, badgeKey: 'alerts' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, badgeKey: 'recommendations' },
  { id: 'rules', label: 'Rules', icon: Sliders, badgeKey: 'rules' },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    wasteDetections,
    unreadAlertsCount,
    recommendations,
    rules,
    resources,
  } = useApp();

  const getBadge = (key?: string) => {
    switch (key) {
      case 'waste':
        const count = wasteDetections.length;
        return count > 0 ? (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            {count}
          </span>
        ) : null;
      case 'alerts':
        return unreadAlertsCount > 0 ? (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500 text-white">
            {unreadAlertsCount}
          </span>
        ) : null;
      case 'recommendations':
        const pending = recommendations.filter((r) => r.status === 'Pending').length;
        return pending > 0 ? (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {pending}
          </span>
        ) : null;
      case 'rules':
        const activeRules = rules.filter((r) => r.enabled).length;
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-400">
            {activeRules}/{rules.length}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors">
      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Cloud Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {getBadge(item.badgeKey)}
            </button>
          );
        })}
      </div>

      {/* College Project / Non-AI Academic Badge */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-xs space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Academic Specification</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Cloud Computing Domain Project. Transparent, deterministic IF-THEN rule-based detection engine.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Resources: {resources.length}</span>
            <span>Rules: {rules.length}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
