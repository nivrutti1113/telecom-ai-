"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { 
  Box, 
  Cpu, 
  Cloud, 
  Zap, 
  Settings, 
  Activity,
  Maximize2,
  RefreshCcw
} from 'lucide-react';

const NetworkGlobe = dynamic(() => import('@/components/digital-twin/NetworkGlobe'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900 animate-pulse">Initializing 3D Engine...</div>
});

const stats = [
  { label: 'Active Nodes', value: '4,208', icon: Box },
  { label: 'Network Latency', value: '12ms', icon: Activity },
  { label: 'Simulation Fidelity', value: 'High', icon: Zap },
  { label: 'Cloud Sync', value: 'Live', icon: Cloud },
];

export default function DigitalTwinPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="p-8 pb-4 flex justify-between items-center bg-slate-950/50 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white">Digital Twin</h1>
          <p className="text-slate-400 mt-1">Real-time 3D simulation of network topology and traffic flows.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <RefreshCcw className="w-5 h-5" />
          </button>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
            <Settings className="w-4 h-4" />
            Configure Simulation
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-8 overflow-hidden">
        {/* Main 3D View */}
        <div className="flex-1 relative">
          <NetworkGlobe />
          
          {/* Overlay Controls */}
          <div className="absolute top-6 left-6 p-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl space-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <stat.icon className="w-4 h-4 text-blue-400" />
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
                  <span className="text-xs text-slate-300">Normal Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-xs text-slate-300">Anomaly Detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-[2px] bg-blue-500/30" />
                  <span className="text-xs text-slate-300">Data Flow Path</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">FPS: 60.0</span>
                <span className="text-xs text-slate-500">Render: WebGL 2.0</span>
             </div>
          </div>
        </div>

        {/* Right Sidebar - Simulation Details */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-6">
            <h4 className="font-semibold text-white">Network Stress Test</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Traffic Load</span>
                  <span className="text-white">74%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '74%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Node Failover Capability</span>
                  <span className="text-white">92%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">
              RUN STRESS SCENARIO
            </button>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
             <h4 className="font-semibold text-white mb-4">Infrastructure Logs</h4>
             <div className="space-y-3 font-mono text-[10px]">
                <div className="text-emerald-400">[10:24:01] Node TX-042 sync successful</div>
                <div className="text-slate-500">[10:24:05] Routing table update in progress...</div>
                <div className="text-amber-400">[10:24:12] Latency spike detected in Subnet-B</div>
                <div className="text-blue-400">[10:24:18] Load balancing active: +14% shift</div>
                <div className="text-rose-400">[10:24:22] CRITICAL: Tower-09 disconnect</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
