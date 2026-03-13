"use client";

import React from 'react';
import { 
  Shield, 
  Cpu, 
  Globe, 
  Clock, 
  CheckCircle2, 
  RefreshCcw, 
  Plus,
  Network,
  Activity,
  Zap,
  Lock,
  Eye,
  Server,
  TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

const flData = [
  { round: 1, accuracy: 0.65, loss: 0.45 },
  { round: 2, accuracy: 0.72, loss: 0.38 },
  { round: 3, accuracy: 0.78, loss: 0.32 },
  { round: 4, accuracy: 0.84, loss: 0.24 },
  { round: 5, accuracy: 0.88, loss: 0.18 },
  { round: 6, accuracy: 0.91, loss: 0.14 },
  { round: 7, accuracy: 0.92, loss: 0.11 },
  { round: 8, accuracy: 0.934, loss: 0.09 },
];

const nodes = [
  { name: 'Deutsche Telekom', region: 'Germany', status: 'online', nodes: 4200, lastSync: '12s ago', contribution: '34%' },
  { name: 'Orange SA', region: 'France', status: 'online', nodes: 2800, lastSync: '5s ago', contribution: '28%' },
  { name: 'Telefónica', region: 'Spain', status: 'offline', nodes: 1500, lastSync: '1h ago', contribution: '0%' },
  { name: 'TIM SpA', region: 'Italy', status: 'online', nodes: 3300, lastSync: '1 min ago', contribution: '22%' },
  { name: 'BT Group', region: 'UK', status: 'online', nodes: 3800, lastSync: '8s ago', contribution: '16%' },
];

const securityProtocols = [
  { name: 'Differential Privacy', detail: 'ε = 0.5 (Strict mode)', icon: Eye, color: 'blue' },
  { name: 'Secure Aggregation', detail: 'RSA-4096 Multi-party Computation', icon: Lock, color: 'emerald' },
  { name: 'Trusted Execution', detail: 'Intel SGX Enclave Attested', icon: Cpu, color: 'amber' },
  { name: 'Model Encryption', detail: 'AES-256-GCM at rest & transit', icon: Shield, color: 'violet' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } }
};

export default function FederationPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-8 space-y-6 dot-pattern min-h-screen">
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Federated <span className="animated-gradient-text">Learning</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Privacy-preserving model training across telecom operators</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-medium hover:border-slate-600 transition-all">
            <RefreshCcw className="w-4 h-4 text-slate-400" />
            Sync Nodes
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all">
            <Plus className="w-4 h-4" />
            New Training Round
          </button>
        </div>
      </motion.div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Accuracy Chart */}
        <motion.div variants={item} className="lg:col-span-3 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Global Model Convergence</h3>
              <p className="text-xs text-slate-500 mt-1">FedAvg accuracy across training rounds</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Round 8 Active</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flData}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="round" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Round', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 10 }} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px', backdropFilter: 'blur(12px)' }} itemStyle={{ color: '#e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} fill="url(#colorAcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Security Protocols */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Security Protocols</h3>
            <p className="text-xs text-slate-500 mt-1">Active privacy mechanisms</p>
          </div>
          <div className="space-y-3">
            {securityProtocols.map((protocol, index) => (
              <motion.div 
                key={protocol.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/30 hover:border-slate-700/50 transition-all"
              >
                <div className={`p-2 rounded-lg bg-${protocol.color}-500/10`}>
                  <protocol.icon className={`w-4 h-4 text-${protocol.color}-400`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{protocol.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{protocol.detail}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
              </motion.div>
            ))}
          </div>
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-400 leading-relaxed font-medium">
              🔒 No raw data leaves the operator's infrastructure. Only model gradients are aggregated using secure multi-party computation.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Operator Nodes */}
      <motion.div variants={item}>
        <h3 className="text-lg font-semibold text-white mb-4">Participating Operators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {nodes.map((node, index) => (
            <motion.div 
              key={node.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-5 relative overflow-hidden group"
            >
              {/* Status strip */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${node.status === 'online' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${node.status === 'online' ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                  <Globe className={`w-4 h-4 ${node.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${node.status === 'online' ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {node.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-0.5">{node.name}</h4>
              <p className="text-[10px] text-slate-500 mb-4">{node.region} · {node.nodes.toLocaleString()} nodes</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Contribution</span>
                  <span className="text-white font-semibold">{node.contribution}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3" />
                  SYNCED {node.lastSync}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Loss Chart */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Training Loss Curve</h3>
        <p className="text-xs text-slate-500 mb-6">Cross-entropy loss convergence</p>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={flData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="round" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
              <Line type="monotone" dataKey="loss" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
