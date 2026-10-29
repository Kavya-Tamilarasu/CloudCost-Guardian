import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Cloud,
  DollarSign,
  Sliders,
  Bell,
  Key,
  ShieldCheck,
  Save,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currency,
    setCurrency,
    settings,
    saveSettings,
    handleUpdateRule,
    rules,
    formatCost,
  } = useApp();

  const [provider, setProvider] = useState(settings.cloudProvider);
  const [sensitivity, setSensitivity] = useState(settings.thresholdSensitivity);
  const [scanInterval, setScanInterval] = useState(settings.scanIntervalMinutes);
  const [inAppNotifs, setInAppNotifs] = useState(settings.inAppNotifications);
  const [emailNotifs, setEmailNotifs] = useState(settings.emailNotifications);
  const [emailRecipient, setEmailRecipient] = useState(settings.emailRecipient);
  const [awsRegion, setAwsRegion] = useState(settings.awsDefaultRegion);
  const [awsAccessKey, setAwsAccessKey] = useState(settings.awsAccessKeyPlaceholder);
  const [awsSecretKey, setAwsSecretKey] = useState(settings.awsSecretKeyPlaceholder);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSensitivityPreset = async (preset: 'Conservative' | 'Balanced' | 'Aggressive') => {
    setSensitivity(preset);
    // Adjust thresholds dynamically based on policy sensitivity
    if (preset === 'Aggressive') {
      // Flag more resources as waste (e.g. CPU < 15%)
      const r1 = rules.find((r) => r.code === 'RULE-001');
      if (r1) await handleUpdateRule(r1.id, { threshold: 15 });
    } else if (preset === 'Conservative') {
      // Only flag blatant waste (e.g. CPU < 5%)
      const r1 = rules.find((r) => r.code === 'RULE-001');
      if (r1) await handleUpdateRule(r1.id, { threshold: 5 });
    } else {
      // Balanced: standard 10%
      const r1 = rules.find((r) => r.code === 'RULE-001');
      if (r1) await handleUpdateRule(r1.id, { threshold: 10 });
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      cloudProvider: provider,
      currency,
      thresholdSensitivity: sensitivity,
      scanIntervalMinutes: scanInterval,
      inAppNotifications: inAppNotifs,
      emailNotifications: emailNotifs,
      emailRecipient,
      awsDefaultRegion: awsRegion,
      awsAccessKeyPlaceholder: awsAccessKey,
      awsSecretKeyPlaceholder: awsSecretKey,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            System & Cloud Integration Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure currency preference, rule sensitivity, background scanning, and AWS API connectivity
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Cloud Provider & Currency Selection */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-indigo-500" />
            Cloud Provider & Presentation Currency
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Cloud Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
              >
                <option value="AWS">Amazon Web Services (AWS) - Active</option>
                <option value="Azure" disabled>Microsoft Azure (Future Scope)</option>
                <option value="GCP" disabled>Google Cloud Platform (Future Scope)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Primary cloud infrastructure driver for discovery and metric collection.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Display Currency
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('INR')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    currency === 'INR'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ₹ Indian Rupee (INR)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  $ US Dollar (USD)
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Conversion Rate: 1 USD = 83.00 INR (Academic fixed peg)
              </span>
            </div>
          </div>
        </div>

        {/* Threshold Sensitivity Preset */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            Detection Rule Threshold Sensitivity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Conservative',
                name: 'Conservative Mode',
                desc: 'Minimizes false positives. Flags only severely idle compute (<5% CPU) and aged orphaned disks (>60 days).',
              },
              {
                id: 'Balanced',
                name: 'Balanced (Standard)',
                desc: 'Recommended baseline. Flags compute <10% CPU, unattached EBS immediately, and snapshot age >90 days.',
              },
              {
                id: 'Aggressive',
                name: 'Aggressive FinOps',
                desc: 'Maximizes cost savings. Flags compute <15% CPU, snapshots >30 days, and idle databases.',
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSensitivityPreset(p.id as any)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  sensitivity === p.id
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                  {sensitivity === p.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {p.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>Automated Inventory Scan Interval:</span>
            <select
              value={scanInterval}
              onChange={(e) => setScanInterval(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={15}>Every 15 Minutes</option>
              <option value={30}>Every 30 Minutes</option>
              <option value={60}>Every 1 Hour (Standard)</option>
              <option value={360}>Every 6 Hours</option>
              <option value={1440}>Once Daily (24h)</option>
            </select>
          </div>
        </div>

        {/* AWS Credentials & Connection Setup */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              AWS Integration Configuration (Future-Proof Interface)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
              Simulation Mode / Demo Data
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Academic Architecture Notice:</strong>
              These fields provide structured configuration for future AWS SDK client instantiation (IAM ReadOnlyAccess).
              In accordance with academic project guidelines, real cloud credentials are not stored or transmitted;
              the application currently operates on deterministic mock inventory telemetry.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Default AWS Region
              </label>
              <input
                type="text"
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                placeholder="ap-south-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                AWS Access Key ID (Placeholder)
              </label>
              <input
                type="text"
                value={awsAccessKey}
                onChange={(e) => setAwsAccessKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                placeholder="AKIAIOSFODNN7EXAMPLE"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                AWS Secret Access Key (Placeholder)
              </label>
              <input
                type="password"
                value={awsSecretKey}
                onChange={(e) => setAwsSecretKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              />
            </div>
          </div>
        </div>

        {/* Notifications Configuration */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            Alert Dispatch Preferences
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">In-App Critical Alerts</span>
                <span className="text-slate-500 dark:text-slate-400">Display header alert badge and unread notification counter</span>
              </div>
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={(e) => setInAppNotifs(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Email Dispatch (Placeholder)</span>
                <span className="text-slate-500 dark:text-slate-400">Email digests when new critical waste is identified</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {emailNotifs && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Recipient Notification Email
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  placeholder="finops-alerts@institution.edu"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
