import urllib.request
import json

def test_api():
    print("1. Probando Health...")
    with urllib.request.urlopen("http://127.0.0.1:8000/health") as res:
        print("Health Response:", res.read().decode())

    print("\n2. Probando Login...")
    payload = json.dumps({"email": "admin@normetales.com", "password": "admin123"}).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/auth/login",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as res:
        login_data = json.loads(res.read().decode())
        token = login_data["access_token"]
        print("Login exitoso! Token obtenido para:", login_data["nombre"])

    print("\n3. Probando Dashboard Summary...")
    req_dash = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/dashboard/summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req_dash) as res:
        dash_data = json.loads(res.read().decode())
        print("KPIs vivos en DB:", json.dumps(dash_data["kpis"], indent=2))
        print("Vehículos por estado:", json.dumps(dash_data["vehiculos_por_estado"], indent=2))

if __name__ == "__main__":
    test_api()
