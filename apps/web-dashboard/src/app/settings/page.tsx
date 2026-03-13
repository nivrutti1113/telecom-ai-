"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Monitor, 
  Globe,
  Shield,
  Key,
  Save,
  Moon,
  Sun,
  Palette,
  Database,
  Mail,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-8 space-y-6 dot-pattern min-h-screen">
      <motion.div variants={item}>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Platform <span className="animated-gradient-text">Settings</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Configure your account, security, and platform preferences</p>
      </motion.div>

      <motion.div variants={item} className="flex gap-6">
        {/* Left tabs */}
        <div className="w-56 space-y-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'glass-card text-white glow-blue' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 glass-card rounded-2xl p-8">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Profile Settings</h2>
                <p className="text-sm text-slate-500">Manage your account information</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">
                  JD
                </div>
                <div>
                  <button className="px-4 py-2 glass rounded-xl text-sm font-medium hover:border-slate-600 transition-all">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Email</label>
                  <input type="email" defaultValue="john@telecom-ai.com" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Role</label>
                  <input type="text" defaultValue="Network Architect" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Organization</label>
                  <input type="text" defaultValue="TelcomAI Corp" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Security</h2>
                <p className="text-sm text-slate-500">Manage authentication and access controls</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', enabled: true },
                  { label: 'Session Timeout', desc: 'Auto logout after 30 minutes of inactivity', enabled: true },
                  { label: 'API Rate Limiting', desc: '100 requests per minute per API key', enabled: true },
                  { label: 'IP Whitelisting', desc: 'Restrict access to specific IP ranges', enabled: false },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-xl border border-slate-800/30">
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{setting.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${setting.enabled ? 'bg-blue-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Notifications</h2>
                <p className="text-sm text-slate-500">Configure how you receive alerts</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Critical Anomalies', desc: 'Severity > 0.9', channels: ['Email', 'SMS', 'Push'], icon: Mail },
                  { label: 'Model Deployments', desc: 'Deploy success/failure alerts', channels: ['Email', 'Push'], icon: Database },
                  { label: 'Federation Updates', desc: 'Training round completions', channels: ['Push'], icon: Globe },
                  { label: 'System Health', desc: 'Downtime and degradation alerts', channels: ['Email', 'SMS'], icon: Monitor },
                ].map((notif) => (
                  <div key={notif.label} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <notif.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{notif.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {notif.channels.map((ch) => (
                        <span key={ch} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg uppercase">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Appearance</h2>
                <p className="text-sm text-slate-500">Customize the platform look and feel</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-blue-500/30 flex items-center gap-4">
                  <Moon className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500">Currently active</p>
                  </div>
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg">Active</div>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/30 flex items-center gap-4 opacity-50">
                  <Sun className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Light Mode</p>
                    <p className="text-xs text-slate-500">Coming soon</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">API Keys</h2>
                <p className="text-sm text-slate-500">Manage API access for external integrations</p>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Production Key', key: 'tk_prod_••••••••••••a7f2', created: '2026-01-15', lastUsed: '2 mins ago' },
                  { name: 'Staging Key', key: 'tk_stg_••••••••••••c1d4', created: '2026-02-01', lastUsed: '3 hrs ago' },
                ].map((apiKey) => (
                  <div key={apiKey.name} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/30 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{apiKey.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{apiKey.key}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">Last used {apiKey.lastUsed}</p>
                      <button className="text-xs text-rose-400 font-medium hover:text-rose-300 mt-1">Revoke</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white">
                <Key className="w-4 h-4" />
                Generate New Key
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
