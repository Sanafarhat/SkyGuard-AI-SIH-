from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from ml.model import FEATURES
from ml.features import FeatureExtractor
from ml.explainability import Explainer
from ml.diagnostics import DiagnosticsEngine
import pandas as pd
import uvicorn
import os
import json
from pathlib import Path
import numpy as np

app = FastAPI(title="SkyGuard ML API")

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
allow_origins = ["http://localhost:5173", "http://localhost:3000", frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allow_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load global components
extractor = FeatureExtractor()

BASE_DIR = Path(__file__).resolve().parent

# Load preprocessing statistics
preprocessing_path = BASE_DIR / "models" / "skyguard_preprocessing.json"
if preprocessing_path.exists():
    with open(preprocessing_path, "r") as f:
        stats = json.load(f)
        extractor.global_means = stats.get("global_means", {})
        cov = stats.get("global_cov_inv")
        extractor.global_cov_inv = np.array(cov) if cov is not None else None
else:
    raise FileNotFoundError(f"Missing preprocessing statistics: {preprocessing_path}")

model_path = str(BASE_DIR / "models" / "skyguard_xgb.json")
explainer = Explainer(model_path)
diagnostics = DiagnosticsEngine()

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/api/metrics")
def get_metrics():
    base_dir = BASE_DIR / "evaluation"
    metrics = {}
    for filename in ["historical_metrics.json", "scenario_metrics.json", "baseline_comparison.json", "ablation_results.json"]:
        filepath = base_dir / filename
        if filepath.exists():
            with open(filepath, 'r') as f:
                name = filename.split('.')[0]
                try:
                    metrics[name] = json.load(f)
                except json.JSONDecodeError:
                    pass
    return metrics

@app.post("/api/analyze")
async def analyze_station(request: Request):
    data = await request.json()
    
    station = data.get('station', {})
    station_id = station.get('id', 'UNKNOWN')
    current = data.get('currentReading', {})
    history = data.get('history', [])
    all_stations = data.get('allStations', [])
    
    # 1. Prepare inputs
    row = {
        'station_id': station_id,
        'timestamp': pd.Timestamp.now(), # Or get from data if available
        'temperature_c': current.get('temperature'),
        'relative_humidity_pct': current.get('humidity'),
        'pressure_hpa': current.get('pressure')
    }
    
    # Convert history
    hist_formatted = []
    for h in history:
        hist_formatted.append({
            'temperature_c': h.get('temperature'),
            'relative_humidity_pct': h.get('humidity'),
            'pressure_hpa': h.get('pressure'),
            'timestamp': pd.to_datetime(h.get('timestamp')) if h.get('timestamp') else pd.Timestamp.now()
        })
        
    latest_spatial = {}
    for st in all_stations:
        latest_spatial[st.get('id')] = {
            'temperature_c': st.get('temperature'),
            'pressure_hpa': st.get('pressure'),
            'relative_humidity_pct': st.get('humidity')
        }
        
    # 2. Extract Evidence Vector
    ev = extractor.compute_evidence(row, hist_formatted, latest_spatial)
    
    # 3. Predict (Multiclass: 0=Genuine, 1=Uncertain, 2=Fault)
    df_ev = pd.DataFrame([ev], columns=FEATURES)
    probs = explainer.model.predict_proba(df_ev)[0]
    prob_normal = float(probs[0])
    prob_uncertain = float(probs[1]) if len(probs) > 2 else 0.0
    prob_fault = float(probs[2]) if len(probs) > 2 else float(probs[1])
    
    # Get predicted class (argmax)
    pred_class = int(probs.argmax())
    
    if pred_class == 2: # Fault
        classification = 'sensor_fault'
        anomaly_detected = True
        severity = 'critical' if prob_fault > 0.8 else 'warning'
        conf = prob_fault
    elif pred_class == 1: # Uncertain
        classification = 'uncertain'
        anomaly_detected = True
        severity = 'warning'
        conf = prob_uncertain
    else: # Genuine
        classification = 'genuine_weather'
        anomaly_detected = False
        severity = 'info'
        conf = prob_normal
        
    # 4. Explain (Use SHAP values for the predicted class if multiclass)
    shap_vals = explainer.explain(ev, pred_class)
    
    # 5. Diagnostics
    root_cause = diagnostics.get_root_cause(ev, pred_class, shap_vals)
    trust_result = diagnostics.calculate_sensor_trust(station_id, station.get('sensorTrust', {}).get('trust_score'), pred_class, ev)
    degradation_result = diagnostics.calculate_degradation(station_id, pred_class, ev, root_cause)
    
    result = {
        "anomalyDetected": anomaly_detected,
        "classification": classification,
        "probabilities": {
            "genuine_weather": prob_normal,
            "uncertain": prob_uncertain,
            "sensor_fault": prob_fault
        },
        "rootCause": root_cause,
        "anomalyType": root_cause,
        "severity": severity,
        "confidence": conf * 100,
        "affectedSensor": "temperature" if root_cause != "Normal Conditions" else None,
        "observedValue": row['temperature_c'],
        "estimatedCorrectValue": None,
        "unit": "°C",
        "evidenceVector": {
            "temporal": float(ev.get("S_temporal", 0)),
            "seasonal": float(ev.get("S_seasonal", 0)),
            "change": float(ev.get("S_change", 0)),
            "multivariate": float(ev.get("S_multivariate", 0)),
            "spatial": float(ev.get("S_spatial", 0)),
            "history": float(ev.get("S_history", 0)),
            "physics": float(ev.get("S_physics", 0)),
            "spatial_coherence": float(ev.get("C_spatial", 0)),
            "temporal_coherence": float(ev.get("C_temporal", 0)),
            "multivariate_coherence": float(ev.get("C_multivariate", 0)),
            "persistence": float(ev.get("P_persistence", 0))
        },
        "evidence": [], # Optional UI format
        "shapContributions": shap_vals,
        "sensorTrust": trust_result,
        "degradation": degradation_result,
        "correction": {
            "isCorrected": False,
            "originalValue": row['temperature_c'],
            "correctedValue": row['temperature_c']
        },
        "explanation": f"ML pipeline diagnosed as {root_cause}",
        "recommendedAction": "Monitor" if not anomaly_detected else "Investigate sensor"
    }
    
    return result

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
