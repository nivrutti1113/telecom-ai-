"use client";

import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  Terminal, 
  CloudDownload, 
  CheckCircle2, 
  ShieldAlert, 
  Search,
  Settings,
  MoreVertical,
  Activity,
  Database,
  RefreshCcw,
  Play,
  Layers,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const deployments = [
  { id: 'DP-7721', model: 'Anomaly_Detector_v2.4', target: 'Dallas_Edge_Cluster', status: 'deployed', version: '2.4.1', health: 99.8, latency: '3.2ms' },
  { id: 'DP-7719', model: 'Traffic_Forecaster_LTS', target: 'NY_Core_Hubs', status: 'deploying', version: '1.2.0', health: 82, latency: '---' },
  { id: 'DP-7690', model: 'Predictive_Maintenance', target: 'EU_West_Towers', status: 'error', version: '3.0.1', health: 0, latency: '---' },
  { id: 'DP-7582', model: 'Signal_Optimizer_v1', target: 'Global_Edge_Nodes', status: 'deployed', version: '1.0.5', health: 94.2, latency: '4.8ms' },
  { id: 'DP-7540', model: 'Congestion_Predictor', target: 'APAC_Cluster', status: 'deployed', version: '2.1.0', health: 97.6, latency: '5.1ms' },
];

const inferenceData = [
  { time: '00:00', inferences: 620 },
  { time: '04:00', inferences: 380 },
  { time: '08:00', inferences: 850 },
  { time: '12:00', inferences: 1120 },
  { time: '16:00', inferences: 980 },
  { time: '20:00', inferences: 740 },
  { time: '23:59', inferences: 580 },
];

const consoleLines = [
  { text: '// System initializing ONNX Runtime provider...', color: 'text-slate-500' },
  { text: 'SUCCESS: NVIDIA TensorRT provider ready', color: 'text-emerald-400' },
  { text: '> tower_agent --sync --all --region=GLOBAL', color: 'text-white' },
  { text: 'INFO: Requesting Model_Sync from Central_Registry...', color: 'text-slate-500' },
  { text: '[sync] 12,482 edge nodes contacted... 12,440 responded (99.6%)', color: 'text-blue-400' },
  { text: '[deploy] Model Anomaly_Detector_v2.4 pushed to 842 nodes', color: 'text-cyan-400' },
  { text: '[perf] Avg inference latency: 4.2ms | Packet loss: 0%', color: 'text-emerald-400' },
  { text: '[warn] Node EU-West-042 running on fallback model v2.3', color: 'text-amber-400' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } }
};

export default function EdgeManagerPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-8 space-y-6 dot-pattern min-h-screen">
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Edge AI <span className="animated-gradient-text">Manager</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Deploy, monitor, and update ML models across 12k+ edge nodes</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-medium hover:border-slate-600 transition-all">
            <Settings className="w-4 h-4 text-slate-400" />
            Runtime Config
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all">
            <CloudDownload className="w-4 h-4" />
            Deploy Model
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Edge Runtimes', value: '12,482', sub: '99.6% healthy', icon: Zap, color: 'blue' },
          { label: 'Total Inferences/sec', value: '842K', sub: 'Global throughput', icon: Cpu, color: 'emerald' },
          { label: 'Avg Inference Latency', value: '4.2ms', sub: 'TensorRT accelerated', icon: Activity, color: 'cyan' },
          { label: 'Model Storage', value: '12.4 TB', sub: 'Compressed ONNX', icon: Database, color: 'violet' },
        ].map((stat, index) => (
          <motion.div 
            key={stat.label}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl p-6 stat-strip"
            style={{ '--strip-color': stat.color === 'blue' ? '#3b82f6' : stat.color === 'emerald' ? '#10b981' : stat.color === 'cyan' ? '#06b6d4' : '#8b5cf6' } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            <p className="text-[10px] text-slate-600 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Deployment Table */}
        <motion.div variants={item} className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-white">Model Deployments</span>
            </div>
          </div>
          <div className="divide-y divide-slate-800/30">
            {deployments.map((deploy, index) => (
              <motion.div 
                key={deploy.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.08 }}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  deploy.status === 'deployed' ? 'bg-emerald-500/10' :
                  deploy.status === 'deploying' ? 'bg-blue-500/10' : 'bg-rose-500/10'
                }`}>
                  {deploy.status === 'deployed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {deploy.status === 'deploying' && <RefreshCcw className="w-4 h-4 text-blue-400 animate-spin" />}
                  {deploy.status === 'error' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{deploy.model}</span>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">v{deploy.version}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{deploy.target}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${deploy.health}%` }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`h-full rounded-full ${deploy.health > 90 ? 'bg-emerald-500' : deploy.health > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{deploy.health}%</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">{deploy.latency}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Inference Chart + Console */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div variants={item} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Inference Throughput (K/s)</h3>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inferenceData}>
                  <defs>
                    <linearGradient id="colorInference" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="inferences" stroke="#06b6d4" strokeWidth={2} fill="url(#colorInference)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Edge Runtime Console
              </h3>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400">LIVE</span>
              </div>
            </div>
            <div className="p-4 bg-[#0a0a14] rounded-xl border border-slate-800/30 font-mono text-[11px] space-y-1.5 max-h-[200px] overflow-y-auto">
              {consoleLines.map((line, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className={line.color}
                >
                  {line.text}
                </motion.div>
              ))}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/20">
                <div className="w-1.5 h-4 bg-blue-500 animate-pulse" />
                <span className="text-slate-700">Type a command...</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
