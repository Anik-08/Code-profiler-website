# python-service/energy_service.py
"""
Multi-language energy measurement service
- Python: CodeCarbon (real hardware tracking)
- JavaScript/C++/Java: System process monitoring
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
import psutil
import platform

app = Flask(__name__)
CORS(app)

def estimate_energy_from_metrics(cpu_percent, memory_mb, duration_sec):
    """
    Estimate energy consumption from CPU/memory metrics
    Rough estimates based on typical hardware:
    - CPU: ~65W TDP, scales with usage
    - RAM: ~3W per 8GB
    """
    # CPU energy (assuming 65W TDP at 100% usage)
    cpu_power_watts = (cpu_percent / 100.0) * 65.0
    cpu_energy_joules = cpu_power_watts * duration_sec
    
    # RAM energy (3W per 8GB)
    ram_power_watts = (memory_mb / 8192.0) * 3.0
    ram_energy_joules = ram_power_watts * duration_sec
    
    # Total energy
    total_joules = cpu_energy_joules + ram_energy_joules
    total_kwh = total_joules / 3600000.0  # J to kWh
    total_wh = total_kwh * 1000
    total_mj = total_joules  # 1J = 1mJ for simplicity
    
    # CO2 estimate (using global average ~475g CO2/kWh)
    co2_kg = total_kwh * 0.475
    
    return {
        "total_kwh": round(total_kwh, 8),
        "total_wh": round(total_wh, 6),
        "total_mj": round(total_mj, 2),
        "co2_emissions_kg": round(co2_kg, 8),
        "co2_emissions_g": round(co2_kg * 1000, 6)
    }

def measure_javascript_energy(code, stdin_input=""):
    """Measure JavaScript energy using Node.js and process monitoring"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        start_time = time.time()
        
        # Start process
        process = subprocess.Popen(
            ['node', temp_file],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Monitor process
        ps_process = psutil.Process(process.pid)
        cpu_samples = []
        memory_samples = []
        
        # Communicate with timeout
        try:
            stdout, stderr = process.communicate(input=stdin_input, timeout=10)
            
            # Get final metrics
            try:
                cpu_percent = ps_process.cpu_percent(interval=0.1)
                memory_mb = ps_process.memory_info().rss / 1024 / 1024
                cpu_samples.append(cpu_percent)
                memory_samples.append(memory_mb)
            except psutil.NoSuchProcess:
                cpu_percent = 5.0  # Default estimate
                memory_mb = 50.0
        
        except subprocess.TimeoutExpired:
            process.kill()
            return None, "Execution timeout (10s limit)"
        
        execution_time = time.time() - start_time
        
        # Calculate averages
        avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 5.0
        avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 50.0
        
        # Estimate energy
        energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
        
        return {
            "status": "success" if process.returncode == 0 else "error",
            "output": stdout,
            "error": stderr if process.returncode != 0 else None,
            "executionTime": round(execution_time * 1000, 2),
            "energy": energy,
            "hardware": {
                "cpu_energy": "estimated from process metrics",
                "gpu_energy": "not tracked",
                "ram_energy": "estimated"
            },
            "measurement_method": "system-metrics"
        }, None
        
    finally:
        if os.path.exists(temp_file):
            os.unlink(temp_file)

def measure_cpp_energy(code, stdin_input=""):
    """Measure C++ energy using g++ and process monitoring"""
    # Create temp source file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
        f.write(code)
        source_file = f.name
    
    # Create temp executable
    executable = tempfile.mktemp(suffix='.exe' if platform.system() == 'Windows' else '')
    
    try:
        # Compile
        compile_result = subprocess.run(
            ['g++', source_file, '-o', executable, '-std=c++17'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile_result.returncode != 0:
            return {
                "status": "error",
                "error": f"Compilation error: {compile_result.stderr}",
                "output": "",
                "executionTime": 0
            }, None
        
        # Execute and monitor
        start_time = time.time()
        process = subprocess.Popen(
            [executable],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        ps_process = psutil.Process(process.pid)
        cpu_samples = []
        memory_samples = []
        
        try:
            stdout, stderr = process.communicate(input=stdin_input, timeout=10)
            
            try:
                cpu_percent = ps_process.cpu_percent(interval=0.1)
                memory_mb = ps_process.memory_info().rss / 1024 / 1024
                cpu_samples.append(cpu_percent)
                memory_samples.append(memory_mb)
            except psutil.NoSuchProcess:
                cpu_percent = 8.0
                memory_mb = 10.0
        
        except subprocess.TimeoutExpired:
            process.kill()
            return None, "Execution timeout (10s limit)"
        
        execution_time = time.time() - start_time
        
        avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 8.0
        avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 10.0
        
        energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
        
        return {
            "status": "success" if process.returncode == 0 else "error",
            "output": stdout,
            "error": stderr if process.returncode != 0 else None,
            "executionTime": round(execution_time * 1000, 2),
            "energy": energy,
            "hardware": {
                "cpu_energy": "estimated from process metrics",
                "gpu_energy": "not tracked",
                "ram_energy": "estimated"
            },
            "measurement_method": "system-metrics"
        }, None
        
    finally:
        if os.path.exists(source_file):
            os.unlink(source_file)
        if os.path.exists(executable):
            os.unlink(executable)

def measure_java_energy(code, stdin_input=""):
    """Measure Java energy using javac/java and process monitoring"""
    # Create temp source file
    with tempfile.TemporaryDirectory() as tmpdir:
        source_file = os.path.join(tmpdir, 'Main.java')
        with open(source_file, 'w') as f:
            f.write(code)
        
        try:
            # Compile
            compile_result = subprocess.run(
                ['javac', source_file],
                capture_output=True,
                text=True,
                timeout=10,
                cwd=tmpdir
            )
            
            if compile_result.returncode != 0:
                return {
                    "status": "error",
                    "error": f"Compilation error: {compile_result.stderr}",
                    "output": "",
                    "executionTime": 0
                }, None
            
            # Execute and monitor
            start_time = time.time()
            process = subprocess.Popen(
                ['java', 'Main'],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=tmpdir
            )
            
            ps_process = psutil.Process(process.pid)
            cpu_samples = []
            memory_samples = []
            
            try:
                stdout, stderr = process.communicate(input=stdin_input, timeout=10)
                
                try:
                    cpu_percent = ps_process.cpu_percent(interval=0.1)
                    memory_mb = ps_process.memory_info().rss / 1024 / 1024
                    cpu_samples.append(cpu_percent)
                    memory_samples.append(memory_mb)
                except psutil.NoSuchProcess:
                    cpu_percent = 10.0
                    memory_mb = 80.0  # Java has higher memory overhead
            
            except subprocess.TimeoutExpired:
                process.kill()
                return None, "Execution timeout (10s limit)"
            
            execution_time = time.time() - start_time
            
            avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 10.0
            avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 80.0
            
            energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
            
            return {
                "status": "success" if process.returncode == 0 else "error",
                "output": stdout,
                "error": stderr if process.returncode != 0 else None,
                "executionTime": round(execution_time * 1000, 2),
                "energy": energy,
                "hardware": {
                    "cpu_energy": "estimated from process metrics",
                    "gpu_energy": "not tracked",
                    "ram_energy": "estimated (includes JVM overhead)"
                },
                "measurement_method": "system-metrics"
            }, None
            
        except Exception as e:
            return None, f"Java execution error: {str(e)}"

def measure_python_energy(code, stdin_input=""):
    """Measure Python energy using CodeCarbon (real hardware tracking)"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        tracker = EmissionsTracker(save_to_file=False, logging_logger=None, log_level='error')
        tracker.start()
        start_time = time.time()
        
        result = subprocess.run(
            [sys.executable, temp_file],
            input=stdin_input,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        execution_time = time.time() - start_time
        emissions_kg = tracker.stop()
        energy_kwh = tracker._total_energy.kWh if hasattr(tracker, '_total_energy') else 0
        energy_wh = energy_kwh * 1000
        energy_mj = energy_wh * 3.6
        
        return {
            "status": "success" if result.returncode == 0 else "error",
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None,
            "executionTime": round(execution_time * 1000, 2),
            "energy": {
                "total_kwh": round(energy_kwh, 8),
                "total_wh": round(energy_wh, 6),
                "total_mj": round(energy_mj, 2),
                "co2_emissions_kg": round(emissions_kg, 8),
                "co2_emissions_g": round(emissions_kg * 1000, 6)
            },
            "hardware": {
                "cpu_energy": "tracked via RAPL/TDP",
                "gpu_energy": "tracked if NVIDIA GPU available",
                "ram_energy": "estimated"
            },
            "measurement_method": "codecarbon"
        }, None
        
    except subprocess.TimeoutExpired:
        tracker.stop()
        return None, "Execution timeout (10s limit)"
    except Exception as e:
        return None, f"Python execution error: {str(e)}"
    finally:
        if os.path.exists(temp_file):
            os.unlink(temp_file)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "multi-language-energy-tracker",
        "version": "2.0.0",
        "supported_languages": ["python", "javascript", "cpp", "java"]
    })

@app.route('/measure', methods=['POST'])
def measure_energy():
    """Execute code and measure real energy consumption"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        stdin_input = data.get('stdin', '')
        
        if not code:
            return jsonify({"error": "No code provided"}), 400
        
        # Route to appropriate measurement function
        if language == 'python':
            result, error = measure_python_energy(code, stdin_input)
        elif language == 'javascript':
            result, error = measure_javascript_energy(code, stdin_input)
        elif language == 'cpp':
            result, error = measure_cpp_energy(code, stdin_input)
        elif language == 'java':
            result, error = measure_java_energy(code, stdin_input)
        else:
            return jsonify({
                "error": f"Unsupported language: {language}",
                "supported": ["python", "javascript", "cpp", "java"]
            }), 400
        
        if error:
            return jsonify({"status": "error", "error": error}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Service error: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("🔋 Multi-Language Energy Measurement Service")
    print("=" * 50)
    print("Starting Flask server on http://localhost:5001")
    print("Supported Languages:")
    print("  - Python (CodeCarbon - Real Hardware)")
    print("  - JavaScript (Process Monitoring)")
    print("  - C++ (Process Monitoring)")
    print("  - Java (Process Monitoring)")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)