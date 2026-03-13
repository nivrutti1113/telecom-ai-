"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function TowerNode({ position, color, size = 0.1 }: { position: [number, number, number], color: string, size?: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
}

function Connection({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} opacity={0.3} transparent />
    </line>
  );
}

function NetworkMesh() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create random nodes
  const nodes = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10] as [number, number, number],
      color: Math.random() > 0.8 ? '#ef4444' : '#3b82f6'
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <TowerNode key={i} position={node.position} color={node.color} />
      ))}
      {nodes.slice(0, 30).map((node, i) => {
        const nextNode = nodes[(i + 1) % nodes.length];
        return <Connection key={i} start={node.position} end={nextNode.position} color="#3b82f6" />;
      })}
    </group>
  );
}

export default function NetworkGlobe() {
  return (
    <div className="w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <NetworkMesh />
        <OrbitControls enableZoom={true} enablePan={false} />
        <gridHelper args={[20, 20, 0x1e293b, 0x1e293b]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
    </div>
  );
}
