"use client";

import React from 'react';
import { 
  TowerControl as Tower, 
  MapPin, 
  Signal, 
  Battery, 
  MoreVertical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  BarChart2,
  Plus,
  Wifi,
  ThermometerSun
} from 'lucide-react';
import { motion } from 'framer-motion';

const towers = [
  { id: 'TX-NY-001', name: 'Manhattan Hub', region: 'New York', status: 'online', type: '5G NR', uptime: '99.97%', users: 12400, latency: '8ms', temp: '42°C', signal: -65 },
  { id: 'TX-TX-042', name: 'Dallas North', region: 'Texas', status: 'online', type: '5G SA', uptime: '99.82%', users: 8400, latency: '12ms', temp: '38°C', signal: -72 },
  { id: 'TX-CA-102', name: 'LA Coastal', region: 'California', status: 'warning', type: '4G LTE', uptime: '94.21%', users: 3120, latency: '45ms', temp: '56°C', signal: -84 },
  { id: 'TX-FL-009', name: 'Miami South', region: 'Florida', status: 'offline', type: '5G NR', uptime: '0%', users: 0, latency: '---', temp: '---', signal: 0 },
  { id: 'TX-WA-055', name: 'Seattle Core', region: 'Washington', status: 'online', type: '5G SA', uptime: '99.94%', users: 21050, latency: '10ms', temp: '35°C', signal: -61 },
  { id: 'TX-IL-017', name: 'Chicago Loop', region: 'Illinois', status: 'online', type: '5G NR', uptime: '99.88%', users: 15200, latency: '11ms', temp: '40°C', signal: -68 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
};

function getStatusConfig(status: string) {
  switch (status) {
    case 'online': return { color: 'emerald', icon: CheckCircle2, label: 'Operational', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' };
    case 'warning': return { color: 'amber', icon: AlertTriangle, label: 'Degraded', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-amber-500/20' };
    case 'offline': return { color: 'rose', icon: XCircle, label: 'Offline', bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'shadow-rose-500/20' };
    default: return { color: 'slate', icon: Activity, label: 'Unknown', bg: 'bg-slate-500/10', text: 'text-slate-400', glow: '' };
  }
}

export default function TowersPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-8 space-y-6 dot-pattern min-h-screen">
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Tower <span className="animated-gradient-text">Infrastructure</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Manage physical network nodes across all regions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input type="text" placeholder="Search towers..." className="pl-10 pr-4 py-2.5 glass rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all w-56" />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all">
            <Plus className="w-4 h-4" />
            Add Node
          </button>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div variants={item} className="flex gap-4">
        {[
          { label: 'Total Towers', value: '12,482', color: 'blue' },
          { label: 'Online', value: '12,244', color: 'emerald' },
          { label: 'Degraded', value: '184', color: 'amber' },
          { label: 'Offline', value: '54', color: 'rose' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-2.5 glass rounded-xl">
            <div className={`w-2 h-2 rounded-full bg-${s.color}-500`} />
            <span className="text-xs text-slate-400">{s.label}</span>
            <span className="text-sm font-bold text-white">{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Tower Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {towers.map((tower, index) => {
          const config = getStatusConfig(tower.status);
          return (
            <motion.div 
              key={tower.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${config.bg} transition-all group-hover:scale-110`}>
                    <Tower className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{tower.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tower.id}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { icon: Signal, label: 'Signal', value: tower.type },
                  { icon: Activity, label: 'Latency', value: tower.latency },
                  { icon: Wifi, label: 'Users', value: tower.users.toLocaleString() },
                  { icon: Battery, label: 'Uptime', value: tower.uptime },
                  { icon: ThermometerSun, label: 'Temp', value: tower.temp },
                  { icon: BarChart2, label: 'RSSI', value: tower.signal ? `${tower.signal}dBm` : '---' },
                ].map((metric) => (
                  <div key={metric.label} className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/30">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <metric.icon className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">{metric.label}</span>
                    </div>
                    <p className="text-xs font-bold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/30">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {tower.region}
                </div>
                <button className="text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-1">
                  Details
                  <Activity className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
