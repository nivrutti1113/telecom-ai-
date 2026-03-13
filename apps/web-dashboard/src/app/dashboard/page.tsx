"use client";

import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  FileSpreadsheet,
  Brain,
  TrendingUp,
  Activity,
  Zap,
  Send
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  predictAnomaly, 
  predictTraffic, 
  uploadData,
  type AnomalyPrediction, 
  type TrafficForecastPoint, 
  type UploadResponse 
} from '@/lib/api';

// Demo data for visualizations
const trafficData = [
  { time: '00:00', traffic: 420, anomalies: 2 },
  { time: '04:00', traffic: 280, anomalies: 1 },
  { time: '08:00', traffic: 920, anomalies: 5 },
  { time: '12:00', traffic: 1280, anomalies: 3 },
  { time: '16:00', traffic: 1180, anomalies: 8 },
  { time: '20:00', traffic: 780, anomalies: 3 },
  { time: '23:59', traffic: 520, anomalies: 2 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } }
};

export default function DashboardPage() {
  // ─── Anomaly Detection State ─────────────────────────────────────────
  const [anomalyInput, setAnomalyInput] = useState({
    tower_id: 'TOWER-0001',
    latency_ms: 25.4,
    packet_loss_pct: 0.12,
    bandwidth_usage_mbps: 420.5,
    user_count: 350,
    cpu_usage_pct: 42.3,
    memory_usage_pct: 55.1,
  });
  const [anomalyResult, setAnomalyResult] = useState<AnomalyPrediction | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyError, setAnomalyError] = useState<string | null>(null);

  // ─── Traffic Forecast State ──────────────────────────────────────────
  const [forecastData, setForecastData] = useState<TrafficForecastPoint[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastMetric, setForecastMetric] = useState<'bandwidth' | 'latency'>('bandwidth');

  // ─── Upload State ────────────────────────────────────────────────────
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // ─── Handlers ────────────────────────────────────────────────────────

  const handlePredictAnomaly = useCallback(async () => {
    setAnomalyLoading(true);
    setAnomalyError(null);
    try {
      const result = await predictAnomaly(anomalyInput);
      setAnomalyResult(result);
    } catch (err: any) {
      setAnomalyError(err.message || 'Prediction failed. Is the API running?');
    } finally {
      setAnomalyLoading(false);
    }
  }, [anomalyInput]);

  const handleForecast = useCallback(async () => {
    setForecastLoading(true);
    try {
      const result = await predictTraffic({
        metric: forecastMetric,
        periods: 48,
      });
      setForecastData(result.forecast);
    } catch (err) {
      console.error('Forecast failed:', err);
    } finally {
      setForecastLoading(false);
    }
  }, [forecastMetric]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const result = await uploadData(file);
      setUploadResult(result);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadLoading(false);
    }
  }, []);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-8 space-y-6 dot-pattern min-h-screen">
      {/* Header */}
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            AI <span className="animated-gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Real-time anomaly detection & traffic forecasting powered by PyOD + Prophet</p>
        </div>
      </motion.div>

      {/* ─── Live Anomaly Detector ───────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 animated-gradient rounded-xl">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Anomaly Detector</h2>
              <p className="text-xs text-slate-500">PyOD Ensemble · Isolation Forest + LOF + One-Class SVM</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {Object.entries(anomalyInput).filter(([k]) => k !== 'tower_id').map(([key, value]) => (
              <div key={key}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setAnomalyInput(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tower ID</label>
              <input
                value={anomalyInput.tower_id}
                onChange={(e) => setAnomalyInput(prev => ({ ...prev, tower_id: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              />
            </div>
            <button 
              onClick={handlePredictAnomaly}
              disabled={anomalyLoading}
              className="mt-5 flex items-center gap-2 px-6 py-2.5 animated-gradient rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {anomalyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Predict
            </button>
          </div>

          {anomalyError && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
              ⚠️ {anomalyError}
            </div>
          )}
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {anomalyResult ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className={`text-center p-6 rounded-2xl ${anomalyResult.is_anomaly ? 'bg-rose-500/10 border border-rose-500/20 glow-rose' : 'bg-emerald-500/10 border border-emerald-500/20 glow-emerald'}`}>
                  {anomalyResult.is_anomaly ? (
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                  )}
                  <h3 className={`text-2xl font-bold ${anomalyResult.is_anomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {anomalyResult.is_anomaly ? 'ANOMALY' : 'NORMAL'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Score: {anomalyResult.anomaly_score} · Confidence: {(anomalyResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Per-Model Scores</p>
                  {Object.entries(anomalyResult.model_scores).map(([model, score]) => (
                    <div key={model} className="flex items-center justify-between p-2 bg-slate-950/40 rounded-lg">
                      <span className="text-xs text-slate-400 capitalize">{model}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${score > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.abs(score) * 50)}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{score.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" className="text-center py-10">
                <Brain className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-slate-500 text-sm">Enter network metrics and click Predict</p>
                <p className="text-slate-600 text-xs mt-1">Results will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── Traffic Forecast ─────────────────────────────────────────────── */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Traffic Forecast</h2>
              <p className="text-xs text-slate-500">Facebook Prophet · 48-hour ahead prediction</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {(['bandwidth', 'latency'] as const).map((m) => (
                <button 
                  key={m}
                  onClick={() => setForecastMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    forecastMetric === m ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button 
              onClick={handleForecast}
              disabled={forecastLoading}
              className="flex items-center gap-2 px-5 py-2 animated-gradient rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            >
              {forecastLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Forecast
            </button>
          </div>
        </div>

        {forecastData.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData.map(d => ({
                time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value: d.predicted_value,
                lower: d.lower_bound,
                upper: d.upper_bound,
              }))}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#8b5cf6" fillOpacity={0.05} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#forecastGrad)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#8b5cf6" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500 text-sm">Click "Forecast" to generate predictions</p>
              <p className="text-slate-600 text-xs mt-1">Requires trained Prophet models on the backend</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Upload + Charts Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Data Upload */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <Upload className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Network Logs</h2>
              <p className="text-xs text-slate-500">CSV with timestamp, tower_id, latency_ms, etc.</p>
            </div>
          </div>

          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-slate-800/50 rounded-2xl p-8 text-center hover:border-blue-500/30 transition-all">
              {uploadLoading ? (
                <Loader2 className="w-10 h-10 mx-auto mb-3 text-blue-400 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              )}
              <p className="text-sm text-slate-400">
                {uploadLoading ? 'Processing...' : 'Drag & drop or click to upload CSV'}
              </p>
              <p className="text-[10px] text-slate-600 mt-1">Max 100MB · .csv files only</p>
            </div>
            <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
          </label>

          {uploadResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Upload Complete</span>
              </div>
              <p className="text-xs text-slate-400">File: {uploadResult.filename} · {uploadResult.rows_processed} rows</p>
              {uploadResult.anomaly_summary && (
                <p className="text-xs text-slate-400">
                  Anomalies found: <span className="text-rose-400 font-bold">{uploadResult.anomaly_summary.anomalies_found}</span> / {uploadResult.anomaly_summary.total_rows_analyzed} ({(uploadResult.anomaly_summary.anomaly_rate * 100).toFixed(1)}%)
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Network Traffic Chart (static data) */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Network Traffic Overview</h2>
              <p className="text-xs text-slate-500">24-hour traffic pattern</p>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorTraffic2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTraffic2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
