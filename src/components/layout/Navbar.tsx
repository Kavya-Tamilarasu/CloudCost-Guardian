import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  Play,
  RotateCw,
  User,
  LogOut,
  LogIn,
  AlertTriangle,
  CheckCircle2,
  Database,
  Cloud,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currency,
    setCurrency,
    theme,
    toggleTheme,
    user,
    logout,
    setIsAuthModalOpen,
    unreadAlertsCount,
    alerts,
    isScanning,
    runScan,
    setCurrentView,
    setSelectedResource,
    resources,
  } = useApp();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === 'Active').slice(0, 5);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Project title & Cloud status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                CLOUDCOST GUARDIAN
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60">
                v1.0 Rule-Based
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
              Cloud Resource Waste & Cost Leakage Detection System
            </p>
          </div>
        </div>

        {/* Cloud Connection Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 ml-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>AWS Simulation Mode (Demo Data)</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-800/60 text-xs">
          <button
            onClick={() => setCurrency('INR')}
            className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              currency === 'INR'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ₹ INR
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              currency === 'USD'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            $ USD
          </button>
        </div>

        {/* Re-evaluate / Scan Button */}
        <button
          onClick={runScan}
          disabled={isScanning}
          title="Re-run deterministic rules across all inventory"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isScanning ? 'Evaluating...' : 'Run Rule Engine'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            aria-label="Notifications"
            className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Proactive Rule Alerts ({unreadAlertsCount})
                </span>
                <button
                  onClick={() => {
                    setIsAlertsOpen(false);
                    setCurrentView('alerts');
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {activeAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No active alerts. All cloud resources meet efficiency rules.
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        const res = resources.find((r) => r.id === alert.resourceId);
                        if (res) setSelectedResource(res);
                        setIsAlertsOpen(false);
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {alert.resourceId}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            alert.severity === 'Critical'
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                              : alert.severity === 'High'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {alert.reason}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Administrator Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
              {user.isAuthenticated ? user.name.charAt(0) : 'G'}
            </div>
            <div className="hidden xl:block text-left pr-1">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-none">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-none mt-0.5">
                {user.role}
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-1 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user.email || 'guest@preview'}</p>
              </div>
              {user.isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out Administrator
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-2 cursor-pointer transition-colors mt-1"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In as Administrator
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
