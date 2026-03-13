"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter,
  MoreVertical,
  Activity,
  MapPin,
  Flame,
  Zap,
  RefreshCcw,
  ArrowUpRight,
  Brain,
  Shield,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const anomalies = [
  { 
    id: 'AL-9021', 
    tower: 'Tower-742 (Dallas)', 
    severity: 'critical', 
    type: 'Hardware Failure', 
    score: 0.98,
    timestamp: '2 mins ago',
    status: 'active',
    reason: 'Power supply degradation detected by local Edge AI. PSU efficiency dropped from 94% to 61% within 120 seconds. Failover protocol initiated.',
    model: 'Autoencoder v2.4'
  },
  { 
    id: 'AL-9018', 
    tower: 'Tower-104 (New York)', 
    severity: 'high', 
    type: 'Congestion Spike', 
    score: 0.84,
    timestamp: '14 mins ago',
    status: 'active',
    reason: 'Unexpected 400% surge in traffic throughput detected by LSTM model. Correlates with local event. Load balancing engaged.',
    model: 'LSTM-TimeSeries v1.8'
  },
  { 
    id: 'AL-8992', 
    tower: 'Tower-211 (Miami)', 
    severity: 'medium', 
    type: 'Signal Degradation', 
    score: 0.72,
    timestamp: '1 hour ago',
    status: 'investigating',
    reason: 'Temporary interference from weather conditions causing 22dB signal attenuation.',
    model: 'Isolation Forest v3.1'
  },
  { 
    id: 'AL-8985', 
    tower: 'Tower-009 (Seattle)', 
    severity: 'low', 
    type: 'Latency Drift', 
    score: 0.58,
    timestamp: '3 hours ago',
    status: 'resolved',
    reason: 'Minor routing table misconfiguration causing 15ms additional round-trip time.',
    model: 'Isolation Forest v3.1'
  },
  { 
    id: 'AL-8971', 
    tower: 'Tower-550 (Chicago)', 
    severity: 'medium', 
    type: 'Packet Loss', 
    score: 0.67,
    timestamp: '5 hours ago',
    status: 'resolved',
    reason: 'Intermittent packet drops at 2.1% rate traced to faulty fiber splice.',
    model: 'Autoencoder v2.4'
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

export default function AnomaliesPage() {
  const [selectedAnomaly, setSelectedAnomaly] = useState(anomalies[0]);
  const [filter, setFilter] = useState('all');

  const filteredAnomalies = filter === 'all' ? anomalies : anomalies.filter(a => a.status === filter);

  return (
    <motion.div 
      variants={container} initial="hidden" animate="show"
      className="p-8 space-y-6 dot-pattern min-h-screen"
    >
      {/* Header */}
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Anomaly <span className="animated-gradient-text">Detection</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">AI-driven root cause analysis and network failure alerts</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search anomalies..." 
              className="pl-10 pr-4 py-2.5 glass rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <RefreshCcw className="w-4 h-4" />
            Scan Network
          </button>
        </div>
      </motion.div>

      {/* Alert Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div whileHover={{ y: -3 }} className="glass-card rounded-2xl p-6 flex items-center gap-4 glow-rose">
          <div className="p-3 bg-rose-500/15 rounded-xl">
            <Flame className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.15em]">Critical Alerts</p>
            <h3 className="text-3xl font-bold text-white">2</h3>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -3 }} className="glass-card rounded-2xl p-6 flex items-center gap-4 glow-violet">
          <div className="p-3 bg-amber-500/15 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.15em]">Network Risk Score</p>
            <h3 className="text-3xl font-bold text-white">74<span className="text-lg text-slate-500">/100</span></h3>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -3 }} className="glass-card rounded-2xl p-6 flex items-center gap-4 glow-cyan">
          <div className="p-3 bg-cyan-500/15 rounded-xl">
            <Brain className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.15em]">AI Auto-Mitigated</p>
            <h3 className="text-3xl font-bold text-white">84<span className="text-lg text-slate-500">%</span></h3>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content: Table + Detail Panel */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Anomaly Table */}
        <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
            <div className="flex gap-2">
              {['all', 'active', 'investigating', 'resolved'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === f ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-800/30">
            <AnimatePresence mode="popLayout">
              {filteredAnomalies.map((anomaly, index) => (
                <motion.div 
                  key={anomaly.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAnomaly(anomaly)}
                  className={`px-6 py-4 cursor-pointer transition-all duration-200 flex items-center gap-6 group ${
                    selectedAnomaly?.id === anomaly.id ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : 'hover:bg-slate-800/20 border-l-2 border-l-transparent'
                  }`}
                >
                  {/* Severity indicator */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    anomaly.severity === 'critical' ? 'bg-rose-500/15' :
                    anomaly.severity === 'high' ? 'bg-amber-500/15' :
                    anomaly.severity === 'medium' ? 'bg-blue-500/15' :
                    'bg-slate-500/15'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      anomaly.severity === 'critical' ? 'text-rose-500' :
                      anomaly.severity === 'high' ? 'text-amber-500' :
                      anomaly.severity === 'medium' ? 'text-blue-500' :
                      'text-slate-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{anomaly.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        anomaly.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                        anomaly.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        anomaly.severity === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{anomaly.severity}</span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {anomaly.tower} · {anomaly.type}
                    </p>
                  </div>

                  {/* Score + Status */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <div className="h-1.5 w-14 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${anomaly.score * 100}%` }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className={`h-full rounded-full ${anomaly.score > 0.8 ? 'bg-rose-500' : anomaly.score > 0.6 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{(anomaly.score * 100).toFixed(0)}%</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] justify-end ${
                      anomaly.status === 'active' ? 'text-amber-400' : 
                      anomaly.status === 'investigating' ? 'text-blue-400' :
                      'text-emerald-400'
                    }`}>
                      {anomaly.status === 'resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span className="capitalize font-medium">{anomaly.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedAnomaly && (
            <motion.div 
              key={selectedAnomaly.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  AI Analysis
                </h3>
                <span className="text-xs font-mono text-slate-500">{selectedAnomaly.id}</span>
              </div>

              <div className={`p-4 rounded-xl border ${
                selectedAnomaly.severity === 'critical' ? 'bg-rose-500/5 border-rose-500/20' :
                selectedAnomaly.severity === 'high' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-blue-500/5 border-blue-500/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-4 h-4 ${
                    selectedAnomaly.severity === 'critical' ? 'text-rose-400' :
                    selectedAnomaly.severity === 'high' ? 'text-amber-400' :
                    'text-blue-400'
                  }`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{selectedAnomaly.type}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{selectedAnomaly.reason}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/30">
                  <span className="text-xs text-slate-500">Detection Model</span>
                  <span className="text-xs font-medium text-cyan-400">{selectedAnomaly.model}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/30">
                  <span className="text-xs text-slate-500">Confidence Score</span>
                  <span className="text-xs font-bold text-white">{(selectedAnomaly.score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/30">
                  <span className="text-xs text-slate-500">Detected</span>
                  <span className="text-xs text-slate-300">{selectedAnomaly.timestamp}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500">Location</span>
                  <span className="text-xs text-slate-300 flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedAnomaly.tower}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/30 font-mono text-[10px] text-slate-500 space-y-1">
                <p className="text-emerald-400">CORRELATION_ID: {Math.random().toString(36).substring(2, 11).toUpperCase()}</p>
                <p>DETECTED_BY: EDGE_AGENT_MODEL</p>
                <p>ACTIONS: [ALERT_DISPATCHED, FAILOVER_INITIATED]</p>
                <p>PIPELINE: anomaly-detection → root-cause-analysis → auto-remediation</p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                  Run Diagnostics
                </button>
                <button className="px-4 py-2.5 glass rounded-xl text-sm font-medium hover:border-slate-600 transition-all">
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
