# CodeCarbon Energy Measurement Service

Python microservice for real hardware energy measurement.

## Setup

1. Create virtual environment:
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run service:
```bash
python energy_service.py
```

Service will run on `http://localhost:5001`

## API Endpoints

### POST /measure
Measure energy consumption for single code execution.

**Request:**
```json
{
  "language": "python",
  "code": "print('Hello World')",
  "stdin": ""
}
```

**Response:**
```json
{
  "status": "success",
  "output": "Hello World\n",
  "executionTime": 45.2,
  "energy": {
    "total_kwh": 0.000012,
    "total_wh": 0.012,
    "total_mj": 0.043,
    "co2_emissions_kg": 0.000005,
    "co2_emissions_g": 0.005
  }
}
```

### POST /compare
Run code multiple times for statistical comparison.

**Request:**
```json
{
  "language": "python",
  "code": "sum(range(1000000))",
  "iterations": 5
}
```