# python-service/energy_service.py
"""
Python microservice for real energy measurement using CodeCarbon
Runs code and tracks actual GPU/CPU/RAM energy consumption
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from codecarbon import EmissionsTracker
import tempfile
import subprocess
import sys
import os
import time
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "codecarbon-energy-tracker",
        "version": "1.0.0"
    })

@app.route('/measure', methods=['POST'])
def measure_energy():
    """
    Execute Python code and measure real energy consumption
    """
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        stdin_input = data.get('stdin', '')
        
        # Currently only supports Python
        if language != 'python':
            return jsonify({
                "error": f"CodeCarbon only supports Python. Received: {language}",
                "supported": ["python"]
            }), 400
        
        if not code:
            return jsonify({"error": "No code provided"}), 400
        
        # Create temporary file for code execution
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Initialize CodeCarbon tracker
            tracker = EmissionsTracker(
                save_to_file=False,
                logging_logger=None,
                log_level='error'
            )
            
            # Start tracking
            tracker.start()
            start_time = time.time()
            
            # Execute the code
            try:
                result = subprocess.run(
                    [sys.executable, temp_file],
                    input=stdin_input,
                    capture_output=True,
                    text=True,
                    timeout=10  # 10 second timeout
                )
                
                execution_time = time.time() - start_time
                
                # Stop tracking
                emissions_kg = tracker.stop()
                
                # Get energy data
                energy_kwh = tracker._total_energy.kWh if hasattr(tracker, '_total_energy') else 0
                energy_wh = energy_kwh * 1000  # Convert to Wh
                energy_mj = energy_wh * 3.6    # Convert to millijoules (1 Wh = 3600 J)
                
                # Prepare response
                response = {
                    "status": "success" if result.returncode == 0 else "error",
                    "output": result.stdout,
                    "error": result.stderr if result.returncode != 0 else None,
                    "executionTime": round(execution_time * 1000, 2),  # ms
                    "energy": {
                        "total_kwh": round(energy_kwh, 6),
                        "total_wh": round(energy_wh, 4),
                        "total_mj": round(energy_mj, 2),
                        "co2_emissions_kg": round(emissions_kg, 6),
                        "co2_emissions_g": round(emissions_kg * 1000, 4)
                    },
                    "hardware": {
                        "cpu_energy": "tracked",
                        "gpu_energy": "tracked if available",
                        "ram_energy": "estimated"
                    },
                    "measurement_method": "codecarbon"
                }
                
                return jsonify(response)
                
            except subprocess.TimeoutExpired:
                tracker.stop()
                return jsonify({
                    "status": "error",
                    "error": "Execution timeout (10s limit)",
                    "output": "",
                    "executionTime": 10000
                }), 408
                
            except Exception as exec_error:
                tracker.stop()
                return jsonify({
                    "status": "error",
                    "error": f"Execution error: {str(exec_error)}",
                    "output": "",
                    "traceback": traceback.format_exc()
                }), 500
        
        finally:
            # Clean up temp file
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Service error: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

@app.route('/compare', methods=['POST'])
def compare_measurements():
    """
    Run code multiple times and provide statistical energy data
    """
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        iterations = min(data.get('iterations', 3), 10)  # Max 10 runs
        
        if language != 'python':
            return jsonify({"error": "Only Python supported"}), 400
        
        results = []
        
        for i in range(iterations):
            # Create temp file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            try:
                tracker = EmissionsTracker(save_to_file=False, logging_logger=None, log_level='error')
                tracker.start()
                start_time = time.time()
                
                result = subprocess.run(
                    [sys.executable, temp_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                execution_time = time.time() - start_time
                emissions_kg = tracker.stop()
                energy_kwh = tracker._total_energy.kWh if hasattr(tracker, '_total_energy') else 0
                
                results.append({
                    "run": i + 1,
                    "execution_time_ms": round(execution_time * 1000, 2),
                    "energy_mj": round(energy_kwh * 1000 * 3.6, 2),
                    "co2_g": round(emissions_kg * 1000, 4)
                })
                
            finally:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
        
        # Calculate averages
        avg_time = sum(r['execution_time_ms'] for r in results) / len(results)
        avg_energy = sum(r['energy_mj'] for r in results) / len(results)
        avg_co2 = sum(r['co2_g'] for r in results) / len(results)
        
        return jsonify({
            "status": "success",
            "iterations": iterations,
            "results": results,
            "averages": {
                "execution_time_ms": round(avg_time, 2),
                "energy_mj": round(avg_energy, 2),
                "co2_g": round(avg_co2, 4)
            }
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Compare error: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("🔋 CodeCarbon Energy Measurement Service")
    print("=" * 50)
    print("Starting Flask server on http://localhost:5001")
    print("Endpoints:")
    print("  - GET  /health      - Health check")
    print("  - POST /measure     - Measure single execution")
    print("  - POST /compare     - Compare multiple runs")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)