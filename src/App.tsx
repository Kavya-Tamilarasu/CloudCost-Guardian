import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ResourcesView } from './views/ResourcesView';
import { WasteDetectionView } from './views/WasteDetectionView';
import { CostAnalysisView } from './views/CostAnalysisView';
import { AlertsView } from './views/AlertsView';
import { RecommendationsView } from './views/RecommendationsView';
import { RuleEngineView } from './views/RuleEngineView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { ResourceModal } from './components/common/ResourceModal';
import { RuleEditModal } from './components/common/RuleEditModal';
import { AuthModal } from './components/common/AuthModal';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, isLoading, error } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'resources':
        return <ResourcesView />;
      case 'waste':
        return <WasteDetectionView />;
      case 'costs':
        return <CostAnalysisView />;
      case 'alerts':
        return <AlertsView />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'rules':
        return <RuleEngineView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-xl z-50">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Navigation Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setMobileMenuOpen(false)}>
                <Sidebar />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-mono text-slate-400 capitalize">{currentView} view</span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="font-semibold underline ml-3 cursor-pointer"
              >
                Reload App
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-3 text-slate-500">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Initializing CloudCost Guardian rule engine & inventory...</p>
            </div>
          ) : (
            renderCurrentView()
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ResourceModal />
      <RuleEditModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
