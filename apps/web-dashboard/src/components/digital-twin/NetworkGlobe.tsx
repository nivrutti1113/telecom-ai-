"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NodeData {
  id: string;
  position: [number, number, number];
  load: number;
  status: "online" | "warning" | "offline";
  connections: string[];
}

export interface SimulationState {
  timestamp: string;
  nodes: NodeData[];
  metrics: {
    avg_load: number;
    active_nodes: number;
    critical_nodes: number;
  };
}

// ─── 3D Components ─────────────────────────────────────────────────────────

function TowerNode({ data }: { data: NodeData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    if (data.status === 'offline') return '#f43f5e'; // rose-500
    if (data.status === 'warning') return '#f59e0b'; // amber-500
    return '#3b82f6'; // blue-500
  }, [data.status]);

  const size = useMemo(() => 0.08 + (data.load / 800), [data.load]);

  return (
    <mesh position={data.position} ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={data.status !== 'online' ? 4 : 1.2} 
      />
    </mesh>
  );
}

function Connection({ start, end, status }: { start: [number, number, number], end: [number, number, number], status: string }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  
  const color = status === 'offline' ? '#f43f5e' : '#3b82f6';

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} opacity={0.15} transparent />
    </line>
  );
}

function NetworkMesh({ nodes }: { nodes: NodeData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {nodes.map((node) => (
        <TowerNode key={node.id} data={node} />
      ))}
      {nodes.map((node) => 
        node.connections.map((targetId) => {
          const target = nodeMap.get(targetId);
          if (target && node.id < targetId) {
            return (
              <Connection 
                key={`${node.id}-${targetId}`} 
                start={node.position} 
                end={target.position} 
                status={node.status}
              />
            );
          }
          return null;
        })
      )}
    </group>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface NetworkGlobeProps {
  onStateUpdate?: (state: SimulationState) => void;
}

export default function NetworkGlobe({ onStateUpdate }: NetworkGlobeProps) {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_TWIN_WS_URL || 'ws://localhost:8003/ws/network-state';
    
    const connectWS = () => {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => setConnected(true);
      
      socket.onmessage = (event) => {
        try {
          const state: SimulationState = JSON.parse(event.data);
          setNodes(state.nodes);
          if (onStateUpdate) onStateUpdate(state);
        } catch (err) {
          console.error('Failed to parse twin state:', err);
        }
      };
      
      socket.onclose = () => {
        setConnected(false);
        setTimeout(connectWS, 3000);
      };

      wsRef.current = socket;
    };

    connectWS();
    return () => wsRef.current?.close();
  }, [onStateUpdate]);

  return (
    <div className="w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative">
      {!connected && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">Connecting to Twin Engine...</p>
          </div>
        </div>
      )}
      
      <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <NetworkMesh nodes={nodes} />
        <OrbitControls enableZoom={true} enablePan={true} />
        <gridHelper args={[30, 30, 0x1e293b, 0x1e293b]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
    </div>
  );
}
