"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Box, 
  Cpu, 
  Cloud, 
  Zap, 
  Settings, 
  Activity,
  Maximize2,
  RefreshCcw,
  ShieldAlert
} from 'lucide-react';
import { type SimulationState } from '@/components/digital-twin/NetworkGlobe';

const NetworkGlobe = dynamic(() => import('@/components/digital-twin/NetworkGlobe'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900 animate-pulse">Initializing 3D Engine...</div>
});

export default function DigitalTwinPage() {
  const [lastUpdate, setLastUpdate] = useState<SimulationState | null>(null);

  const handleStateUpdate = useCallback((state: SimulationState) => {
    setLastUpdate(state);
  }, []);

  const stats = [
    { label: 'Active Nodes', value: lastUpdate?.nodes.length.toLocaleString() || '---', icon: Box },
    { label: 'Avg Load', value: `${lastUpdate?.metrics.avg_load.toFixed(1)}%` || '---', icon: Activity },
    { label: 'Critical Alert', value: lastUpdate?.metrics.critical_nodes || '0', icon: ShieldAlert, color: lastUpdate?.metrics.critical_nodes ? 'text-rose-400' : 'text-slate-400' },
    { label: 'Cloud Sync', value: 'Live', icon: Cloud },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="p-8 pb-4 flex justify-between items-center bg-slate-950/50 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Digital <span className="animated-gradient-text">Twin</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time immersive simulation powered by Python Twin Service</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium hover:bg-blue-600/20 transition-all">
            <Settings className="w-4 h-4" />
            Simulation Config
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-8 overflow-hidden">
        {/* Main 3D View */}
        <div className="flex-1 relative">
          <NetworkGlobe onStateUpdate={handleStateUpdate} />
          
          {/* Overlay Controls */}
          <div className="absolute top-6 left-6 p-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl space-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <stat.icon className={`w-4 h-4 ${stat.color || 'text-blue-400'}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{stat.label}</p>
                  <p className="text-sm font-semibold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl flex justify-between items-center">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
                  <span className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">Critical</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 font-mono">SIM_ID: {lastUpdate?.simulation_id || '---'}</span>
                <span className="text-[10px] text-slate-500 font-mono">TS: {lastUpdate?.timestamp.split('T')[1].split('.')[0] || '---'}</span>
             </div>
          </div>
        </div>

        {/* Right Sidebar - Simulation Details */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-6">
            <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-400" />
              Live Load Distribution
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Aggregate Traffic</span>
                  <span className="text-white">{(lastUpdate?.metrics.avg_load || 0).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${lastUpdate?.metrics.avg_load || 0}%` }} />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                 <button className="w-full py-2.5 animated-gradient hover:opacity-90 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest">
                   Trigger Stress Test
                 </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
             <h4 className="font-semibold text-white mb-4 text-sm flex items-center gap-2">
               <Cpu className="w-4 h-4 text-emerald-400" />
               Simulation Engine Logs
             </h4>
             <div className="space-y-3 font-mono text-[9px]">
                {lastUpdate?.nodes.filter(n => n.status !== 'online').slice(0, 5).map(n => (
                  <div key={n.id} className={n.status === 'offline' ? 'text-rose-400' : 'text-amber-400'}>
                    [{lastUpdate.timestamp.split('T')[1].split('.')[0]}] {n.id}: {n.status.toUpperCase()} (Load: {n.load.toFixed(1)}%)
                  </div>
                ))}
                <div className="text-slate-500 opacity-50">... streaming real-time telemetry</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
