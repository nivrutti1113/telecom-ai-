"use client";

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Globe, 
  Wifi, 
  Clock,
  Download,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { motion } from 'framer-motion';

const performanceData = [
  { month: 'Jul', uptime: 99.2, throughput: 840, latency: 14 },
  { month: 'Aug', uptime: 99.5, throughput: 920, latency: 12 },
  { month: 'Sep', uptime: 99.1, throughput: 880, latency: 16 },
  { month: 'Oct', uptime: 99.7, throughput: 1020, latency: 11 },
  { month: 'Nov', uptime: 99.4, throughput: 960, latency: 13 },
  { month: 'Dec', uptime: 99.8, throughput: 1100, latency: 10 },
  { month: 'Jan', uptime: 99.6, throughput: 1060, latency: 12 },
  { month: 'Feb', uptime: 99.9, throughput: 1180, latency: 9 },
  { month: 'Mar', uptime: 99.7, throughput: 1240, latency: 11 },
];

const radarData = [
  { metric: 'Uptime', A: 99, fullMark: 100 },
  { metric: 'Throughput', A: 84, fullMark: 100 },
  { metric: 'Latency', A: 92, fullMark: 100 },
  { metric: 'Coverage', A: 88, fullMark: 100 },
  { metric: 'Reliability', A: 95, fullMark: 100 },
  { metric: 'Capacity', A: 78, fullMark: 100 },
];

const kpis = [
  { label: 'Total Throughput', value: '1.24 PB', change: '+18.2%', trend: 'up', icon: TrendingUp, color: 'blue' },
  { label: 'Avg Latency', value: '11ms', change: '-22%', trend: 'down', icon: Clock, color: 'emerald' },
  { label: 'Network Uptime', value: '99.97%', change: '+0.12%', trend: 'up', icon: Wifi, color: 'cyan' },
  { label: 'Coverage Score', value: '94.8', change: '+2.4', trend: 'up', icon: Globe, color: 'violet' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } }
};

export default function AnalyticsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-8 space-y-6 dot-pattern min-h-screen">
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Network <span className="animated-gradient-text">Analytics</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Performance metrics and trend analysis across all infrastructure</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-medium hover:border-slate-600 transition-all">
            <Calendar className="w-4 h-4 text-slate-400" />
            Last 90 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-medium hover:border-slate-600 transition-all">
            <Download className="w-4 h-4 text-slate-400" />
            Export
          </button>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <motion.div 
            key={kpi.label} 
            whileHover={{ y: -4 }} 
            className="glass-card rounded-2xl p-6 stat-strip"
            style={{ '--strip-color': kpi.color === 'blue' ? '#3b82f6' : kpi.color === 'emerald' ? '#10b981' : kpi.color === 'cyan' ? '#06b6d4' : '#8b5cf6' } as React.CSSProperties}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-${kpi.color === 'blue' ? 'blue' : kpi.color === 'emerald' ? 'emerald' : kpi.color === 'cyan' ? 'cyan' : 'violet'}-500/10`}>
                <kpi.icon className={`w-5 h-5 text-${kpi.color === 'blue' ? 'blue' : kpi.color === 'emerald' ? 'emerald' : kpi.color === 'cyan' ? 'cyan' : 'violet'}-400`} />
              </div>
              <span className={`flex items-center text-xs font-semibold ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-emerald-400'}`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Throughput Trend</h3>
              <p className="text-xs text-slate-500 mt-1">Monthly aggregate network throughput (TB)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="throughput" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorThroughput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Quality Radar</h3>
          <p className="text-xs text-slate-500 mb-6">Network quality across all dimensions</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Latency & Uptime */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Average Latency</h3>
          <p className="text-xs text-slate-500 mb-6">Monthly P95 response time in milliseconds</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">System Uptime</h3>
          <p className="text-xs text-slate-500 mb-6">Monthly SLA compliance rate</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[98.5, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="uptime" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
