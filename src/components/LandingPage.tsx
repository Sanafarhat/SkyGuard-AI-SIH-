import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  ShieldAlert, 
  Activity, 
  Database, 
  Cpu, 
  Layers, 
  CheckCircle,
  BarChart3,
  Server,
  Zap,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(false);

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(false);
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/metrics`);
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setMetricsError(true);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/skyguard-logo.png" alt="SkyGuard AI logo" className="h-[42px] w-auto object-contain" />
              <span className="text-xl font-bold tracking-tight text-slate-900">SkyGuard AI</span>
            </div>
            <div className="hidden md:flex gap-6 items-center text-sm font-medium text-slate-600">
              <a href="#challenge" className="hover:text-blue-600 transition">The Challenge</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition">How it Works</a>
              <a href="#evaluation" className="hover:text-blue-600 transition">Evaluation</a>
              <button 
                onClick={onEnterDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition shadow-md"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Unusual Weather. <span className="text-blue-600">Uncertain Data.</span> <br className="hidden md:block" />
            One Intelligent Solution.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            An explainable AI system that analyses temperature, pressure, and humidity observations to distinguish genuine weather events from potential sensor and data faults.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onEnterDashboard}
              className="px-8 py-3.5 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5"
            >
              Explore Dashboard
            </button>
            <button 
              onClick={scrollToHowItWorks}
              className="px-8 py-3.5 bg-white text-slate-700 border border-slate-300 text-lg font-bold rounded-lg shadow-sm hover:bg-slate-50 hover:border-slate-400 transition"
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section id="challenge" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-sm font-bold uppercase tracking-wider mb-4">
                <AlertTriangle className="w-4 h-4" /> The Problem
              </div>
              <h2 className="text-3xl font-bold mb-4">The Trust Deficit in Automated Weather Stations</h2>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                When a remote weather station suddenly reports a 10°C temperature drop in 15 minutes, is it a severe microburst or a failing sensor? 
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-slate-100 p-1 rounded">
                    <ShieldAlert className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Ambiguous Anomalies</h4>
                    <p className="text-sm text-slate-500">Unusual readings may represent genuine weather events or faulty observations.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-slate-100 p-1 rounded">
                    <Activity className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Brittle Rules</h4>
                    <p className="text-sm text-slate-500">Single-threshold checks lack the context needed to distinguish complex faults.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-inner relative">
              <div className="absolute inset-0 bg-linear-to-tr from-transparent via-blue-50/30 to-transparent rounded-2xl pointer-events-none" />
              <img 
                src="/storm_weather_bg.jpg" 
                alt="Storm clouds over a landscape" 
                className="rounded-xl shadow-md border border-slate-200 w-full h-auto object-cover bg-slate-200 min-h-[300px]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Core Capabilities */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">How SkyGuard Works</h2>
            <p className="text-slate-600 text-lg">
              Our intelligent pipeline transforms raw historical data into actionable, explainable insights using a multi-dimensional approach.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <Database className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Historical AWS Dataset</h3>
              <p className="text-slate-600 text-sm">Validates baseline climatology and defines temporal boundaries.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <RefreshCw className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">CSV Replay Simulator</h3>
              <p className="text-slate-600 text-sm">Sequentially replays historical observations and supports controlled simulated scenarios.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <Layers className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">11-Dimensional Evidence</h3>
              <p className="text-slate-600 text-sm">Analyzes spatial, temporal, psychrometric, and seasonal characteristics of every observation.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <Cpu className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">XGBoost Classification</h3>
              <p className="text-slate-600 text-sm">Robust ensemble model trained to distinguish Genuine Weather, Uncertain data, and Sensor Faults.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <Zap className="w-8 h-8 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">SHAP Explainability</h3>
              <p className="text-slate-600 text-sm">Provides feature-level attribution so human operators understand exactly *why* a classification was made.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <CheckCircle className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Actionable Diagnosis</h3>
              <p className="text-slate-600 text-sm">Continuously tracks Sensor Data Trust and degradation risk as model-derived monitoring indicators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Highlights */}
      <section id="evaluation" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Empirical Evaluation Highlights</h2>
            <p className="text-slate-600">
              Live metrics fetched directly from the SkyGuard FastAPI backend, reflecting empirical testing on controlled datasets.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden relative flex flex-col items-center">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Server className="w-32 h-32 text-white" />
            </div>

            {metricsLoading && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-300 w-full">
                <RefreshCw className="w-8 h-8 animate-spin mb-4 text-blue-400" />
                <p>Connecting to ML Pipeline...</p>
              </div>
            )}

            {metricsError && !metrics && (
              <div className="flex flex-col items-center justify-center h-48 text-rose-300 w-full">
                <AlertTriangle className="w-8 h-8 mb-4 text-rose-500" />
                <p className="mb-4 text-center">Failed to fetch evaluation metrics from API.</p>
                <button 
                  onClick={fetchMetrics} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded shadow transition"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {!metricsLoading && !metricsError && metrics && metrics.historical_metrics && (
              <div className="grid sm:grid-cols-3 gap-6 relative z-10 w-full">
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center">
                  <div className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">Normal-Weather Recognition</div>
                  <div className="text-4xl font-bold text-white mb-2 font-mono">
                    {(metrics.historical_metrics.XGBoost.accuracy * 100).toFixed(2)}%
                  </div>
                  <p className="text-slate-400 text-xs">Clean historical test-period accuracy (contains no labeled faults).</p>
                </div>
                
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center">
                  <div className="text-purple-400 text-sm font-bold uppercase tracking-wider mb-2">Scenario Accuracy</div>
                  <div className="text-4xl font-bold text-white mb-2 font-mono">
                    {(metrics.scenario_metrics.XGBoost.accuracy * 100).toFixed(2)}%
                  </div>
                  <p className="text-slate-400 text-xs">Performance across controlled synthetic anomaly scenarios.</p>
                </div>

                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center">
                  <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Fault TPR</div>
                  <div className="text-4xl font-bold text-white mb-2 font-mono">
                    {(metrics.scenario_metrics.XGBoost.per_class["Sensor Fault"].recall * 100).toFixed(0)}%
                  </div>
                  <p className="text-slate-400 text-xs">True Positive Rate for actual sensor faults in controlled testing.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-10">Powered by Modern Technology</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {['Python', 'Pandas', 'Scikit-learn', 'XGBoost', 'SHAP', 'FastAPI', 'React', 'Vite', 'Tailwind CSS'].map(tech => (
              <div key={tech} className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-full font-semibold text-slate-700">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <CloudRain className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">SkyGuard AI</span>
          </div>
          <div className="text-center md:text-left text-sm">
            <p>Developed by AstraSphere for Smart India Hackathon 2026</p>
          </div>
          <div>
            <button 
              onClick={onEnterDashboard}
              className="text-white hover:text-blue-400 font-medium transition"
            >
              Enter Dashboard &rarr;
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
