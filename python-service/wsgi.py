# python-service/wsgi.py
from energy_service import app

if __name__ == "__main__":
    app.run()