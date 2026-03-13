"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Network, 
  TowerControl as Tower, 
  AlertTriangle, 
  BarChart3, 
  Box, 
  Settings,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Network Map', icon: Network, href: '/network' },
  { name: 'Towers', icon: Tower, href: '/towers' },
  { name: 'Anomalies', icon: AlertTriangle, href: '/anomalies' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'Digital Twin', icon: Box, href: '/digital-twin' },
  { name: 'Federated Learning', icon: Shield, href: '/federation' },
  { name: 'Edge Manager', icon: Zap, href: '/edge' },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div 
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col h-screen bg-[#020617]/80 backdrop-blur-xl border-r border-slate-800/50 text-slate-300 relative z-20"
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-9 h-9 animated-gradient rounded-xl flex items-center justify-center shrink-0 glow-blue">
          <Zap className="text-white w-5 h-5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                Telcom<span className="animated-gradient-text">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <AnimatePresence>
          {!collapsed && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] uppercase font-bold text-slate-600 tracking-[0.15em] px-3 mb-3"
            >
              Platform
            </motion.p>
          )}
        </AnimatePresence>
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                collapsed && "justify-center",
                isActive 
                  ? "text-white" 
                  : "hover:bg-slate-800/40 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 glass-card rounded-xl glow-blue"
                  style={{ borderColor: 'rgba(59, 130, 246, 0.25)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className={cn(
                "w-[18px] h-[18px] relative z-10 shrink-0 transition-colors duration-200",
                isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium relative z-10 whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Notification badge for anomalies */}
              {item.name === 'Anomalies' && (
                <span className="ml-auto relative z-10 w-5 h-5 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              collapsed && "justify-center",
              "hover:bg-slate-800/40 hover:text-white text-slate-500"
            )}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
          </Link>
        ))}
      </div>

      <div className="px-3 pb-4 border-t border-slate-800/50 pt-4">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            JD
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-semibold text-white truncate">John Doe</p>
                <p className="text-[10px] text-slate-500 truncate">Network Architect</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.div>
  );
}
