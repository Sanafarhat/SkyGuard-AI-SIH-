import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart3, Activity, AlertTriangle, ShieldCheck, Database, RefreshCw
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(false);
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/metrics`);
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading Evaluation Metrics...
      </div>
    );
  }

  if (error || !metrics || !metrics.historical_metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white border border-slate-200 rounded-lg">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
        <h3 className="text-lg font-bold text-slate-800">Evaluation metrics unavailable</h3>
        <p className="text-sm">Please ensure the FastAPI backend is running on port 8000.</p>
        <button onClick={fetchMetrics} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  const xgbHist = metrics.historical_metrics.XGBoost;
  const xgbScen = metrics.scenario_metrics.XGBoost;

  // Format Confusion Matrix for charting
  const cm = xgbScen.confusion_matrix;
  const cmData = [
    { name: 'Genuine', "Genuine Weather": cm["Genuine Weather"]["Genuine Weather"], "Uncertain": cm["Genuine Weather"]["Uncertain"], "Sensor Fault": cm["Genuine Weather"]["Sensor Fault"] },
    { name: 'Uncertain', "Genuine Weather": cm["Uncertain"]["Genuine Weather"], "Uncertain": cm["Uncertain"]["Uncertain"], "Sensor Fault": cm["Uncertain"]["Sensor Fault"] },
    { name: 'Fault', "Genuine Weather": cm["Sensor Fault"]["Genuine Weather"], "Uncertain": cm["Sensor Fault"]["Uncertain"], "Sensor Fault": cm["Sensor Fault"]["Sensor Fault"] },
  ];

  const baselineScenXGB = metrics.baseline_comparison?.Scenario_Evaluation?.XGBoost;
  const baselineScenRF = metrics.baseline_comparison?.Scenario_Evaluation?.RandomForest_Baseline;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-800" />
              <span>Model Evaluation Analytics</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live metrics pulled from empirical validation datasets and controlled test scenarios.
            </p>
          </div>
          <button onClick={fetchMetrics} className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Historical Normal-Weather Recognition Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800">
            {(xgbHist.accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Clean historical test-period (no labeled faults)</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Scenario Accuracy</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800">
            {(xgbScen.accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">169 Scenario Observations Evaluated</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Macro F1</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800">
            {(xgbScen.macro_f1 * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Balanced metric across 3 classes</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Fault / Uncertain Recall</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 pt-1">
            {(xgbScen.per_class["Sensor Fault"].recall * 100).toFixed(0)}% / {(xgbScen.per_class["Uncertain"].recall * 100).toFixed(0)}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">True Positive Rate for scenarios</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix (Scenarios) */}
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xs overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            Scenario Confusion Matrix (Actual vs Predicted)
          </h3>
          {cm ? (
            <table className="w-full text-xs text-left text-slate-600 border-collapse min-w-[400px]">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-50">Actual \ Predicted</th>
                  <th className="p-2 border border-slate-200 bg-slate-50 text-center">Genuine Weather</th>
                  <th className="p-2 border border-slate-200 bg-slate-50 text-center">Uncertain</th>
                  <th className="p-2 border border-slate-200 bg-slate-50 text-center">Sensor Fault</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-50 font-semibold">Genuine Weather</th>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Genuine Weather"]["Genuine Weather"]}</td>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Genuine Weather"]["Uncertain"]}</td>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Genuine Weather"]["Sensor Fault"]}</td>
                </tr>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-50 font-semibold">Uncertain</th>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Uncertain"]["Genuine Weather"]}</td>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Uncertain"]["Uncertain"]}</td>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Uncertain"]["Sensor Fault"]}</td>
                </tr>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-50 font-semibold">Sensor Fault</th>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Sensor Fault"]["Genuine Weather"]}</td>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Sensor Fault"]["Uncertain"]}</td>
                  <td className="p-2 border border-slate-200 text-center font-mono">{cm["Sensor Fault"]["Sensor Fault"]}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-slate-500">Confusion matrix unavailable.</div>
          )}
        </div>

        {/* Historical Baseline Comparison */}
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xs overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            Baseline Comparison (Scenario Evaluation)
          </h3>
          {baselineScenXGB && baselineScenRF ? (
            <div className="space-y-4">
              <table className="w-full text-xs text-left text-slate-600 border-collapse min-w-[300px]">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-200 bg-slate-50">Model</th>
                    <th className="p-2 border border-slate-200 bg-slate-50 text-right">Accuracy</th>
                    <th className="p-2 border border-slate-200 bg-slate-50 text-right">Macro F1</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-200 font-medium">Random Forest (Baseline)</td>
                    <td className="p-2 border border-slate-200 text-right font-mono">{(baselineScenRF.accuracy * 100).toFixed(2)}%</td>
                    <td className="p-2 border border-slate-200 text-right font-mono">{(baselineScenRF.macro_f1 * 100).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 font-bold text-slate-800">XGBoost</td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-slate-800">{(baselineScenXGB.accuracy * 100).toFixed(2)}%</td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-slate-800">{(baselineScenXGB.macro_f1 * 100).toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-slate-400">
                Evaluation results pulled from baseline_comparison.json.
              </p>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Baseline comparison unavailable.</div>
          )}
        </div>
      </div>
    </div>
  );
};
