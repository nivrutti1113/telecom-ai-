import { Tower, TelemetryData } from '../types/telecom';

export const generateMockTowers = (count: number): Tower[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `tower-${i + 1}`,
    name: `Tower ${i + 1}`,
    location: {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
    },
    status: Math.random() > 0.9 ? 'warning' : 'online',
    type: Math.random() > 0.3 ? '5G' : '4G',
    lastPing: new Date().toISOString(),
  }));
};

export const generateMockTelemetry = (towerId: string): TelemetryData => ({
  towerId,
  timestamp: new Date().toISOString(),
  cpuUsage: Math.random() * 100,
  memoryUsage: Math.random() * 100,
  networkThroughput: Math.random() * 1000,
  signalStrength: 70 + Math.random() * 30,
  errorRate: Math.random() * 0.05,
  activeUsers: Math.floor(Math.random() * 500),
});
