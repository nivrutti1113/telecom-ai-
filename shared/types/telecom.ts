export interface Tower {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'online' | 'offline' | 'warning';
  type: '5G' | '4G' | 'Edge';
  lastPing: string;
}

export interface TelemetryData {
  towerId: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  networkThroughput: number;
  signalStrength: number;
  errorRate: number;
  activeUsers: number;
}

export interface AnomalyAlert {
  id: string;
  towerId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
}
