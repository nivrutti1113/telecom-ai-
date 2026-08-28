"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Map as MapIcon, 
  Filter, 
  Layers, 
  Maximize2, 
  Navigation,
  TowerControl as Tower,
  Activity,
  Signal,
  Wind,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock geographical data for towers
const towers = [
  { id: 1, name: 'TX-North-01', x: 200, y: 150, status: 'online', type: '5G' },
  { id: 2, name: 'TX-North-02', x: 250, y: 180, status: 'online', type: '4G' },
  { id: 3, name: 'TX-East-04', x: 450, y: 120, status: 'warning', type: '5G' },
  { id: 4, name: 'TX-West-09', x: 120, y: 400, status: 'online', type: 'Edge' },
  { id: 5, name: 'TX-South-12', x: 380, y: 450, status: 'offline', type: '5G' },
  { id: 6, name: 'TX-Central-01', x: 300, y: 300, status: 'online', type: '5G' },
  { id: 7, name: 'TX-Core-Hub', x: 320, y: 280, status: 'online', type: '5G' },
];

export default function NetworkMapPage() {
  const [selectedTower, setSelectedTower] = useState<any>(null);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Overlay */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col">
        <div className="p-6 border-b border-slate-800">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Find tower by ID..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-600 transition-all"
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">RECENT ALERTS</h3>
           {towers.filter(t => t.status !== 'online').map(tower => (
             <button 
               key={tower.id}
               onClick={() => setSelectedTower(tower)}
               className={`w-full p-4 rounded-xl border text-left transition-all ${
                 selectedTower?.id === tower.id ? 'bg-blue-600/10 border-blue-600' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
               }`}
             >
                <div className="flex justify-between items-start mb-2">
                   <div className={`p-2 rounded-lg ${tower.status === 'offline' ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
                      <Tower className={`w-4 h-4 ${tower.status === 'offline' ? 'text-rose-500' : 'text-amber-500'}`} />
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                     tower.status === 'offline' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                   }`}>{tower.status}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{tower.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{tower.type} Infrastructure Node</p>
             </button>
           ))}
        </div>

        {selectedTower && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-6 bg-slate-900 border-t border-slate-800"
          >
             <h4 className="font-bold text-white mb-4">Tower Details</h4>
             <div className="space-y-3">
                <div className="flex justify-between text-xs">
                   <span className="text-slate-500">Latency</span>
                   <span className="text-emerald-400">14ms</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-slate-500">Active Users</span>
                   <span className="text-white">412</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-slate-500">Bandwidth Util</span>
                   <span className="text-white">82%</span>
                </div>
             </div>
             <button className="w-full mt-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors">
                Run Diagnostics
             </button>
          </motion.div>
        )}
      </div>

      {/* Main Map View */}
      <div className="flex-1 relative bg-[#020617] overflow-hidden">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
             }} />
        
        {/* Floating Controls */}
        <div className="absolute top-6 right-6 flex flex-col gap-3">
           {[MapIcon, Layers, Maximize2, Navigation, Settings].map((Icon, idx) => (
             <button key={idx} className="p-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all shadow-xl">
                <Icon className="w-5 h-5" />
             </button>
           ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 p-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl flex gap-6 shadow-xl">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-300 font-medium">Optimal</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-xs text-slate-300 font-medium">Warning</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="text-xs text-slate-300 font-medium">Offline</span>
           </div>
        </div>

        {/* SVG "Map" for high-fidelity visualization */}
        <svg className="w-full h-full">
           <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur stdDeviation="3" result="blur" />
                 <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
           </defs>
           
           {/* Abstract connections */}
           {towers.slice(0, 5).map((t, i) => (
             <line 
               key={`line-${i}`}
               x1={t.x} y1={t.y} 
               x2={towers[(i+1)%towers.length].x} y2={towers[(i+1)%towers.length].y} 
               stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" opacity="0.2"
             />
           ))}

           {towers.map((tower) => (
             <g key={tower.id} 
                className="cursor-pointer group"
                onClick={() => setSelectedTower(tower)}
             >
                {/* Glow layer */}
                <circle 
                  cx={tower.x} 
                  cy={tower.y} 
                  r="6" 
                  className={`transition-all duration-300 ${
                    tower.status === 'online' ? 'fill-emerald-500/20 opacity-0 group-hover:opacity-100' :
                    tower.status === 'warning' ? 'fill-amber-500/30 opacity-100' :
                    'fill-rose-500/30 opacity-100'
                  }`}
                  filter="url(#glow)"
                />
                {/* Main dot */}
                <circle 
                  cx={tower.x} 
                  cy={tower.y} 
                  r="4" 
                  className={`${
                    tower.status === 'online' ? 'fill-emerald-500' :
                    tower.status === 'warning' ? 'fill-amber-500' :
                    'fill-rose-500'
                  } transition-transform group-hover:scale-150`}
                />
                {/* Label */}
                {tower.status !== 'online' && (
                  <text 
                    x={tower.x + 10} 
                    y={tower.y + 4} 
                    className="fill-slate-400 text-[10px] font-mono font-bold pointer-events-none"
                  >
                    {tower.name}
                  </text>
                )}
             </g>
           ))}
        </svg>

        {/* Weather/Atmospheric overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div 
             animate={{ x: [0, 1000] }}
             transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
             className="w-full h-32 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent absolute top-1/4 -left-[500px] blur-3xl transform -rotate-12" />
        </div>
      </div>
    </div>
  );
}
