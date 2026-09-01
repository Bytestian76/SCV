import os
import sys

# Configure UTF-8 for standard output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import threading
import functools
import http.server
import time
import webbrowser

root_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.join(root_dir, "api-services")
client_dir = os.path.join(root_dir, "client-app")

sys.path.insert(0, api_dir)

from scripts.init_db import init_database

print("===================================================================")
print("     Iniciando SCV (Sistema de Control Vehicular)")
print("===================================================================")

print("[1/3] Verificando base de datos...")
init_database()

def run_backend():
    os.chdir(api_dir)
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")

def run_frontend():
    os.chdir(client_dir)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=client_dir)
    with http.server.ThreadingHTTPServer(("0.0.0.0", 8080), handler) as httpd:
        print("[OK] Frontend sirviendo en http://localhost:8080")
        httpd.serve_forever()

print("[2/3] Iniciando Backend FastAPI en http://localhost:8000 ...")
t_backend = threading.Thread(target=run_backend, daemon=True)
t_backend.start()

print("[3/3] Iniciando Frontend React en http://localhost:8080 ...")
t_frontend = threading.Thread(target=run_frontend, daemon=True)
t_frontend.start()

time.sleep(2)

print("\n===================================================================")
print(" [OK] SCV iniciado correctamente:")
print(" - Frontend Web: http://localhost:8080")
print(" - Backend API:  http://localhost:8000")
print(" - Swagger Docs: http://localhost:8000/docs")
print("===================================================================\n")

try:
    webbrowser.open("http://localhost:8080")
except Exception as e:
    print(f"Nota: No se pudo abrir el navegador automáticamente: {e}")

# Keep main thread alive
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nDeteniendo servicios SCV...")
